import { timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TrustLayer } from "./trust-layer.js";

const configuredApprovalSecret = process.env.TRUST_LAYER_APPROVAL_SECRET?.trim();
if (!configuredApprovalSecret) {
  console.error(
    "Refusing to start: set TRUST_LAYER_APPROVAL_SECRET to a high-entropy secret before running the MCP server.",
  );
  process.exit(1);
}
const approvalSecret: string = configuredApprovalSecret;

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

const server = new McpServer({ name: "agentic-trust-layer", version: "0.1.0" });

const response = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }]
});

function secretsEqual(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

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
  "resolve_approval",
  {
    title: "Resolve approval request",
    description: "Records an authorized reviewer's decision for a pending action. Requires TRUST_LAYER_APPROVAL_SECRET.",
    inputSchema: {
      approvalId: z.string().trim().min(1).max(128),
      approved: z.boolean(),
      reviewer: z.string().trim().min(1).max(128),
      approvalSecret: z.string().min(1).max(512)
    }
  },
  ({ approvalId, approved, reviewer, approvalSecret: providedSecret }) => {
    if (!secretsEqual(providedSecret, approvalSecret)) {
      return response({ error: "Unauthorized approval resolution." });
    }

    try {
      return response(trustLayer.resolveApproval(approvalId, approved, reviewer));
    } catch (error) {
      return response({
        error: error instanceof Error ? error.message : "Approval resolution failed."
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
