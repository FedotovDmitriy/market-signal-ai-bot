# Cloudflare Release And Rollback Runbook

Updated: 2026-06-30

Owner: Max, DevOps / Cloudflare

## Environment Matrix

| Environment | Worker | D1 | Public URL |
| --- | --- | --- | --- |
| dev | `market-signal-ai-bot-dev` | `market-signal-ai-bot-dev-db` (`4840d883-6136-40b6-8eb9-65ccede85670`) | `https://market-signal-ai-bot-dev.fnemoy.workers.dev` |
| production | `market-signal-ai-bot` | `market-signal-ai-bot-db` (`ebc41219-4276-4068-adb4-1a78d0f0192f`) | `https://market-signal-ai-bot.fnemoy.workers.dev` |

Production is deployed only through the manual GitHub Actions production job and the protected `production` GitHub Environment. Direct production deploys are incident-only operations.

## HMAC Keyring

Core reads `INTERNAL_API_SECRETS_JSON`. Each caller has a distinct key ID and secret.

| Environment | Scanner key ID | Matcher key ID | State |
| --- | --- | --- | --- |
| dev | `scanner-dev-v1` | `matcher-dev-v1` | Core keyring created on 2026-06-30 |
| production | `scanner-prod-v1` | `matcher-prod-v1` | Not created; production approval required |

Secret values must be generated with a cryptographic RNG and transferred directly to the matching caller secret store. Never put values in Git, D1, logs, CI output, documentation, or chat.

Rotation order:

1. Add a new key ID and secret to the Core keyring while retaining the old key.
2. Set the same new value and key ID in exactly one caller environment.
3. Deploy the caller and run a signed request smoke test.
4. Confirm successful Core response and replay rejection.
5. Remove the old key from the Core keyring after the overlap window.

Current integration blocker: deployed scanner and matcher code still sends legacy Bearer authorization. Production HMAC secrets must not be enabled as a release signal until both callers send `X-Key-Id`, unique `X-Request-Id`, `X-Timestamp`, and `X-Signature` using the Core canonical request format.

## Production 404 Finding

Observed on 2026-06-30:

- `/` returned `200`.
- `/api/health` returned `200` with `environment=production`.
- `POST /api/internal/access/check` returned `404 {"error":"not_found"}`.
- Active production deployment: `542a4d29-49da-4632-a67a-48c6f76df0fa`.
- Active production Worker version: `967192f3-12cc-4176-8dc5-ceb0b0d21ae7`, version 34, deployed 2026-06-22.

Cause: production serves an older Worker bundle that does not include the local `scannerAccessCheck` route. Production D1 also has migrations `0007` through `0012` pending. This is version drift, not a total Worker or D1 outage.

## Dev Deployment

Completed on 2026-06-30:

1. Created the isolated dev D1 database.
2. Applied migrations `0001` through `0012` to dev only.
3. Created the dev HMAC keyring with separate scanner and matcher keys.
4. Deployed dev Worker version `a6fc1904-1eab-413e-8db7-6b4701982263` at 100%.
5. Verified `/api/health` returns `200`, `environment=dev`, and all schema checks pass.
6. Verified unsigned `POST /api/internal/access/check` returns `401`, proving the route exists and fails closed.

## Production Preflight

All conditions are mandatory:

1. Main manager records shared production approval.
2. Security owner approves the HMAC-only implementation.
3. Scanner and matcher dev integration tests pass with separate keys.
4. CI typecheck, 40 tests, and both Wrangler dry-runs pass.
5. GitHub Environment `production` has required reviewers.
6. Current deployment and version IDs are recorded.
7. Production D1 export completes and its checksum is recorded.

Backup captured before the pending migrations:

- Local protected path: `.wrangler/backups/market-signal-ai-bot-db-before-0007-0012-2026-06-30.sql`
- Size: `15461` bytes
- SHA-256: `374F90C6CEC6E7590904D0F2ACD4A05337A29C2920BEA6BB5EA7EE1301C9D8F9`

The `.wrangler/` directory is ignored by Git. CI also exports a fresh backup immediately before a production migration and retains the protected artifact for three days.

## Production Deployment Order

Run only after all production approvals:

1. Create independent `scanner-prod-v1` and `matcher-prod-v1` values and synchronize them with the corresponding caller secret stores.
2. Upload the production Core keyring without removing the old key during the transition window.
3. Record `wrangler deployments status --env production --json`.
4. Export a fresh D1 backup and record its SHA-256 checksum.
5. Confirm the pending list is exactly `0007` through `0012`.
6. Apply production D1 migrations.
7. Deploy the production Worker through the protected GitHub job.
8. Verify `/api/health` and the `environment=production` marker.
9. Run one valid signed scanner request and one valid signed matcher request.
10. Verify an unsigned request, stale timestamp, wrong key ID, invalid signature, and replayed request ID all fail closed.
11. Monitor Worker 5xx, D1 errors, internal access failures, scanner failures, queue depth, and DLQ for at least 30 minutes.

## Rollback

Worker-only regression:

1. Stop further releases.
2. Record the failed version ID and incident timestamp.
3. Roll back to the recorded stable version with `wrangler rollback <stable-version-id> --env production`.
4. Verify health and the previous public contract.

D1 migration regression:

1. Do not run destructive down migrations against production.
2. Stop writes or disable affected endpoints if data integrity is at risk.
3. Prefer an additive forward-fix migration reviewed against the exported schema.
4. If recovery requires restore, create a new D1 database, import the verified export there, validate row counts and health, then switch the production binding in a reviewed deployment.
5. A Worker rollback does not roll back D1 state. Do not point old code at an incompatible migrated schema.

## Release Status

`Blocked` for production. Dev infrastructure and Worker deployment are healthy, but scanner and matcher are not yet HMAC-compatible and shared production approval has not been recorded.
