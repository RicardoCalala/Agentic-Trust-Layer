import type { AgentRequest, Decision } from "./types.js";

export interface ApprovalRequest {
  id: string;
  request: AgentRequest;
  decision: Decision;
  status: "pending" | "approved" | "rejected" | "invalidated";
  createdAt: string;
  requestedBy?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  invalidatedBy?: string;
  invalidatedAt?: string;
}

export class ApprovalGate {
  private readonly requests = new Map<string, ApprovalRequest>();

  create(id: string, request: AgentRequest, decision: Decision, requestedBy?: string): ApprovalRequest {
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
      ...(requestedBy ? { requestedBy } : {}),
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
    if (existing.requestedBy === reviewer.trim()) throw new Error("Requester cannot approve their own request.");

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

  invalidatePending(actor: string): ApprovalRequest[] {
    if (!isNonEmptyString(actor) || actor.length > 128) throw new Error("Policy administrator identity is required.");
    const now = new Date().toISOString();
    const invalidated = this.list("pending").map((existing) => Object.freeze({
      ...existing,
      status: "invalidated" as const,
      invalidatedBy: actor.trim(),
      invalidatedAt: now,
    }) as ApprovalRequest);
    for (const approval of invalidated) this.requests.set(approval.id, approval);
    return invalidated.map((approval) => structuredClone(approval));
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
