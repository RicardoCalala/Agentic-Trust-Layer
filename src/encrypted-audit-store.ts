import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { AuditEvent } from "./types.js";

export interface EncryptedAuditStoreOptions { filePath: string; key: Buffer; }

/** AES-256-GCM, newline-appended tenant records. Use a managed KMS to supply the key in production. */
export class EncryptedAuditStore {
  constructor(private readonly options: EncryptedAuditStoreOptions) {
    if (options.key.length !== 32) throw new Error("Encrypted audit storage requires a 32-byte AES-256 key.");
  }

  async append(tenantId: string, event: AuditEvent): Promise<void> {
    if (!tenantId.trim()) throw new Error("tenantId is required.");
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.options.key, iv);
    const plaintext = Buffer.from(JSON.stringify({ tenantId, event }));
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const record = JSON.stringify({ version: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") });
    await mkdir(dirname(this.options.filePath), { recursive: true });
    await appendFile(this.options.filePath, `${record}\n`, { encoding: "utf8", mode: 0o600 });
  }

  async readTenant(tenantId: string): Promise<AuditEvent[]> {
    try {
      const rows = (await readFile(this.options.filePath, "utf8")).trim().split("\n").filter(Boolean);
      return rows.map((row) => this.decrypt(row)).filter((entry) => entry.tenantId === tenantId).map((entry) => entry.event);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  private decrypt(row: string): { tenantId: string; event: AuditEvent } {
    const record = JSON.parse(row) as { iv: string; tag: string; ciphertext: string };
    const decipher = createDecipheriv("aes-256-gcm", this.options.key, Buffer.from(record.iv, "base64"));
    decipher.setAuthTag(Buffer.from(record.tag, "base64"));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(record.ciphertext, "base64")), decipher.final()]).toString("utf8"));
  }
}
