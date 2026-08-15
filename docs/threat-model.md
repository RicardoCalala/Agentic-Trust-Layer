# Threat Model

## Security objective

Prevent an AI agent, its tools, or untrusted content from accessing data or taking actions beyond explicitly authorized policy.

| Threat | Example | Trust-layer mitigation |
| --- | --- | --- |
| Prompt injection | Retrieved content instructs an agent to exfiltrate data | Treat tool content as untrusted; enforce policy at each tool call |
| Excessive authority | A support agent can issue refunds or export records | Default-deny, least-privilege policies, and approval gates |
| Malicious MCP server | A tool description misrepresents its behavior | Allowlist servers and tools, validate identity, audit every call |
| Data-classification downgrade | Agent labels a restricted resource as public to match a weaker rule | Derive classification from a server-owned resource registry; reject conflicting caller input |
| Data leakage | Agent sends restricted data to an external destination | Use trusted classification, inspect destination policy, require approval |
| Identity spoofing | Unapproved workload claims to be a trusted agent | Bind agent identity to verified workload claims; reject body identities not authorized for that workload |
| Self-approval or stale approval | A requester approves their own request, or an approval survives a restrictive policy change | Require a distinct reviewer; invalidate pending approvals whenever governing policy changes |
| Audit tampering | Actor alters past decisions | Hash-linked, durable audit events and external monitoring |
| Cross-tenant access | Token or request attempts to read another organization’s policy or approval | Tenant claim is derived only from a verified bearer token; no tenant identifier is accepted from request body or URL |
| Token replay | A stolen long-lived token resolves approvals | Short-lived signed tokens, issuer/audience validation, gateway replay controls, and scope checks |
| Key exposure | Audit encryption key reaches logs or browser code | Managed KMS, least-privilege runtime identity, rotation, and no client-side key handling |
| Log leakage | Central logging receives sensitive case content | Metadata-only logging, classification-aware redaction, and controlled SIEM retention |

## Design rules

- Never rely on model intent as an authorization control.
- Fail closed when identity, policy, or audit integrity cannot be verified.
- Re-evaluate authorization for every consequential action.
- Require a human for high-impact or ambiguous decisions.
- Treat tenant identity and authorization scopes as security boundaries, not display fields.
- Treat workload identity and resource classification as verified inputs, not caller assertions.
- Preserve historical approval evidence, but invalidate pending approvals when the governing policy changes.
- Keep audit encryption keys outside application configuration files and browser code.
