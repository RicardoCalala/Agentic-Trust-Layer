# Use Case: Governed Customer Support Agents

## Executive summary

A company wants an AI customer-support agent to resolve routine requests faster while preserving customer trust and operational control. The Agentic Trust Layer sits between the agent and the company's MCP-connected systems. It applies policy before every action, requires human approval when the risk is high, and creates an integrity-protected record of what happened.

The result is a support agent that can be useful in real workflows without being given unlimited access to customer data, email, refunds, or account changes.

## Business challenge

Customer support teams face high volumes of repetitive questions: order status, product information, account guidance, and return eligibility. An AI agent can assist with these tasks, but a company cannot safely let it access every customer record or send every response without controls. A single overly broad permission or unreviewed action could expose personal information, create an unauthorized refund, or send an incorrect message.

Traditional permissions usually answer whether a human employee may access a system. They do not consistently evaluate the full context of an agent action: which agent is acting, which MCP tool it wants to use, what data is involved, whether the action is reversible, and whether a human must take responsibility.

## Proposed solution

The Agentic Trust Layer is deployed as an MCP gateway in front of the company's approved support tools. The support agent requests a tool action through the gateway rather than calling the CRM, knowledge base, messaging platform, or refund system directly.

For each request, the gateway evaluates policy and returns one of three outcomes:

- **Allow** for low-risk, explicitly authorized activity.
- **Require approval** for sensitive or consequential activity.
- **Deny** when the request falls outside policy or lacks enough context.

Every decision is recorded in an audit trail that can be checked for integrity.

## Example workflow

1. A customer asks why their order is delayed.
2. The support agent calls an MCP tool to read an internal shipping-status knowledge base.
3. The trust layer confirms the tool, action, data classification, and agent identity match an approved read-only policy.
4. The request is allowed and the agent drafts a helpful response.
5. If the agent needs to send a message containing confidential account information, the trust layer creates an approval request.
6. An authorized support lead reviews the proposed message and approves or rejects it.
7. The decision and relevant context are preserved as audit evidence.

## Policy examples

| Requested agent action | Trust-layer decision | Reason |
| --- | --- | --- |
| Read public shipping guidance | Allow | Low-risk, read-only knowledge access |
| Read internal support playbook | Allow | Explicitly authorized internal access |
| Send an email containing account details | Require approval | External communication and confidential data |
| Issue a refund | Require approval | Financial impact and customer commitment |
| Export a customer list | Deny | No explicit authorization and high privacy risk |
| Change CRM permissions | Deny | Administrative action outside the support agent's scope |

## MCP integration

The MCP gateway filters tool availability and evaluates each requested action. This lets the company keep its existing agent framework and tool servers while adding one consistent enforcement point. The gateway can integrate with enterprise identity to validate the workload, with a ticketing or workflow system for approvals, and with a security platform for audit-event monitoring.

## Value to the business

- **Faster support:** safely automate low-risk, routine requests.
- **Reduced operational risk:** prevent agents from taking actions that do not match policy.
- **Human accountability:** route sensitive decisions to the appropriate reviewer.
- **Compliance support:** create decision evidence for access, confidentiality, and monitoring controls.
- **Flexible adoption:** introduce the layer around one use case, then expand to other agents and MCP tools.

## Measures of success

- Percentage of routine requests resolved without human intervention
- Approval turnaround time for sensitive actions
- Number and type of denied requests, used to improve policy and agent design
- Reduction in manual support workload while maintaining customer satisfaction
- Audit completeness and time required to investigate an agent decision

## Implementation path

Start with read-only knowledge-base access and human-reviewed customer messages. Once the company has confidence in its policies and review process, expand to additional MCP tools such as CRM lookups, return workflows, and refund proposals. Financial transactions and account changes should remain approval-gated until the organization has established stronger controls, testing, and operational evidence.

## Why this matters

This use case shows the Agentic Trust Layer as more than an authorization utility. It is the governance boundary that makes agent autonomy practical: agents can move quickly inside defined limits, while the organization retains visibility, control, and responsibility for consequential decisions.
