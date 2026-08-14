# Tenant REST API

The reference API wraps the trust layer in an authenticated, tenant-scoped HTTP service. It is deliberately separated from the public fictional demo: production deployments should run it behind an API gateway, workload identity, and a managed key service.

## Endpoints

| Endpoint | Scope | Purpose |
| --- | --- | --- |
| `POST /v1/authorize` | `actions:authorize` | Evaluate an agent action; create a pending approval when policy requires it. |
| `GET` / `PUT /v1/policies` | `policies:write` for updates | Read or replace a tenant policy set. |
| `GET /v1/approvals` | `approvals:read` | Approval inbox for the authenticated tenant. |
| `POST /v1/approvals/:id` | `approvals:resolve` | Record the authenticated reviewer’s resolution. |
| `GET /v1/audit/verify` | `audit:read` | Verify the current tenant audit chain. |

Every request needs a bearer token whose verified claims contain `tenant_id`, `sub`, and scopes. `Hs256TenantIdentityProvider` is intended for development or for an API gateway that mints short-lived service tokens. For an enterprise identity provider, terminate OIDC validation at a gateway or provide an `IdentityProvider` adapter that validates its signed claims, issuer, audience, tenant, and scopes.

## Encrypted evidence

`EncryptedAuditStore` writes each audit event as an individually AES-256-GCM encrypted append-only record. The store never updates earlier rows. In production, inject a 32-byte data key from a managed KMS, keep the storage volume write-restricted, retain immutable backups, and export integrity alarms to the central logging platform.

## Central logging

Implement `CentralLogSink` for the organization’s SIEM (for example, Splunk HEC, Microsoft Sentinel, Datadog, or an OpenTelemetry collector). Emit only decision metadata, hashes, and tenant identifiers unless a documented data-minimization review allows more.

## Dashboard integration

The Trust Operations Console demonstrates the policy, approval, evidence, gateway, and reporting surfaces with synthetic data. A production dashboard should call the scoped endpoints above through a backend-for-frontend; it must never expose tenant bearer tokens or audit keys in browser code.
