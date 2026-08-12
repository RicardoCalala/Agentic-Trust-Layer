export type Effect = "allow" | "deny" | "require_approval";

export interface AgentRequest {
  agentId: string;
  action: string;
  resource: string;
  dataClassification?: "public" | "internal" | "confidential" | "restricted";
  metadata?: Record<string, unknown>;
}

export interface PolicyRule {
  id: string;
  effect: Effect;
  agents?: string[];
  actions?: string[];
  resources?: string[];
  classifications?: AgentRequest["dataClassification"][];
  reason: string;
}

export interface Decision {
  effect: Effect;
  reason: string;
  matchedRuleId?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  request: AgentRequest;
  decision: Decision;
  previousHash: string;
  hash: string;
}
