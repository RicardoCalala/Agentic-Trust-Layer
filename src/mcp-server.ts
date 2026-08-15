import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TrustLayer } from "./trust-layer.js";

const trustLayer = new TrustLayer([
  {
    id: "knowledge-read",
    effect: "allow",
    agents: ["*"],
    actions: ["read"],
    resources: ["knowledge-base"],
    classifications: ["public", "internal"],
    reason: "Approved knowledge may be read by registered agents."
  },
  {
    id: "external-send-review",
    effect: "require_approval",
    agents: ["*"],
    actions: ["send"],
    resources: ["customer-email"],
    classifications: ["confidential", "restricted"],
    reason: "External communications involving sensitive data require human approval."
  },
  {
    id: "deny-bulk-export",
    effect: "deny",
    agents: ["*"],
    actions: ["export"],
    resources: ["*"],
    reason: "Bulk export is denied by default."
  }
]);

const server = new McpServer({ name: "agentic-trust-layer", version: "1.0.2-alpha.beta" });

const response = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }]
});

server.registerTool(
  "authorize_action",
  {
    title: "Authorize agent action",
    description: "Evaluates an agent request and returns allow, deny, or an approval request.",
    inputSchema: {
      agentId: z.string().trim().min(1).max(128),
      action: z.string().trim().min(1).max(128),
      resource: z.string().trim().min(1).max(256),
      dataClassification: z.enum(["public", "internal", "confidential", "restricted"]).optional()
    }
  },
  (request) => {
    try {
      return response(trustLayer.authorize(request));
    } catch (error) {
      return response({
        effect: "deny",
        reason: error instanceof Error ? error.message : "Authorization failed closed."
      });
    }
  }
);

server.registerTool(
  "verify_audit_log",
  {
    title: "Verify audit log",
    description: "Checks whether the in-memory audit event chain has retained integrity."
  },
  () => response({ integrityVerified: trustLayer.audit.verify(), eventCount: trustLayer.audit.all().length })
);

await server.connect(new StdioServerTransport());
