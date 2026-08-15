# ISO/IEC 27001 and GDPR Readiness Matrix

> Current for `1.0.1-alpha.beta` · Readiness guidance, not certification or legal advice. An organization should obtain qualified security, privacy, and legal review for its own processing, jurisdictions, and implementation.

Agentic Trust Layer provides a useful technical foundation for evidence-led AI governance, but neither this repository nor its public fictional Trust Lab is ISO/IEC 27001 certified or GDPR compliant by itself. ISO/IEC 27001:2022 requires an organization-wide information-security management system (ISMS), while GDPR duties depend on the organization’s role, processing, and jurisdiction.

The public Trust Lab is outside the scope of this readiness plan: it generates local fictional data and does not connect to real personal, financial, government, or operational data.

## Readiness matrix

| Readiness area | Alpha capability | Operational control needed | Evidence to retain |
| --- | --- | --- | --- |
| ISMS scope and risk treatment | Threat model, policy boundaries, and documented architecture | Define the organization’s ISMS scope, asset inventory, risk method, risk owners, treatment plan, and Statement of Applicability | Approved scope, risk register, treatment decisions, management review minutes |
| Access control | Tenant claim, scoped API routes, default-deny policy evaluation | Managed IdP, MFA, RBAC/ABAC, joiner-mover-leaver process, privileged-access review, service-account lifecycle | IdP configuration, access reviews, role catalogue, revocation records |
| Secure development and change | TypeScript tests, policy validation, documented release notes | Secure SDLC, peer review, dependency review, CI protection, release approval, vulnerability management | PR approvals, build/test receipts, dependency scans, deployment and rollback records |
| Cryptography and key management | AES-256-GCM audit-store adapter; no browser key handling | Managed KMS/HSM, rotation, key access policy, secret scanning, backup-key recovery design | Key inventory, rotation logs, access records, restore exercise results |
| Logging and monitoring | Hash-linked audit events and central-log sink interface | Central SIEM, alert rules, protected retention, incident triage, time synchronization, log access controls | Integrity checks, alert configuration, incident tickets, log-retention evidence |
| Supplier and MCP governance | Allowlist-oriented MCP guidance and identity requirements | Vendor due diligence, data-processing terms, tool-server review, change notification, offboarding | Supplier inventory, risk assessments, contracts, periodic reviews |
| Availability and resilience | Fail-closed authorization behavior and authenticated health endpoint | Capacity planning, backups, disaster recovery, tested recovery objectives, incident communications | Availability reports, backup success logs, recovery tests, post-incident reviews |
| Data protection by design and default | Classification-aware policy, data-minimization guidance, review gates | Data inventory, purpose limitation, retention/deletion schedule, approved data flows, privacy engineering review | Records of processing, data-flow diagrams, retention attestations, review decisions |
| Lawfulness and transparency | No real personal-data processing in the public demo | Document controller/processor roles, lawful basis, privacy notices, data-subject communication process, processor terms where applicable | Lawful-basis register, notices, contracts, training and notice-change records |
| Data-subject rights | Not implemented in the alpha reference | Verified rights-request intake, search/export/correction/erasure/restriction workflow, identity verification, response tracking | Request register, response decisions, response-time metrics, exceptions record |
| Breach management | Audit evidence can support investigation | Breach assessment, supervisory-authority and affected-person notification process where required, tabletop exercises | Incident log, assessment record, notification decision, tabletop reports |
| High-risk processing and AI governance | Human review gates, evidence and uncertainty model | DPIA/AI impact assessment trigger, DPO or privacy consultation as applicable, bias/quality assessment, human-oversight procedure | DPIAs, risk acceptances, oversight records, model/workflow evaluation results |

## Evidence collection plan

### Continuous evidence

- Preserve immutable build, test, deployment, policy-change, approval, and audit-integrity receipts.
- Export decision metadata and integrity hashes to the approved central logging platform; do not send unnecessary content or secrets.
- Record production access changes, privileged actions, tenant-boundary checks, and key-management events.
- Retain approved data-flow diagrams, source and tool registries, and policy ownership records.

### Periodic evidence

| Cadence | Evidence activity | Accountable role |
| --- | --- | --- |
| Per release | Review code, dependencies, tests, policy change, deployment approval, and rollback plan | Engineering and Security |
| Monthly | Verify audit-chain samples, monitoring alerts, backup completion, and unresolved security exceptions | Security / SRE |
| Quarterly | Revalidate access, tenant boundaries, supplier inventory, data inventory, risk register, and retention controls | Security, Privacy, and Compliance |
| Annually and on material change | Refresh ISMS risk assessment, disaster-recovery exercise, incident tabletop, DPIA trigger review, and executive management review | Leadership, Security, Privacy, and Legal |

## Repository-scoped readiness threat model

### Overview

This repository has two distinct surfaces: a TypeScript governance reference (policy engine, approval gate, hash-linked audit log, encrypted audit-store adapter, tenant REST API, and stdio MCP server) and a public Trust Lab that uses browser-generated fictional data. Production deployment of the reference components would make authentication, tenant isolation, policy integrity, audit evidence, encryption keys, and downstream-tool authorization the critical assets.

