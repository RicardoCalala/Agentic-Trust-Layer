# Product Vision: Agentic Forensics Trust Layer

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

## First product release

The initial working product should provide an MCP gateway, a durable audit-event store, an investigation timeline, policy-version capture, integrity verification, and a restricted forensic export. The approval workflow remains important because it provides the human-accountability evidence investigators need.

## Differentiation

Most agent tooling focuses on building or orchestrating agents. This product focuses on answering the difficult enterprise question after an event: **Can we prove what the agent did and why?**
