# MCP Integration Guide

## Purpose

The included MCP server demonstrates the Agentic Trust Layer as a governance gateway. An MCP client can ask it to evaluate an agent action, resolve an approval decision, and verify the integrity of the audit trail.

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
| `resolve_approval` | Lets a reviewer approve or reject a pending high-impact request. |
| `verify_audit_log` | Verifies the hash-linked audit event chain. |

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

## Recommended next implementation

Build an HTTP gateway that authenticates the MCP client, filters available downstream tools by policy, and re-evaluates each tool invocation before forwarding it. This makes the trust layer the enforcement boundary rather than a voluntary client-side check.
