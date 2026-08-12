# Policy Examples

Policies define the boundary before an agent acts. They are readable by governance teams and enforceable by software.

| Policy | Decision | Rationale |
| --- | --- | --- |
| Support agent reads internal knowledge base | Allow | Read-only, approved information |
| Support agent sends confidential customer email | Require approval | External communication with sensitive data |
| Finance agent proposes a payment | Require approval | Financial commitment requires segregation of duties |
| Finance agent releases a payment | Deny | Action reserved for an authorized payment workflow |
| Public-sector agent accesses restricted case data | Require approval | Need-to-know and accountable disclosure |
| Any unrecognized agent action | Deny | Default-deny safety boundary |

## Example policy-as-code

```ts
{
  id: "customer-email-review",
  effect: "require_approval",
  agents: ["support-agent"],
  actions: ["send"],
  resources: ["customer-email"],
  classifications: ["confidential", "restricted"],
  reason: "A designated reviewer must approve sensitive external communication."
}
```
