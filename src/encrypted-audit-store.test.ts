import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { EncryptedAuditStore } from "./encrypted-audit-store.js";

test("encrypts append-only audit records and isolates tenant reads", async () => {
  const directory = await mkdtemp(join(tmpdir(), "atl-audit-"));
  const filePath = join(directory, "audit.enc.jsonl");
  const store = new EncryptedAuditStore({ filePath, key: randomBytes(32) });
  const event = { id: "event-1", kind: "authorization" as const, timestamp: "2026-01-01T00:00:00.000Z", request: { agentId: "a", action: "read", resource: "r" }, decision: { effect: "allow" as const, reason: "ok" }, previousHash: "0".repeat(64), hash: "1".repeat(64) };
  await store.append("tenant-a", event);
  await store.append("tenant-b", { ...event, id: "event-2" });
  assert.deepEqual(await store.readTenant("tenant-a"), [event]);
  assert.equal((await readFile(filePath, "utf8")).includes("tenant-a"), false);
  assert.equal((await readFile(filePath, "utf8")).split("\n").filter(Boolean).length, 2);
});
