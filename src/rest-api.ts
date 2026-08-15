import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import type { PolicyRule, AgentRequest, DataClassification } from "./types.js";
import { validatePolicyRules } from "./types.js";
import { TrustLayer } from "./trust-layer.js";
import type { EncryptedAuditStore } from "./encrypted-audit-store.js";

export interface TenantPrincipal { tenantId: string; subject: string; scopes: string[]; agentIds: string[]; }
export interface IdentityProvider { authenticate(token: string): TenantPrincipal | undefined; }
export interface CentralLogSink { emit(event: { tenantId: string; type: string; occurredAt: string; details: Record<string, unknown> }): Promise<void> | void; }
export interface ResourceRegistry { classificationFor(tenantId: string, resource: string): DataClassification | undefined; }
export interface RestApiOptions { identityProvider: IdentityProvider; auditStore: EncryptedAuditStore; resourceRegistry: ResourceRegistry; centralLog?: CentralLogSink; defaultPolicies?: PolicyRule[]; }
type TenantState = { layer: TrustLayer; policies: PolicyRule[]; written: number };

/** Generic HS256 JWT verifier for a tenant-aware identity provider or API gateway. */
export class Hs256TenantIdentityProvider implements IdentityProvider {
  constructor(private readonly secret: string, private readonly issuer?: string, private readonly audience?: string) { if (secret.length < 32) throw new Error("JWT secret must be at least 32 characters."); }
  authenticate(token: string): TenantPrincipal | undefined {
    const [header, payload, signature] = token.split("."); if (!header || !payload || !signature) return undefined;
    const expected = createHmac("sha256", this.secret).update(`${header}.${payload}`).digest("base64url");
    if (!safeEqual(expected, signature)) return undefined;
    try { const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
      if (!Number.isFinite(Number(claims.exp)) || Number(claims.exp) * 1000 <= Date.now()) return undefined;
      if (claims.nbf !== undefined && Number(claims.nbf) * 1000 > Date.now()) return undefined;
      if (this.issuer && claims.iss !== this.issuer) return undefined; if (this.audience && claims.aud !== this.audience) return undefined;
      const tenantId = typeof claims.tenant_id === "string" ? claims.tenant_id : ""; const subject = typeof claims.sub === "string" ? claims.sub : "";
      const scopes = typeof claims.scope === "string" ? claims.scope.split(" ").filter(Boolean) : Array.isArray(claims.scopes) ? claims.scopes.filter((s): s is string => typeof s === "string") : [];
      const agentIds = Array.isArray(claims.agent_ids) ? claims.agent_ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0) : typeof claims.agent_id === "string" && claims.agent_id.trim() ? [claims.agent_id] : [];
      return tenantId && subject && agentIds.length > 0 ? { tenantId, subject, scopes, agentIds } : undefined;
    } catch { return undefined; }
  }
}

export function createRestApi(options: RestApiOptions) {
  const tenants = new Map<string, TenantState>();
  const stateFor = (tenantId: string) => { let state = tenants.get(tenantId); if (!state) { const policies = structuredClone(options.defaultPolicies ?? []); state = { policies, layer: new TrustLayer(policies), written: 0 }; tenants.set(tenantId, state); } return state; };
  return createServer(async (request, response) => {
    try {
      const principal = authenticate(request, options.identityProvider); if (!principal) return send(response, 401, { error: "Unauthenticated tenant request." });
      const method = request.method ?? "GET"; const path = new URL(request.url ?? "/", "http://localhost").pathname; const state = stateFor(principal.tenantId);
      await syncAudit(state, principal, options);
      if (method === "GET" && path === "/v1/health") return send(response, 200, { status: "ok", tenantId: principal.tenantId });
      if (method === "GET" && path === "/v1/policies") { requireScope(principal, "policies:read"); return send(response, 200, { policies: state.policies }); }
      if (method === "PUT" && path === "/v1/policies") { requireScope(principal, "policies:write"); const body = await json(request) as { policies?: PolicyRule[] }; if (!Array.isArray(body.policies)) throw new Error("policies must be an array."); validatePolicyRules(body.policies); state.policies = structuredClone(body.policies); state.layer.replacePolicies(state.policies, principal.subject); await syncAudit(state, principal, options); return send(response, 200, { policies: state.policies }); }
      if (method === "POST" && path === "/v1/authorize") { requireScope(principal, "actions:authorize"); const result = state.layer.authorize(trustedRequest(principal, await json(request), options.resourceRegistry), randomUUID(), principal.subject); await syncAudit(state, principal, options); return send(response, 200, result); }
      if (method === "GET" && path === "/v1/approvals") { requireScope(principal, "approvals:read"); return send(response, 200, { approvals: state.layer.listApprovals("pending") }); }
      const approval = path.match(/^\/v1\/approvals\/([^/]+)$/);
      if (method === "POST" && approval) { requireScope(principal, "approvals:resolve"); const body = await json(request) as { approved?: unknown }; if (typeof body.approved !== "boolean") throw new Error("approved must be a boolean."); const result = state.layer.resolveApproval(decodeURIComponent(approval[1]), body.approved, principal.subject); await syncAudit(state, principal, options); return send(response, 200, result); }
      if (method === "GET" && path === "/v1/audit/verify") { requireScope(principal, "audit:read"); return send(response, 200, { integrityVerified: state.layer.audit.verify(), eventCount: state.layer.audit.all().length }); }
      return send(response, 404, { error: "Route not found." });
    } catch (error) { return send(response, error instanceof ScopeError ? 403 : 400, { error: error instanceof Error ? error.message : "Request failed." }); }
  });
}
async function syncAudit(state: TenantState, principal: TenantPrincipal, options: RestApiOptions) { const events = state.layer.audit.all(); for (const event of events.slice(state.written)) { await options.auditStore.append(principal.tenantId, event); state.written += 1; await options.centralLog?.emit({ tenantId: principal.tenantId, type: event.kind, occurredAt: event.timestamp, details: { eventId: event.id, hash: event.hash, effect: event.decision.effect } }); } }
function trustedRequest(principal: TenantPrincipal, value: unknown, registry: ResourceRegistry): AgentRequest { const request = value as AgentRequest; if (!request || typeof request !== "object" || !principal.agentIds.includes(request.agentId)) throw new ScopeError("Agent identity is not authorized for this workload."); const classification = registry.classificationFor(principal.tenantId, request.resource); if (!classification) throw new Error("Resource is not registered for this tenant."); if (request.dataClassification !== undefined && request.dataClassification !== classification) throw new Error("Caller-supplied data classification conflicts with the registered resource classification."); return { ...request, dataClassification: classification }; }
function authenticate(request: IncomingMessage, provider: IdentityProvider) { const value = request.headers.authorization; return value?.startsWith("Bearer ") ? provider.authenticate(value.slice(7)) : undefined; }
function requireScope(principal: TenantPrincipal, scope: string) { if (!principal.scopes.includes(scope)) throw new ScopeError(`Missing required scope: ${scope}`); }
class ScopeError extends Error {}
async function json(request: IncomingMessage): Promise<unknown> { let data = ""; for await (const chunk of request) { data += chunk; if (data.length > 1_000_000) throw new Error("Request body too large."); } try { return data ? JSON.parse(data) : {}; } catch { throw new Error("Request body must be valid JSON."); } }
function send(response: ServerResponse, status: number, value: unknown) { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "x-frame-options": "DENY", "referrer-policy": "no-referrer", "permissions-policy": "geolocation=(), microphone=(), camera=()" }); response.end(JSON.stringify(value)); }
function safeEqual(left: string, right: string) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
