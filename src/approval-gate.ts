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
    if (!isNonEmptyString(id) || id.length > 128) {
      throw new Error("Approval id must be a non-empty string up to 128 characters.");
    }
    if (this.requests.has(id)) {
      throw new Error(`Approval request already exists: ${id}`);
    }

    const approval: ApprovalRequest = Object.freeze({
      id,
      request: Object.freeze(structuredClone(request)),
      decision: Object.freeze(structuredClone(decision)),
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    this.requests.set(id, approval);
    return structuredClone(approval);
  }

  resolve(id: string, approved: boolean, reviewer: string): ApprovalRequest {
    if (!isNonEmptyString(reviewer) || reviewer.length > 128) {
      throw new Error("Reviewer identity is required.");
    }

    const existing = this.requests.get(id);
    if (!existing) throw new Error(`Unknown approval request: ${id}`);
    if (existing.status !== "pending") throw new Error(`Approval request ${id} is already resolved.`);

    const resolved: ApprovalRequest = Object.freeze({
      ...existing,
      request: Object.freeze(structuredClone(existing.request)),
      decision: Object.freeze(structuredClone(existing.decision)),
      status: approved ? "approved" as const : "rejected" as const,
      resolvedBy: reviewer.trim(),
      resolvedAt: new Date().toISOString(),
    });
    this.requests.set(id, resolved);
    return structuredClone(resolved);
  }

  get(id: string): ApprovalRequest | undefined {
    const existing = this.requests.get(id);
    return existing ? structuredClone(existing) : undefined;
  }

  list(status?: ApprovalRequest["status"]): ApprovalRequest[] {
    return [...this.requests.values()]
      .filter((request) => status === undefined || request.status === status)
      .map((request) => structuredClone(request));
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
