# Product Vision: Agentic Forensics Trust Layer

> Current for `1.0.2-alpha.beta` · The reference implementation includes policy decisions, approval records, hash-linked audit events, encrypted append-only storage, and integrity verification. Investigation-workspace features remain a product direction.

## Positioning

The Agentic Trust Layer becomes an enterprise forensic accountability platform for AI agents. Its primary value is not simply stopping unsafe actions; it gives organizations a defensible way to investigate, explain, and verify agent behavior after an important event.

## Core promise

When an agent accesses data, calls an MCP tool, receives approval, is denied, or triggers a consequential workflow, the organization can answer:

- What happened?
- Which verified agent and identity initiated it?
- What policy was in effect?
- What evidence and source systems were involved?
- Who approved or rejected it?
- Did the record retain integrity?
- What other related events occurred before and after it?

## Product pillars

1. **Forensic timeline** — a chronological reconstruction of agent requests, policy results, approvals, tool calls, and outcomes.
2. **Evidence integrity** — hash-linked records, configuration versioning, source references, and chain-of-custody metadata.
3. **Investigation workspace** — case management, search, correlation, scoped evidence export, and analyst notes.
4. **Preventive governance** — policies and approvals that reduce risk before an incident happens.
5. **Enterprise integration** — MCP, identity, SIEM, API gateways, case-management, and security operations platforms.

## Current alpha and next product release

The current alpha provides a policy engine, human approval workflow, tenant-aware REST API, MCP authorization reference, hash-linked audit events, encrypted append-only audit storage, and audit-integrity verification. It also includes Rust source for an independent verifier of exported JSON audit chains. The public Trust Lab visualizes these concepts using fictional local data; it does not store or process real investigative records.

The next production-oriented release would add a durable investigation timeline, policy-version capture, search and correlation, case-scoped evidence export, chain-of-custody metadata, and integration with identity and central logging platforms. The approval workflow remains important because it provides the human-accountability evidence investigators need.

For an independent check of unencrypted JSON evidence exports, the repository includes an optional [Rust audit-chain verifier](../tools/audit-chain-verifier/README.md). It validates canonical SHA-256 event hashes and the predecessor link for each event; it does not decrypt the encrypted store or replace managed evidence retention.

## Differentiation

Most agent tooling focuses on building or orchestrating agents. This product focuses on answering the difficult enterprise question after an event: **Can we prove what the agent did and why?**
