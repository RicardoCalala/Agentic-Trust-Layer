import type { AgentRequest, Decision } from "./types.js";

export interface ApprovalRequest {
  id: string;
  request: AgentRequest;
  decision: Decision;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export class ApprovalGate {
  private readonly requests = new Map<string, ApprovalRequest>();

  create(id: string, request: AgentRequest, decision: Decision): ApprovalRequest {
    const approval: ApprovalRequest = { id, request, decision, status: "pending", createdAt: new Date().toISOString() };
    this.requests.set(id, approval);
    return approval;
  }

  resolve(id: string, approved: boolean, reviewer: string): ApprovalRequest {
    const existing = this.requests.get(id);
    if (!existing) throw new Error(`Unknown approval request: ${id}`);
    if (existing.status !== "pending") throw new Error(`Approval request ${id} is already resolved.`);
    const resolved = { ...existing, status: approved ? "approved" as const : "rejected" as const, resolvedBy: reviewer, resolvedAt: new Date().toISOString() };
    this.requests.set(id, resolved);
    return resolved;
  }

  get(id: string): ApprovalRequest | undefined {
    return this.requests.get(id);
  }
}
