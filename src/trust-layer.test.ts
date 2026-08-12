import assert from "node:assert/strict";
import test from "node:test";
import { TrustLayer } from "./trust-layer.js";

const layer = new TrustLayer([
  { id: "read-internal", effect: "allow", agents: ["research-agent"], actions: ["read"], resources: ["knowledge-base"], classifications: ["internal"], reason: "Read-only research is allowed." },
  { id: "human-on-send", effect: "require_approval", agents: ["support-agent"], actions: ["send"], resources: ["customer-email"], classifications: ["confidential"], reason: "External customer contact requires a reviewer." },
]);

test("allows an explicitly authorized tool and data request", () => {
  const result = layer.authorize({ agentId: "research-agent", action: "read", resource: "knowledge-base", dataClassification: "internal" });
  assert.deepEqual(result, { effect: "allow", reason: "Read-only research is allowed.", matchedRuleId: "read-internal" });
});

test("denies requests that do not match a policy", () => {
  const result = layer.authorize({ agentId: "research-agent", action: "delete", resource: "knowledge-base", dataClassification: "internal" });
  assert.equal("effect" in result && result.effect, "deny");
});

test("holds consequential actions for approval and preserves audit integrity", () => {
  const result = layer.authorize({ agentId: "support-agent", action: "send", resource: "customer-email", dataClassification: "confidential" }, "approval-1");
  assert.equal("status" in result && result.status, "pending");
  const resolved = layer.approvals.resolve("approval-1", true, "security-reviewer");
  assert.equal(resolved.status, "approved");
  assert.equal(layer.audit.verify(), true);
});
