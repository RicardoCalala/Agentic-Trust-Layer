# SOC 2 Readiness Control Matrix

SOC 2 certification applies to an operating organization and is assessed independently. This matrix is a readiness plan, not a certification claim.

| Area | Product control | Owner | Operating evidence | Review cadence |
| --- | --- | --- | --- | --- |
| Access control | Tenant-scoped bearer claims, least-privilege scopes, default-deny policies | Security | IdP configuration, quarterly access review, denied-request samples | Quarterly |
| Change management | Policy update endpoint, protected write scope, approval inbox | Engineering | Pull requests, test runs, policy change receipts | Per change |
| Evidence integrity | Hash-linked events encrypted with AES-256-GCM append-only records | Security | Key rotation record, integrity checks, immutable backup verification | Monthly |
| Monitoring | Central logging sink for authorization and approval-resolution events | SRE | Alert rules, SIEM dashboards, incident tickets | Continuous / monthly |
| Confidentiality | Classification-aware policy evaluation and minimized log payloads | Privacy | Data inventory, retention schedule, log sampling review | Quarterly |
| Availability | Fail-closed authorization, health route, backup and recovery procedure | SRE | Uptime report, restore exercise, capacity test | Quarterly |
| Vendor risk | IdP, KMS, SIEM, hosting, and MCP provider assessments | Compliance | Vendor inventory, security reviews, agreements | Annually / on change |

## Evidence collection plan

1. Assign named control owners and retain a system inventory, data-flow diagram, and tenant boundary design.
2. Collect automated build, test, deployment, and policy-change receipts for every production release.
3. Export a sampled monthly set of encrypted audit integrity checks and SIEM alerts; investigate exceptions to closure.
4. Retain access-review results, key rotation evidence, recovery exercise results, and incident tabletop records in a controlled evidence repository.
5. Have an independent assessor map the final operating controls to the selected SOC 2 Trust Services Criteria.
