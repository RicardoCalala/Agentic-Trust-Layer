export type Effect = "allow" | "deny" | "require_approval";

export const DATA_CLASSIFICATIONS = ["public", "internal", "confidential", "restricted"] as const;
export type DataClassification = (typeof DATA_CLASSIFICATIONS)[number];

export interface AgentRequest {
  agentId: string;
  action: string;
  resource: string;
  dataClassification?: DataClassification;
  metadata?: Record<string, unknown>;
}

export interface PolicyRule {
  id: string;
  effect: Effect;
  agents?: string[];
  actions?: string[];
  resources?: string[];
  classifications?: DataClassification[];
  reason: string;
}

export interface Decision {
  effect: Effect;
  reason: string;
  matchedRuleId?: string;
}

export type AuditEventKind = "authorization" | "approval_resolution";

export interface AuditEvent {
  id: string;
  kind: AuditEventKind;
  timestamp: string;
  request: AgentRequest;
  decision: Decision;
  previousHash: string;
  hash: string;
  approvalId?: string;
  resolvedBy?: string;
}

const EFFECTS: readonly Effect[] = ["allow", "deny", "require_approval"];

export function isDataClassification(value: unknown): value is DataClassification {
  return typeof value === "string" && (DATA_CLASSIFICATIONS as readonly string[]).includes(value);
}

export function validateAgentRequest(request: AgentRequest): string | undefined {
  if (!isNonEmptyString(request.agentId)) return "agentId is required.";
  if (!isNonEmptyString(request.action)) return "action is required.";
  if (!isNonEmptyString(request.resource)) return "resource is required.";
  if (request.agentId.length > 128 || request.action.length > 128 || request.resource.length > 256) {
    return "Request fields exceed allowed length.";
  }
  if (request.dataClassification !== undefined && !isDataClassification(request.dataClassification)) {
    return "dataClassification is invalid.";
  }
  if (request.metadata !== undefined && (typeof request.metadata !== "object" || request.metadata === null || Array.isArray(request.metadata))) {
    return "metadata must be a plain object when provided.";
  }
  return undefined;
}

export function validatePolicyRules(rules: PolicyRule[]): void {
  const seen = new Set<string>();
  for (const rule of rules) {
    if (!isNonEmptyString(rule.id)) throw new Error("Each policy rule requires a non-empty id.");
    if (seen.has(rule.id)) throw new Error(`Duplicate policy rule id: ${rule.id}`);
    seen.add(rule.id);
    if (!EFFECTS.includes(rule.effect)) throw new Error(`Policy rule ${rule.id} has an invalid effect.`);
    if (!isNonEmptyString(rule.reason)) throw new Error(`Policy rule ${rule.id} requires a reason.`);
    if (rule.classifications?.some((value) => !isDataClassification(value))) {
      throw new Error(`Policy rule ${rule.id} has an invalid classification.`);
    }
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