### Threat model, trust boundaries, and assumptions

| Boundary | Trusted side | Untrusted or controlled input | Security objective |
| --- | --- | --- | --- |
| Public Trust Lab | Static user interface and local simulation code | Visitor interactions, browser runtime, fictional telemetry | Never imply a real data source, identity, decision, or authority; do not collect or expose personal data |
| Agent request to policy engine | Validated request model and policy set | Agent/tool-supplied identifiers, action, resource, classification, metadata | Default-deny invalid or unmatched actions and preserve the decision record |
| REST API to tenant state | Verified bearer claims and scoped route checks | HTTP headers, body, path, token supplied by caller | Bind state to verified tenant identity; never accept a tenant identity from a request body or URL |
| Approval workflow | Attributable reviewer principal with `approvals:resolve` | Pending approval ID and approval decision | Prevent agents or unauthenticated parties from resolving high-impact actions |
| Audit chain and encrypted store | Hash-linked in-memory events and KMS-provided encryption material | Storage volume, row content, local file path | Detect tampering, keep records confidential, and prevent earlier record mutation |
| MCP integration | Allowed tool definitions and authenticated downstream identities | Tool input, tool output, MCP server descriptions | Re-evaluate tool actions, do not trust a tool description alone, and keep approvals outside unauthenticated MCP calls |

Assumptions for a production deployment: TLS is terminated and enforced; tokens are short-lived and validated for issuer/audience; a managed KMS/HSM provides keys; storage, SIEM, IdP, and MCP providers are separately assessed; and humans retain authority over consequential financial, enforcement, employment, eligibility, or legal decisions.

### Attack surface, mitigations, and attacker stories

| Threat story | Relevant controls in the alpha | Production hardening and privacy response |
| --- | --- | --- |
| A prompt-injected agent attempts an unapproved export or sensitive action | Explicit policy evaluation, default-deny behavior, approval gates | Enforce at each downstream call, minimize tool scope, test adversarial prompts, alert on repeated denials |
| A caller attempts cross-tenant access | Tenant state derives from validated token claims; no tenant URL/body selector | OIDC validation, audience/issuer checks, token rotation, isolation tests, access reviews |
| A token or reviewer identity is replayed or misused | Route scopes and authenticated approval resolution | Short-lived tokens, MFA, replay controls, step-up authentication, reviewer separation of duties |
| An audit record or encryption key is exposed or altered | Hash-linked audit events, AES-256-GCM adapter, no browser key handling | KMS/HSM, immutable backups, access controls, key rotation, audit-integrity monitoring, incident playbook |
| A downstream MCP tool misrepresents its behavior or returns sensitive content | Allowlist guidance and policy evaluation before use | Tool verification, sandboxing, egress controls, output handling rules, supplier assessment |
| Personal data is processed beyond its documented purpose | Classification-aware policy and synthetic public demo | Data inventory, lawful-basis assessment, retention schedule, DPIA trigger, rights workflow, privacy review |
| A public-demo visitor mistakes synthetic output for operational intelligence | Prominent fictional-data boundary in the site and documentation | Maintain clear notices, avoid realistic identifiers, and conduct UX/content review before releases |

### Severity calibration

- **Critical:** a production tenant-boundary bypass, arbitrary approval resolution, or key compromise that exposes multiple tenants’ restricted audit records or enables materially harmful downstream actions.
- **High:** an authenticated caller can access another tenant’s policies or approvals; an agent can bypass a required human review; a serious incident cannot be investigated because integrity evidence is unavailable.
- **Medium:** insufficient rate limiting, incomplete input validation in a non-privileged route, an over-broad log field, or an approval/audit event that lacks the necessary context for reliable review.
- **Low:** a fictional interface label or non-sensitive telemetry element is misleading, or a local-development configuration lacks production hardening while the component remains clearly non-production.

## Implementation priorities

1. Establish the ISMS, information-asset inventory, owners, risk register, and control applicability statement.
2. Replace development HMAC handling with a managed OIDC/workload-identity integration and enforce role-based administration.
3. Move audit encryption, retention, backup, and immutable storage into managed infrastructure with monitored key rotation.
4. Implement a production approval inbox and policy-management dashboard behind a backend-for-frontend; never surface tokens or audit keys to the browser.
5. Complete a data-protection assessment before any personal-data processing, then implement rights, retention, incident, vendor, and cross-border-transfer processes as applicable.
6. Obtain independent security, privacy, legal, and certification-audit advice before making ISO/IEC 27001 or GDPR compliance claims.

## Authoritative references

- [ISO/IEC 27001:2022 — Information security management systems](https://www.iso.org/standard/27001)
- [Regulation (EU) 2016/679 — General Data Protection Regulation](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)
- [Existing SOC 2 readiness matrix](soc2-readiness-matrix.md)
- [Repository security policy](../SECURITY.md)

Repository: github.com/RicardoCalala/Agentic-Trust-Layer
Version: 81166af0c9ca4cf19a54b4a1ade0553cf940430a
