# Use Case: Agent Activity Forensics and Incident Investigation

## Purpose

When an organization investigates a security event, it needs to establish what happened, which systems were involved, who or what authorized each action, and whether the evidence was altered. The Agentic Trust Layer creates an accountable record of agent behavior that security and forensic teams can use during an investigation.

## Forensic value

For every governed agent request, the layer can retain:

- Agent and workload identity
- Requested MCP tool, action, and target resource
- Policy version and decision reason
- Data classification and tenant context
- Approval request, reviewer, and resolution
- Timestamp and integrity-linked audit event
- References to authorized source evidence, not unnecessary copies of sensitive data

## Investigation workflow

1. A security analyst identifies a suspicious agent-related event.
2. The analyst searches the audit timeline by agent, tool, time range, decision, or resource.
3. The forensic view reconstructs the sequence of proposed actions, policy outcomes, approvals, and downstream references.
4. The audit chain is verified for integrity.
5. The organization correlates these records with identity, API gateway, endpoint, and SIEM logs.
6. The analyst exports a scoped evidence package for the incident record, preserving access controls and chain-of-custody metadata.

## Example

An operations agent attempts to use an MCP-connected administration tool outside its normal schedule. The trust layer denies the request because it does not match policy, records the reason, and sends the event to security monitoring. Investigators can later confirm the denied action, identify the calling workload, inspect related approvals, and correlate it with other system logs—without relying on a model-generated explanation as the sole evidence.

## Product capabilities to add

| Capability | Forensic purpose |
| --- | --- |
| Immutable, durable audit storage | Preserve records beyond in-memory demonstration data |
| Evidence package export | Collect a scoped, signed investigation bundle |
| Policy and configuration versioning | Recreate the policy in effect at decision time |
| Correlation identifiers | Connect agent actions with API, SIEM, and incident records |
| Restricted forensic roles | Limit sensitive investigation access to authorized analysts |
| Retention and legal-hold controls | Preserve relevant evidence under organizational policy |
| Integrity verification | Detect record alteration or missing chain links |

## Guardrails

Forensic capabilities should follow legal, privacy, employment, and data-retention requirements. The product should collect the minimum context necessary for accountable investigation, restrict forensic exports, and avoid using AI-generated conclusions as final determinations of fact.
