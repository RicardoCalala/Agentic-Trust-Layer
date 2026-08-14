import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import type { AgentRequest, AuditEvent, AuditEventKind, Decision } from "./types.js";

const GENESIS_HASH = "0".repeat(64);

export class AuditLog {
  private readonly events: AuditEvent[] = [];

  append(
    request: AgentRequest,
    decision: Decision,
    options: { kind?: AuditEventKind; approvalId?: string; resolvedBy?: string } = {},
  ): AuditEvent {
    const previousHash = this.events.at(-1)?.hash ?? GENESIS_HASH;
    const payload = {
      id: randomUUID(),
      kind: options.kind ?? "authorization",
      timestamp: new Date().toISOString(),
      request: structuredClone(request),
      decision: structuredClone(decision),
      previousHash,
      ...(options.approvalId ? { approvalId: options.approvalId } : {}),
      ...(options.resolvedBy ? { resolvedBy: options.resolvedBy } : {}),
    };
    const hash = createHash("sha256").update(canonicalize(payload)).digest("hex");
    const event = Object.freeze({ ...payload, hash }) as AuditEvent;
    this.events.push(event);
    return structuredClone(event);
  }

  verify(): boolean {
    return this.events.every((event, index) => {
      const previousHash = index === 0 ? GENESIS_HASH : this.events[index - 1].hash;
      if (event.previousHash !== previousHash) return false;

      const { hash, ...payload } = event;
      const expected = createHash("sha256").update(canonicalize(payload)).digest("hex");
      try {
        return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expected, "hex"));
      } catch {
        return false;
      }
    });
  }

  all(): readonly AuditEvent[] {
    return this.events.map((event) => structuredClone(event));
  }
}

function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}
