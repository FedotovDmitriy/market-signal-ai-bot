# DevOps / Cloudflare Plan

## Role

Max is the DevOps / Cloudflare engineer for Market Signal AI.

His job is to keep the SaaS reliable, deployable, observable, secure, and separated by environment.

## Environments

Required environments:

- `dev`
- `staging`
- `production`

Each environment must have separate:

- Cloudflare Workers.
- D1 databases.
- Queues and Dead Letter Queues.
- Telegram bots or test chats.
- Secrets.
- Domains/subdomains.

## v0.1 Environment Plan

The v0.1 environment plan is confirmed as a three-environment setup:

| Environment | Worker | D1 | Queues | Telegram | Domain |
| --- | --- | --- | --- | --- | --- |
| `dev` | `market-signal-ai-bot-dev` | `market-signal-ai-bot-dev-db` | dev scan/delivery queues and DLQs | test bot or private test chat only | `dev.market-signal.ai` or workers.dev |
| `staging` | `market-signal-ai-bot-staging` | `market-signal-ai-bot-staging-db` | staging scan/delivery queues and DLQs | staging bot/test chat only | `staging.market-signal.ai` |
| `production` | `market-signal-ai-bot` | `market-signal-ai-bot-db` | production scan/delivery queues and DLQs | production bots/channels only | production app/API domain |

Current repository status:

- `wrangler.jsonc` currently points at one production-named Worker and one production D1 database.
- `wrangler.jsonc` must be expanded with `env.dev`, `env.staging`, and `env.production` before production release.
- The existing top-level `ALLOW_UNVERIFIED_TELEGRAM=false`, `nodejs_compat`, and observability settings are production-safe defaults.

## Cloudflare Responsibilities

### Workers

- Keep `wrangler` configs current.
- Validate bindings before deploy.
- Keep compatibility dates intentional.
- Document deploy and rollback commands.

v0.1 Worker release requirements:

- Keep `compatibility_date` current and intentional before each release.
- Use separate Worker names per environment.
- Use environment-specific `vars` only for non-secret values.
- Store secrets with Cloudflare Worker secrets, not in source, D1, or GitHub logs.
- Generate/check Worker binding types after config changes.
- Roll back using Cloudflare Worker versions after a failed deploy.

### D1

- Apply migrations safely.
- Keep dev/staging/prod databases separate.
- Prepare export/backup strategy.
- Verify core tables after migration.

Core tables for `market-signal-ai-bot`:

- `users`
- `subscriptions`
- `user_settings`
- `user_country_links`
- `bot_routes`
- `audit_events`
- `rate_limits`
- `api_keys`
- `analysis_requests`
- `api_usage_daily`

v0.1 D1 migration and backup plan:

- Apply migrations to local/dev first.
- Apply migrations to staging and run `/api/health`.
- Export the production D1 database before any production migration.
- Apply production migrations only after typecheck, tests, staging deploy, and manual approval pass.
- Verify `/api/health` and core table counts after migration.
- If a migration fails in production, stop deploy, preserve the failed migration output, export the current database state, and escalate before manual data repair.

Minimum D1 commands:

```bash
npm exec wrangler -- d1 migrations apply market-signal-ai-bot-db --local
npm exec wrangler -- d1 export market-signal-ai-bot-db --remote --output backups/market-signal-ai-bot-prod-YYYYMMDD.sql
npm exec wrangler -- d1 migrations apply market-signal-ai-bot-db --remote
```

### Queues

For news and delivery services:

- Scan queue.
- Delivery queue if introduced.
- Dead Letter Queue.
- Retry policy.
- Monitoring for queue depth and failed jobs.

v0.1 Queue/DLQ requirements:

| Flow | Queue | DLQ | Producer | Consumer |
| --- | --- | --- | --- | --- |
| News scan | `market-signal-scan-<env>` | `market-signal-scan-dlq-<env>` | `telegram_company_matcher_app` scheduler/admin trigger | matcher scan Worker |
| Report/delivery | `market-signal-delivery-<env>` | `market-signal-delivery-dlq-<env>` | matcher after ticker match/access check | delivery Worker or matcher consumer |

Queue policy:

- Use `requestId` as the idempotency key across matcher, scanner, delivery, logs, and retries.
- Failed scanner calls and failed Telegram sends must not be marked as delivered.
- DLQ must be monitored; any non-empty production DLQ is an alert.
- Replay from DLQ must be manual for v0.1 until a reviewed replay endpoint/script exists.

### Secrets

Secrets must never be committed or stored as raw values in D1.

Core secrets:

