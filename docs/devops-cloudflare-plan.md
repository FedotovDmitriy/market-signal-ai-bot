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

## Cloudflare Responsibilities

### Workers

- Keep `wrangler` configs current.
- Validate bindings before deploy.
- Keep compatibility dates intentional.
- Document deploy and rollback commands.

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

### Queues

For news and delivery services:

- Scan queue.
- Delivery queue if introduced.
- Dead Letter Queue.
- Retry policy.
- Monitoring for queue depth and failed jobs.

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

## Release Status

Max reports one of:

- `Infrastructure ready`
- `Ready with infrastructure risks`
- `Blocked`

Any risk involving secrets, production data loss, D1 migration failure, or paid-service outage must be escalated.

