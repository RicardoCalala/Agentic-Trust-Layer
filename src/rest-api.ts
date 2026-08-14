import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import type { PolicyRule, AgentRequest } from "./types.js";
import { validatePolicyRules } from "./types.js";
import { TrustLayer } from "./trust-layer.js";
import type { EncryptedAuditStore } from "./encrypted-audit-store.js";

export interface TenantPrincipal { tenantId: string; subject: string; scopes: string[]; }
export interface IdentityProvider { authenticate(token: string): TenantPrincipal | undefined; }
export interface CentralLogSink { emit(event: { tenantId: string; type: string; occurredAt: string; details: Record<string, unknown> }): Promise<void> | void; }
export interface RestApiOptions { identityProvider: IdentityProvider; auditStore: EncryptedAuditStore; centralLog?: CentralLogSink; defaultPolicies?: PolicyRule[]; }
type TenantState = { layer: TrustLayer; policies: PolicyRule[]; written: number };

/** Generic HS256 JWT verifier for a tenant-aware identity provider or API gateway. */
export class Hs256TenantIdentityProvider implements IdentityProvider {
  constructor(private readonly secret: string, private readonly issuer?: string, private readonly audience?: string) { if (secret.length < 32) throw new Error("JWT secret must be at least 32 characters."); }
  authenticate(token: string): TenantPrincipal | undefined {
    const [header, payload, signature] = token.split("."); if (!header || !payload || !signature) return undefined;
    const expected = createHmac("sha256", this.secret).update(`${header}.${payload}`).digest("base64url");
    if (!safeEqual(expected, signature)) return undefined;
    try { const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
      if (claims.exp !== undefined && Number(claims.exp) * 1000 <= Date.now()) return undefined;
      if (this.issuer && claims.iss !== this.issuer) return undefined; if (this.audience && claims.aud !== this.audience) return undefined;
      const tenantId = typeof claims.tenant_id === "string" ? claims.tenant_id : ""; const subject = typeof claims.sub === "string" ? claims.sub : "";
      const scopes = typeof claims.scope === "string" ? claims.scope.split(" ") : Array.isArray(claims.scopes) ? claims.scopes.filter((s): s is string => typeof s === "string") : [];
      return tenantId && subject ? { tenantId, subject, scopes } : undefined;
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
      if (method === "GET" && path === "/v1/health") return send(response, 200, { status: "ok", tenantId: principal.tenantId });
      if (method === "GET" && path === "/v1/policies") return send(response, 200, { policies: state.policies });
      if (method === "PUT" && path === "/v1/policies") { requireScope(principal, "policies:write"); const body = await json(request) as { policies?: PolicyRule[] }; validatePolicyRules(body.policies ?? []); state.policies = structuredClone(body.policies ?? []); state.layer = new TrustLayer(state.policies); return send(response, 200, { policies: state.policies }); }
      if (method === "POST" && path === "/v1/authorize") { requireScope(principal, "actions:authorize"); const result = state.layer.authorize(await json(request) as AgentRequest, randomUUID()); await persistLatest(state, principal, options, "authorization"); return send(response, 200, result); }
      if (method === "GET" && path === "/v1/approvals") { requireScope(principal, "approvals:read"); return send(response, 200, { approvals: state.layer.listApprovals("pending") }); }
      const approval = path.match(/^\/v1\/approvals\/([^/]+)$/);
      if (method === "POST" && approval) { requireScope(principal, "approvals:resolve"); const body = await json(request) as { approved?: boolean }; const result = state.layer.resolveApproval(decodeURIComponent(approval[1]), body.approved === true, principal.subject); await persistLatest(state, principal, options, "approval_resolution"); return send(response, 200, result); }
      if (method === "GET" && path === "/v1/audit/verify") { requireScope(principal, "audit:read"); return send(response, 200, { integrityVerified: state.layer.audit.verify(), eventCount: state.layer.audit.all().length }); }
      return send(response, 404, { error: "Route not found." });
    } catch (error) { return send(response, error instanceof ScopeError ? 403 : 400, { error: error instanceof Error ? error.message : "Request failed." }); }
  });
}
async function persistLatest(state: TenantState, principal: TenantPrincipal, options: RestApiOptions, type: string) { const event = state.layer.audit.all().at(-1); if (!event || state.written >= state.layer.audit.all().length) return; await options.auditStore.append(principal.tenantId, event); state.written += 1; await options.centralLog?.emit({ tenantId: principal.tenantId, type, occurredAt: event.timestamp, details: { eventId: event.id, hash: event.hash, effect: event.decision.effect } }); }
function authenticate(request: IncomingMessage, provider: IdentityProvider) { const value = request.headers.authorization; return value?.startsWith("Bearer ") ? provider.authenticate(value.slice(7)) : undefined; }
function requireScope(principal: TenantPrincipal, scope: string) { if (!principal.scopes.includes(scope)) throw new ScopeError(`Missing required scope: ${scope}`); }
class ScopeError extends Error {}
async function json(request: IncomingMessage): Promise<unknown> { let data = ""; for await (const chunk of request) { data += chunk; if (data.length > 1_000_000) throw new Error("Request body too large."); } try { return data ? JSON.parse(data) : {}; } catch { throw new Error("Request body must be valid JSON."); } }
function send(response: ServerResponse, status: number, value: unknown) { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); response.end(JSON.stringify(value)); }
function safeEqual(left: string, right: string) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