- `ADMIN_TOKEN`
- `ADMIN_USERNAME`
- `INTERNAL_API_SECRET`
- `SUBSCRIPTION_WEBHOOK_SECRET`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_TOKEN_*`
- `STOCK_SIGNAL_SCANNER_TOKEN`
- `SCANNER_SHARED_SECRET`
- payment provider secrets

v0.1 required secrets per environment:

| Secret | dev | staging | production | Notes |
| --- | --- | --- | --- | --- |
| `ADMIN_TOKEN` | yes | yes | yes | Unique per env; rotate before launch. |
| `ADMIN_USERNAME` | optional | yes | yes | Non-secret value may be `vars` if acceptable. |
| `INTERNAL_API_SECRET` | legacy transition only | legacy transition only | legacy transition only | Use identified HMAC key IDs, split secrets or `INTERNAL_API_SECRETS_JSON`, and `INTERNAL_API_SCOPES_JSON` for internal routes. Bearer is not accepted. |
| `SUBSCRIPTION_WEBHOOK_SECRET` | yes | yes | yes | Replace when payment provider is selected. |
| `TELEGRAM_WEBHOOK_SECRET` | yes | yes | yes | Unique per bot/env. |
| `TELEGRAM_BOT_TOKEN` | test only | staging bot | production bot | Raw token must never appear in logs or payloads. |
| `TELEGRAM_BOT_TOKEN_*` | as needed | as needed | as needed | One secret per country/language bot. |
| `STOCK_SIGNAL_SCANNER_TOKEN` | yes | yes | yes | Required once scanner integration is live. |
| `SCANNER_SHARED_SECRET` | yes | yes | yes | Prefer signed internal requests. |
| Payment provider secrets | stub/test | sandbox | live | Blocked until provider decision. |

Secret rotation rule:

- Rotate one environment at a time.
- Update Worker secret, redeploy or restart if needed, run smoke checks, then revoke the old secret.
- Production rotations require an operator note with timestamp, owner, and smoke-check result.

## CI/CD

Minimum pipeline:

1. Install dependencies.
2. Run `npm run check`.
3. Run `npm test`.
4. Deploy to dev.
5. Run smoke checks.
6. Require manual approval for production.
7. Apply migrations.
8. Deploy production.
9. Verify `/api/health`.

Current CI/CD status:

- `.github/workflows/deploy.yml` runs dependency install, typecheck, D1 migrations, and deploy on `main`.
- The workflow currently does not run `npm test`.
- The workflow currently deploys directly from `main` without a separate dev/staging deploy gate or manual production approval.
- Production release is therefore `Ready with infrastructure risks`, not fully ready.

## Monitoring And Alerts

Monitor:

- Worker error rate.
- D1 errors.
- Queue depth.
- DLQ count.
- Failed scan runs.
- Failed Telegram deliveries.
- Scanner request failures.
- Subscription webhook failures.
- Internal access failures.
- Rate limit spikes.

Alert when:

- `/api/health` is not OK.
- Scanner is unavailable.
- Matcher has not scanned recently.
- DLQ is non-empty.
- Payment webhooks fail.
- Telegram delivery fails repeatedly.
- Production starts using dev secrets or dev endpoints.

v0.1 health check requirements:

- `/api/health` must return HTTP 200 and `ok: true`.
- Health payload must include environment and D1 checks for `users`, `subscriptions`, `bot_routes`, `api_keys`, and `analysis_requests`.
- Production monitor should check `/api/health` from outside Cloudflare at least once per minute after launch.
- Staging health check must pass before production approval.
- Failed health check after deploy triggers rollback review.

## Runbooks To Maintain

- Deploy Worker.
- Roll back Worker.
- Apply D1 migration.
- Recover from failed migration.
- Clear or replay DLQ.
- Reconfigure Telegram webhook.
- Rotate secrets.
- Investigate failed access checks.
- Investigate scanner outage.

First runbook list for v0.1:

### Deploy Worker

1. Run typecheck and tests.
2. Deploy to dev, then staging.
3. Run `/api/health` and access-check smoke tests.
4. Export production D1 before migrations.
5. Apply production migration after manual approval.
6. Deploy production Worker.
7. Verify `/api/health`, admin dashboard, and `/api/internal/access`.

### Roll Back Worker

1. Identify last known-good Worker version.
2. Roll back Worker version.
3. Re-run `/api/health`.
4. If D1 schema changed, do not run destructive rollback manually; escalate and prepare a forward-fix migration.

### Reset Telegram Webhook

1. Confirm correct environment and bot token secret.
2. Confirm `TELEGRAM_WEBHOOK_SECRET`.
3. Re-run admin webhook setup endpoint.
4. Verify Telegram sends requests with the configured secret token.

### Replay DLQ

1. Export DLQ message metadata first.
2. Confirm root cause is fixed.
3. Replay only idempotent messages using `requestId`.
4. Verify no duplicate delivery was sent.

### Rotate Secret

1. Create new secret value outside source control.
2. Put the secret into the target Worker environment.
3. Run smoke checks.
4. Revoke old value from upstream provider.
5. Record timestamp, environment, and validation result.

## Release Status

Max reports one of:

- `Infrastructure ready`
- `Ready with infrastructure risks`
- `Blocked`

Any risk involving secrets, production data loss, D1 migration failure, or paid-service outage must be escalated.

## v0.1 DevOps Status

Status: `Ready with infrastructure risks`

Confirmed:

- Environment separation plan is defined.
- Required secrets per environment are identified.
- D1 migration and backup/export approach is defined.
- Queue and DLQ requirements for matcher and delivery are defined.
- `/api/health` requirements are defined and current code checks core D1 tables.
- First deploy, rollback, webhook reset, DLQ replay, and secret rotation runbook list is prepared.

Infrastructure risks before production:

- `wrangler.jsonc` does not yet define separate dev/staging/production environments.
- Only one production-named D1 binding is currently configured.
- CI does not currently run `npm test`.
- CI does not currently require manual production approval.
- Payment provider secrets remain blocked by provider selection.
