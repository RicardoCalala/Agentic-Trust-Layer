import type { AgentRequest, Decision, PolicyRule } from "./types.js";

const matches = (value: string | undefined, patterns?: string[]) =>
  !patterns || patterns.includes("*") || (value !== undefined && patterns.includes(value));

export class PolicyEngine {
  constructor(private readonly rules: PolicyRule[]) {}

  evaluate(request: AgentRequest): Decision {
    const rule = this.rules.find((candidate) =>
      matches(request.agentId, candidate.agents) &&
      matches(request.action, candidate.actions) &&
      matches(request.resource, candidate.resources) &&
      (!candidate.classifications || candidate.classifications.includes(request.dataClassification)),
    );

    return rule
      ? { effect: rule.effect, reason: rule.reason, matchedRuleId: rule.id }
      : { effect: "deny", reason: "No policy rule grants this request." };
  }
}
