import { randomUUID } from "node:crypto";
import { ApprovalGate, type ApprovalRequest } from "./approval-gate.js";
import { AuditLog } from "./audit-log.js";
import { PolicyEngine } from "./policy-engine.js";
import type { AgentRequest, Decision, PolicyRule } from "./types.js";
import { validateAgentRequest } from "./types.js";

export class TrustLayer {
  readonly approvals = new ApprovalGate();
  readonly audit = new AuditLog();
  private policy: PolicyEngine;

  constructor(rules: PolicyRule[]) {
    this.policy = new PolicyEngine(rules);
  }

  authorize(request: AgentRequest, approvalId: string = randomUUID()): Decision | ApprovalRequest {
    this.assertAuditIntegrity();

    const validationError = validateAgentRequest(request);
    if (validationError) {
      const decision: Decision = { effect: "deny", reason: validationError };
      this.audit.append(sanitizeRequest(request), decision);
      return decision;
    }

    const decision = this.policy.evaluate(request);
    this.audit.append(request, decision);

    if (decision.effect !== "require_approval") return decision;
    return this.approvals.create(approvalId, request, decision);
  }

  resolveApproval(id: string, approved: boolean, reviewer: string): ApprovalRequest {
    this.assertAuditIntegrity();
    const resolved = this.approvals.resolve(id, approved, reviewer);
    this.audit.append(
      resolved.request,
      {
        effect: approved ? "allow" : "deny",
        reason: approved
          ? `Human reviewer approved pending action.`
          : `Human reviewer rejected pending action.`,
        matchedRuleId: resolved.decision.matchedRuleId,
      },
      {
        kind: "approval_resolution",
        approvalId: resolved.id,
        resolvedBy: resolved.resolvedBy,
      },
    );
    return resolved;
  }

  listApprovals(status?: ApprovalRequest["status"]): ApprovalRequest[] {
    return this.approvals.list(status);
  }

  /** Replaces the active policy without dropping approval or audit evidence. */
  replacePolicies(rules: PolicyRule[]): void {
    this.policy = new PolicyEngine(rules);
  }

  private assertAuditIntegrity(): void {
    if (!this.audit.verify()) {
      throw new Error("Audit log integrity check failed; refusing to process request.");
    }
  }
}

function sanitizeRequest(request: AgentRequest): AgentRequest {
  return {
    agentId: typeof request.agentId === "string" ? request.agentId.slice(0, 128) : "invalid",
    action: typeof request.action === "string" ? request.action.slice(0, 128) : "invalid",
    resource: typeof request.resource === "string" ? request.resource.slice(0, 256) : "invalid",
  };
}
