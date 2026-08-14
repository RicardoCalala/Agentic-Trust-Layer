# MCP Integration Guide

> Current for `1.0.1-alpha.beta` · The local MCP reference exposes authorization and audit verification only. Approval resolution belongs to the authenticated REST API.

## Purpose

The included MCP server demonstrates the Agentic Trust Layer as a governance gateway. An MCP client can ask it to evaluate an agent action and verify the integrity of the in-memory audit trail. It intentionally does not expose approval resolution as an MCP tool.

## Run locally

```sh
npm install
npm run build
npm run mcp
```

The server uses standard input and output, the normal local MCP transport. Configure an MCP-capable host to start the compiled `mcp-server.js` entry point.

## Exposed MCP tools

| Tool | Purpose |
| --- | --- |
| `authorize_action` | Evaluates agent, action, resource, and data classification against policy. |
| `verify_audit_log` | Verifies the hash-linked audit event chain. |

`authorize_action` can return `allow`, `deny`, or an approval request. In this alpha, the approval request is intentionally resolved only through `POST /v1/approvals/:id` with a tenant-authenticated reviewer principal and the `approvals:resolve` scope. See the [REST API guide](rest-api.md).

## Demonstration policy

- Agents may read public or internal material in `knowledge-base`.
- Sending customer email involving confidential or restricted data requires approval.
- Any request without an explicit matching policy is denied.

## Production integration design

This local server is a functional demonstration, not the production gateway. A deployed version should:

1. Authenticate the calling workload using enterprise identity rather than accepting an agent identifier from tool input.
2. Derive tenant identity and permissions from signed claims.
3. Store policies, approvals, and audit events in encrypted durable storage.
4. Forward approved calls to approved downstream MCP servers, with least-privilege credentials.
5. Validate MCP authorization tokens for their intended audience; never forward tokens blindly.
6. Send audit events to the organization's monitoring and compliance systems.
7. Bind approvals to a reviewer identity in the authenticated REST or workflow surface; do not put a shared approval secret in an agent tool call.

## Recommended next implementation

Build an HTTP gateway that authenticates the MCP client, filters available downstream tools by policy, and re-evaluates each tool invocation before forwarding it. This makes the trust layer the enforcement boundary rather than a voluntary client-side check. Treat the included stdio server as a focused local reference, not a multi-tenant MCP proxy.
