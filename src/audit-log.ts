import { createHash, randomUUID } from "node:crypto";
import type { AgentRequest, AuditEvent, Decision } from "./types.js";

const GENESIS_HASH = "0".repeat(64);

export class AuditLog {
  private readonly events: AuditEvent[] = [];

  append(request: AgentRequest, decision: Decision): AuditEvent {
    const previousHash = this.events.at(-1)?.hash ?? GENESIS_HASH;
    const payload = { id: randomUUID(), timestamp: new Date().toISOString(), request, decision, previousHash };
    const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const event = { ...payload, hash };
    this.events.push(event);
    return event;
  }

  verify(): boolean {
    return this.events.every((event, index) => {
      const previousHash = index === 0 ? GENESIS_HASH : this.events[index - 1].hash;
      const { hash, ...payload } = event;
      return event.previousHash === previousHash && createHash("sha256").update(JSON.stringify(payload)).digest("hex") === hash;
    });
  }

  all(): readonly AuditEvent[] { return this.events; }
}
