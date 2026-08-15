# Trust Lab

Trust Lab is the public visual companion to Agentic Trust Layer `1.0.2-alpha.beta`.
It demonstrates evidence-led agent governance using locally generated fictional data only.

**Live demo:** [agentic-trust-lab.ricardocalala.chatgpt.site](https://agentic-trust-lab.ricardocalala.chatgpt.site)

## What visitors can explore

- A fictional agent-action assessment with allow, review, deny, and low-risk routing outcomes.
- Trust and financial-risk operations simulations that make uncertainty, authority checks, and forensic records visible.
- A synthetic global signal fabric: visitors can select a fictional region, trigger a mission cycle, and drag the globe to inspect it. Locations and telemetry do not represent real people, organizations, operations, or places.
- The Trust Operations Console, with independently generated fictional views for Overview, Policies, Approvals, Agents, Evidence, MCP Gateway, and Reports.
- An MCP Gateway simulation that explains policy checks and produces fictional audit receipts.

## Safety and accuracy boundary

The site is a design and education prototype. It does not connect to the reference REST API, real MCP servers, identity systems, financial data, government data, geolocation data, or AI decision services. It does not identify people, assert wrongdoing, or authorize financial or enforcement actions.

All telemetry is generated in the browser. The only autonomous outcomes shown are low-risk, reversible routing examples; consequential actions remain review-gated or denied.

## Local development

Requirements: Node.js `>=22.13.0`.

```sh
npm install
npm run dev
npm run build
npm test
```

## Structure

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Public Trust Lab and fictional operations simulations |
| `app/console/page.tsx` | Interactive synthetic Trust Operations Console |
| `app/components/SyntheticGlobe.tsx` | Drag-to-rotate fictional global signal fabric |
| `app/globals.css` | Public-site visual system and responsive behavior |
| `app/console/*.css` | Console visual system and view-specific layouts |

The root repository documents the reference TypeScript library, tenant REST API, MCP reference server, threat model, and SOC 2 readiness plan. Start with the [root README](../README.md).
