# Changelog

## 1.0.2-alpha.beta — 2026-08-14

- Preserved pending approvals and audit-chain continuity when a tenant policy set is replaced.
- Added a `policies:read` scope requirement to the tenant policy-read endpoint.
- Added Rust source for an independent JSON audit-chain verifier, with canonical-hash and tamper-detection tests.
- Refreshed release metadata across the library, Trust Lab, security documentation, and implementation guides.

## Documentation refresh — 2026-08-14

- Replaced inherited starter documentation in `trust-lab/` with an accurate guide to the public fictional experience.
- Corrected the MCP guide to reflect the current two-tool server; approval resolution remains tenant-authenticated on the REST API.
- Added current local-run instructions, API scope coverage, product boundaries, and a documentation map.
- Added ISO/IEC 27001 and GDPR readiness control mapping, repository-scoped threat model, and evidence-collection plan.
- Added a government-friendly adoption guide covering accountability, privacy, security, procurement, pilots, and phased rollout.

## 1.0.1-alpha.beta — 2026-08-14

- Published the interactive Trust Lab and Control Center as a public, fictional demonstration.
- Added the 2035 synthetic global signal fabric with selectable regions, mission actions, and aggregate-only telemetry.
- Strengthened REST API response headers and documented release security boundaries.
- Removed the MCP shared-secret approval-resolution demonstration; approvals remain on the authenticated REST API.
- Retained explicit policy, human-review, tenant, and evidence-integrity safeguards.

## Release status

This is an alpha proof of concept. It is not a production certification, a law-enforcement decision system, or a service that processes real people or real operational data.
