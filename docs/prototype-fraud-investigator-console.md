# Prototype: Lone-Investigator Fraud Console

## Purpose

This prototype supports one authorized fraud investigator working independently on a case. It brings together verified records, governed AI assistance, policy-aware tools, and an investigation-ready forensic history in one workspace.

The system assists investigation; it does not decide that a person is guilty, authorize punitive action, or treat a predictive score as fact.

## Investigator workspace

| Area | Function |
| --- | --- |
| Case timeline | Orders authorized records, events, and investigator actions chronologically |
| Evidence panel | Shows source, time, provenance, and any conflicting evidence |
| AI case summary | Separates confirmed facts, uncertainty, and suggested follow-up |
| Governed tool panel | Offers only MCP tools authorized for that case and role |
| Policy explanation | Explains the authority, scope, classification, and reason for each decision |
| Confirmation gate | Requires explicit confirmation before a sensitive disclosure or escalation |
| Forensic export | Creates a scoped evidence package with integrity verification |

## Workflow

1. The investigator opens a case with an authorized purpose and scope.
2. The console retrieves approved records through policy-governed tools.
3. AI organizes the material and identifies gaps or contradictions without presenting an unverified conclusion as fact.
4. The investigator requests the next authorized action, such as a records lookup or report draft.
5. The trust layer allows, denies, or requires confirmation based on policy.
6. The console stores an integrity-protected record of the action, evidence references, policy outcome, and investigator decision.

## Safety and accountability

- Source records remain distinguishable from AI summaries.
- Uncertainty and conflicting evidence are visible, not hidden.
- Sensitive actions require lawful authority and, where appropriate, a separate reviewer.
- Audit records support later review, correction, and accountability.
- The prototype limits access to authorized case material and uses minimum necessary data.
