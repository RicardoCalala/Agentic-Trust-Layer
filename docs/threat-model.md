# Threat Model

## Security objective

Prevent an AI agent, its tools, or untrusted content from accessing data or taking actions beyond explicitly authorized policy.

| Threat | Example | Trust-layer mitigation |
| --- | --- | --- |
| Prompt injection | Retrieved content instructs an agent to exfiltrate data | Treat tool content as untrusted; enforce policy at each tool call |
| Excessive authority | A support agent can issue refunds or export records | Default-deny, least-privilege policies, and approval gates |
| Malicious MCP server | A tool description misrepresents its behavior | Allowlist servers and tools, validate identity, audit every call |
| Data leakage | Agent sends restricted data to an external destination | Classify data, inspect destination policy, require approval |
| Identity spoofing | Unapproved workload claims to be a trusted agent | Use workload identity and signed claims in production |
| Audit tampering | Actor alters past decisions | Hash-linked, durable audit events and external monitoring |

## Design rules

- Never rely on model intent as an authorization control.
- Fail closed when identity, policy, or audit integrity cannot be verified.
- Re-evaluate authorization for every consequential action.
- Require a human for high-impact or ambiguous decisions.
