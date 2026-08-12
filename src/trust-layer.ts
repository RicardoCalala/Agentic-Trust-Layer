import { randomUUID } from "node:crypto";
import { ApprovalGate, type ApprovalRequest } from "./approval-gate.js";
import { AuditLog } from "./audit-log.js";
import { PolicyEngine } from "./policy-engine.js";
import type { AgentRequest, Decision, PolicyRule } from "./types.js";

export class TrustLayer {
  readonly approvals = new ApprovalGate();
  readonly audit = new AuditLog();
  private readonly policy: PolicyEngine;

  constructor(rules: PolicyRule[]) { this.policy = new PolicyEngine(rules); }

  authorize(request: AgentRequest, approvalId: string = randomUUID()): Decision | ApprovalRequest {
    const decision = this.policy.evaluate(request);
    this.audit.append(request, decision);
    return decision.effect === "require_approval" ? this.approvals.create(approvalId, request, decision) : decision;
  }
}
