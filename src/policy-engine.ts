import type { AgentRequest, Decision, PolicyRule } from "./types.js";
import { validatePolicyRules } from "./types.js";

const matches = (value: string | undefined, patterns?: string[]) =>
  !patterns || patterns.includes("*") || (value !== undefined && patterns.includes(value));

export class PolicyEngine {
  constructor(private readonly rules: PolicyRule[]) {
    validatePolicyRules(rules);
  }

  evaluate(request: AgentRequest): Decision {
    const matching = this.rules.filter((candidate) => this.ruleMatches(candidate, request));

    // Deny overrides allow/approval so a later restrictive rule cannot be bypassed by rule order.
    const denied = matching.find((rule) => rule.effect === "deny");
    if (denied) {
      return { effect: "deny", reason: denied.reason, matchedRuleId: denied.id };
    }

    const approval = matching.find((rule) => rule.effect === "require_approval");
    if (approval) {
      return { effect: "require_approval", reason: approval.reason, matchedRuleId: approval.id };
    }

    const allowed = matching.find((rule) => rule.effect === "allow");
    if (allowed) {
      return { effect: "allow", reason: allowed.reason, matchedRuleId: allowed.id };
    }

    return { effect: "deny", reason: "No policy rule grants this request." };
  }

  private ruleMatches(rule: PolicyRule, request: AgentRequest): boolean {
    if (!matches(request.agentId, rule.agents)) return false;
    if (!matches(request.action, rule.actions)) return false;
    if (!matches(request.resource, rule.resources)) return false;

    if (rule.classifications) {
      // Fail closed: a classified rule never matches an unclassified request.
      if (request.dataClassification === undefined) return false;
      if (!rule.classifications.includes(request.dataClassification)) return false;
    }

    return true;
  }
}
