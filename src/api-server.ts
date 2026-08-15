import { Hs256TenantIdentityProvider, createRestApi } from "./rest-api.js";
import { EncryptedAuditStore } from "./encrypted-audit-store.js";
import type { PolicyRule } from "./types.js";

const jwtSecret = process.env.TRUST_LAYER_JWT_SECRET?.trim();
const auditKey = process.env.TRUST_LAYER_AUDIT_KEY_BASE64?.trim();
const issuer = process.env.TRUST_LAYER_JWT_ISSUER?.trim();
const audience = process.env.TRUST_LAYER_JWT_AUDIENCE?.trim();
if (!jwtSecret || !auditKey || !issuer || !audience) {
  throw new Error("Set TRUST_LAYER_JWT_SECRET, TRUST_LAYER_AUDIT_KEY_BASE64, TRUST_LAYER_JWT_ISSUER, and TRUST_LAYER_JWT_AUDIENCE before starting the REST API.");
}
const key = Buffer.from(auditKey, "base64");
if (key.length !== 32) throw new Error("TRUST_LAYER_AUDIT_KEY_BASE64 must decode to exactly 32 bytes.");
const policies: PolicyRule[] = [{ id: "default-read", effect: "allow", agents: ["*"], actions: ["read"], resources: ["knowledge-base"], classifications: ["public", "internal"], reason: "Approved knowledge access is permitted." }];
const server = createRestApi({
  identityProvider: new Hs256TenantIdentityProvider(jwtSecret, issuer, audience),
  auditStore: new EncryptedAuditStore({ filePath: process.env.TRUST_LAYER_AUDIT_PATH ?? "./data/audit-events.enc.jsonl", key }),
  resourceRegistry: { classificationFor: (_tenantId, resource) => resource === "knowledge-base" ? "internal" : undefined },
  centralLog: { emit: (event) => console.info(JSON.stringify({ service: "agentic-trust-layer", ...event })) },
  defaultPolicies: policies,
});
const port = Number(process.env.PORT ?? 8787);
server.listen(port, () => console.info(`Agentic Trust Layer REST API listening on ${port}`));
