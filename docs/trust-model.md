# Trust Model: Evidence, Not Blind Confidence

## Core idea

The Agentic Trust Layer is designed for situations where people or organizations may not naturally trust one another. It does not ask them to blindly trust an AI system instead. It gives them a repeatable way to evaluate claims, restrict actions, and inspect the evidence behind a decision.

AI can help collect information, compare records, detect inconsistencies, and explain why a policy did or did not allow an action. It must not be treated as the sole source of truth for high-impact decisions.

## What creates trust

Trust is produced by a combination of controls:

1. **Verified inputs:** connect decisions to authorized systems, signed records, and known sources.
2. **Explicit policy:** define what is permitted before an agent acts.
3. **Independent checks:** compare claims against more than one authorized source when the risk warrants it.
4. **Human accountability:** require an authorized reviewer for high-impact, ambiguous, or irreversible decisions.
5. **Explainable decisions:** record the policy, context, evidence references, and reviewer decision.
6. **Tamper-evident history:** preserve an audit chain so later reviewers can detect alteration.

## Decision model

| Situation | AI role | Trust-layer response |
| --- | --- | --- |
| Low-risk factual lookup | Retrieve from an approved source | Allow, label the source, and audit the request |
| Conflicting records | Identify differences and request additional evidence | Escalate or deny until resolved |
| Sensitive cross-organization request | Summarize only authorized information | Apply least privilege and require approval where needed |
| Irreversible action | Prepare a recommendation and evidence | Hold for human authorization |
| Unverified or manipulated content | Flag uncertainty and isolate the content | Deny unsafe action and record the reason |

## Example: a disputed financial claim

An agent receives a request to freeze an account based on a fraud signal from an external partner. The agent may assemble a case summary and compare approved records, but it cannot declare the claim true by itself. The trust layer verifies the partner identity, scopes access to the necessary data, checks policy requirements, records the evidence references, and routes the account freeze to an authorized reviewer.

The outcome is not blind trust in either organization or the AI. It is a decision process that is inspectable, constrained, and accountable.

## Design principle

**AI accelerates evidence-based decisions; it does not replace evidence, policy, or human responsibility.**
