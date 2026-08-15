# Agentic Trust Layer Documentation

> Documentation reviewed for `1.0.1-alpha.beta` on 2026-08-14.

This repository is an alpha reference implementation and a public fictional demo. The reference library includes a policy engine, approval workflow, tenant-aware REST API, encrypted append-only audit-store adapter, and MCP authorization reference. The public [Trust Lab](https://agentic-trust-lab.ricardocalala.chatgpt.site) is a separate visual experience that generates local fictional data only.

## Start here

| Need | Document |
| --- | --- |
| Understand the product boundary and local setup | [Root README](../README.md) |
| See where the layer fits in an enterprise stack | [System architecture](system-architecture.md) |
| Integrate the tenant API | [Tenant REST API](rest-api.md) |
| Integrate MCP safely | [MCP integration guide](mcp-integration.md) |
| Plan security, privacy, and audit readiness | [Threat model](threat-model.md) · [SOC 2 readiness matrix](soc2-readiness-matrix.md) · [ISO 27001 and GDPR readiness matrix](iso27001-gdpr-readiness.md) |
| Plan a government or public-sector pilot | [Government Adoption Guide](government-adoption-guide.md) · [National Agentic Trust Fabric](national-trust-fabric.md) |
| Understand the evidence-led design | [Trust model](trust-model.md) · [Forensics product vision](forensics-product-vision.md) |

## Use cases and concepts

- [Governed customer-support agents](use-case-customer-support.md)
- [Governed fraud operations](use-case-fraud-operations.md)
- [Agent activity forensics](use-case-digital-forensics.md)
- [Lone-investigator fraud console](prototype-fraud-investigator-console.md)
- [Area-level financial-risk intelligence](area-level-risk-intelligence.md)
- [Zero-trust collaboration across organizations](use-case-cross-organization.md)
- [National Agentic Trust Fabric](national-trust-fabric.md)
- [Government Adoption Guide](government-adoption-guide.md)

## Product and implementation guides

- [Enterprise concept](enterprise-concept.md)
- [Integration blueprint](integration-blueprint.md)
- [Policy examples](policy-examples.md)
- [Controlled customer-message demo](demo-scenario.md)

## Release boundary

The project is not SOC 2 certified, a production decision system, a surveillance system, or a financial- or law-enforcement decision engine. AI-generated output is never sufficient evidence for a consequential decision. In the public demo, all signals, locations, events, metrics, and outcomes are fictional.

For applicable vulnerability reporting and production hardening requirements, read the [security policy](../SECURITY.md).
