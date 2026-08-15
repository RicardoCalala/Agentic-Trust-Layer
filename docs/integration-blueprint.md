# Integration Blueprint

> Current for `1.0.2-alpha.beta` · The included REST API, encrypted audit-store adapter, and local MCP reference provide a starting point. A production gateway, IdP integration, and downstream-tool forwarding are deployment work.

1. Register an agent with enterprise workload identity.
2. Connect approved MCP servers through the gateway.
3. Map tools and data resources to classifications and owners.
4. Write default-deny policies and approval thresholds.
5. Route approval requests to the existing workflow or ticketing platform.
6. Export audit events to security monitoring and compliance evidence storage.
7. Pilot with one read-only use case, then expand under measured controls.

For concrete implementation boundaries, see the [tenant REST API](rest-api.md), [MCP integration guide](mcp-integration.md), [system architecture](system-architecture.md), and [SOC 2 readiness matrix](soc2-readiness-matrix.md).
