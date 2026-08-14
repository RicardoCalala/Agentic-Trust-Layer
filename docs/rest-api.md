# Tenant REST API

> Current for `1.0.1-alpha.beta` · Functional alpha reference. It is separate from the public fictional Trust Lab and is not a hosted production service.

The reference API wraps the trust layer in an authenticated, tenant-scoped HTTP service. It is deliberately separated from the public fictional demo: production deployments should run it behind an API gateway, workload identity, and a managed key service.

## Endpoints

| Endpoint | Scope | Purpose |
| --- | --- | --- |
| `GET /v1/health` | Authenticated tenant | Return the authenticated tenant and service status. |
| `POST /v1/authorize` | `actions:authorize` | Evaluate an agent action; create a pending approval when policy requires it. |
| `GET` / `PUT /v1/policies` | `policies:write` for updates | Read or replace a tenant policy set. |
| `GET /v1/approvals` | `approvals:read` | Approval inbox for the authenticated tenant. |
| `POST /v1/approvals/:id` | `approvals:resolve` | Record the authenticated reviewer’s resolution. |
| `GET /v1/audit/verify` | `audit:read` | Verify the current tenant audit chain. |

Every request needs a bearer token whose verified claims contain `tenant_id`, `sub`, and scopes. `Hs256TenantIdentityProvider` is intended for development or for an API gateway that mints short-lived service tokens. For an enterprise identity provider, terminate OIDC validation at a gateway or provide an `IdentityProvider` adapter that validates its signed claims, issuer, audience, tenant, and scopes.

## Run locally

```sh
npm install
npm run build
export TRUST_LAYER_JWT_SECRET="replace-with-at-least-32-characters"
export TRUST_LAYER_AUDIT_KEY_BASE64="$(openssl rand -base64 32)"
npm run api
```

The server listens on port `8787` unless `PORT` is set. The reference process emits metadata-only JSON events to standard output through its sample central-log sink. It is not configured for TLS, a managed KMS, persistent policy storage, or production monitoring.

## Encrypted evidence

`EncryptedAuditStore` writes each audit event as an individually AES-256-GCM encrypted, newline-appended record. The adapter does not update earlier rows and stores the tenant identifier inside the encrypted payload. The in-memory audit chain is separately hash-linked and checked before the next authorization or approval resolution. In production, inject a 32-byte data key from a managed KMS, keep the storage volume write-restricted, retain immutable backups, and export integrity alarms to the central logging platform.

## Central logging

Implement `CentralLogSink` for the organization’s SIEM (for example, Splunk HEC, Microsoft Sentinel, Datadog, or an OpenTelemetry collector). Emit only decision metadata, hashes, and tenant identifiers unless a documented data-minimization review allows more.

## Dashboard integration

The Trust Operations Console demonstrates the policy, approval, evidence, gateway, and reporting surfaces with locally generated synthetic data. It does not call these endpoints. A production dashboard should call the scoped endpoints above through a backend-for-frontend; it must never expose tenant bearer tokens or audit keys in browser code.
