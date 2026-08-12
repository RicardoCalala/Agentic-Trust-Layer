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
  }
]);

const server = new McpServer({ name: "agentic-trust-layer", version: "0.1.0" });

const response = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }]
});

server.registerTool(
  "authorize_action",
  {
    title: "Authorize agent action",
    description: "Evaluates an agent request and returns allow, deny, or an approval request.",
    inputSchema: {
      agentId: z.string().min(1),
      action: z.string().min(1),
      resource: z.string().min(1),
      dataClassification: z.enum(["public", "internal", "confidential", "restricted"]).optional()
    }
  },
  (request) => response(trustLayer.authorize(request))
);

server.registerTool(
  "resolve_approval",
  {
    title: "Resolve approval request",
    description: "Records an authorized reviewer's decision for a pending action.",
    inputSchema: {
      approvalId: z.string().min(1),
      approved: z.boolean(),
      reviewer: z.string().min(1)
    }
  },
  ({ approvalId, approved, reviewer }) => response(trustLayer.approvals.resolve(approvalId, approved, reviewer))
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
