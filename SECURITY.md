# Security policy

## Scope and release boundary

Agentic Trust Layer `1.0.2-alpha.beta` is a portfolio proof of concept. The public Trust Lab runs only locally generated fictional content. The reference REST API and MCP server are implementation examples that require a deployment-specific identity, key-management, storage, monitoring, and incident-response design before real-world use.

## Reporting a vulnerability

Please do not publish sensitive vulnerability details in a public issue. Contact the repository owner privately with the affected component, reproduction steps, likely impact, and any proposed mitigation.

## Supported security properties in this alpha

- Default-deny policy decisions with explicit approval boundaries.
- Tenant-scoped REST API state after authenticated token validation.
- Hash-linked, encrypted audit-store reference adapter.
- Constant-time comparison for HMAC authentication checks.
- Size-limited JSON request parsing and defensive response headers.

## Required production controls

- Use a managed identity provider with issuer, audience, key rotation, and role-based access control.
- Store encryption keys in a managed KMS or HSM; never use local development keys for production.
- Put the API behind TLS termination, rate limiting, structured monitoring, alerting, backups, and tested recovery procedures.
- Keep approval resolution on the authenticated REST API until the MCP transport has authenticated, attributable reviewer identity.
- Complete the SOC 2, ISO/IEC 27001, and GDPR readiness evidence plans, independent security/privacy review, and operational controls before processing sensitive data.

See the [ISO/IEC 27001 and GDPR readiness matrix](docs/iso27001-gdpr-readiness.md) for control mapping, the repository-scoped threat model, and the evidence collection plan.
