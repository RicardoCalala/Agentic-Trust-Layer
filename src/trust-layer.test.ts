import assert from "node:assert/strict";
import test from "node:test";
import { TrustLayer } from "./trust-layer.js";

const rules = [
  { id: "read-internal", effect: "allow" as const, agents: ["research-agent"], actions: ["read"], resources: ["knowledge-base"], classifications: ["internal" as const], reason: "Read-only research is allowed." },
  { id: "deny-delete", effect: "deny" as const, agents: ["*"], actions: ["delete"], resources: ["*"], reason: "Deletes are denied." },
  { id: "human-on-send", effect: "require_approval" as const, agents: ["support-agent"], actions: ["send"], resources: ["customer-email"], classifications: ["confidential" as const], reason: "External customer contact requires a reviewer." },
];

test("allows an explicitly authorized tool and data request", () => {
  const layer = new TrustLayer(rules);
  const result = layer.authorize({ agentId: "research-agent", action: "read", resource: "knowledge-base", dataClassification: "internal" });
  assert.deepEqual(result, { effect: "allow", reason: "Read-only research is allowed.", matchedRuleId: "read-internal" });
});

test("denies requests that do not match a policy", () => {
  const layer = new TrustLayer(rules);
  const result = layer.authorize({ agentId: "research-agent", action: "write", resource: "knowledge-base", dataClassification: "internal" });
  assert.equal("effect" in result && result.effect, "deny");
});

test("deny overrides a broader allow when both match", () => {
  const layer = new TrustLayer([
    { id: "allow-all-read", effect: "allow", agents: ["*"], actions: ["read"], resources: ["*"], reason: "Broad allow." },
    { id: "deny-secrets", effect: "deny", agents: ["*"], actions: ["read"], resources: ["secrets"], reason: "Secrets are denied." },
  ]);
  const result = layer.authorize({ agentId: "research-agent", action: "read", resource: "secrets" });
  assert.deepEqual(result, { effect: "deny", reason: "Secrets are denied.", matchedRuleId: "deny-secrets" });
});

test("rejects unclassified requests against classification-scoped rules", () => {
  const layer = new TrustLayer(rules);
  const result = layer.authorize({ agentId: "research-agent", action: "read", resource: "knowledge-base" });
  assert.equal("effect" in result && result.effect, "deny");
});

test("denies invalid request input and still records an audit event", () => {
  const layer = new TrustLayer(rules);
  const result = layer.authorize({ agentId: "", action: "read", resource: "knowledge-base", dataClassification: "internal" });
  assert.equal("effect" in result && result.effect, "deny");
  assert.equal(layer.audit.all().length, 1);
  assert.equal(layer.audit.verify(), true);
});

test("holds consequential actions for approval, audits resolution, and preserves integrity", () => {
  const layer = new TrustLayer(rules);
  const result = layer.authorize({ agentId: "support-agent", action: "send", resource: "customer-email", dataClassification: "confidential" }, "approval-1");
  assert.equal("status" in result && result.status, "pending");
  const resolved = layer.resolveApproval("approval-1", true, "security-reviewer");
  assert.equal(resolved.status, "approved");
  assert.equal(layer.audit.all().length, 2);
  assert.equal(layer.audit.all()[1].kind, "approval_resolution");
  assert.equal(layer.audit.verify(), true);
});

test("refuses to overwrite an existing approval id", () => {
  const layer = new TrustLayer(rules);
  layer.authorize({ agentId: "support-agent", action: "send", resource: "customer-email", dataClassification: "confidential" }, "approval-1");
  assert.throws(
    () => layer.authorize({ agentId: "support-agent", action: "send", resource: "customer-email", dataClassification: "confidential" }, "approval-1"),
    /already exists/,
  );
});

test("retains approval and audit evidence when policies are replaced", () => {
  const trustLayer = new TrustLayer([rules[2]]);
  const sensitiveRequest = { agentId: "support-agent", action: "send", resource: "customer-email", dataClassification: "confidential" as const };
  const approval = trustLayer.authorize(sensitiveRequest, "approval-keep");
  assert.equal("status" in approval && approval.status, "pending");
  const initialEvents = trustLayer.audit.all().length;

  trustLayer.replacePolicies([{ ...rules[2], effect: "deny", reason: "New policy blocks this action." }]);

  assert.equal(trustLayer.listApprovals("pending").length, 1);
  assert.equal(trustLayer.audit.all().length, initialEvents);
  assert.equal(trustLayer.audit.verify(), true);
  const decision = trustLayer.authorize(sensitiveRequest);
  assert.equal("effect" in decision && decision.effect, "deny");
});

test("returns defensive copies of audit events", () => {
  const layer = new TrustLayer(rules);
  layer.authorize({ agentId: "research-agent", action: "read", resource: "knowledge-base", dataClassification: "internal" });
  const events = layer.audit.all();
  events[0].decision.reason = "tampered";
  assert.equal(layer.audit.all()[0].decision.reason, "Read-only research is allowed.");
  assert.equal(layer.audit.verify(), true);
});
