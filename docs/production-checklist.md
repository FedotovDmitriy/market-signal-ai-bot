# Production Checklist

Use this checklist before a production launch or major release.

## Product

- Product is treated as one SaaS with website account as the center.
- Telegram is a delivery channel, not the only product surface.
- Pricing and subscription rules are documented.
- Country/language access rules are documented.
- API usage rules are documented.

## market-signal-ai-bot

- `ALLOW_UNVERIFIED_TELEGRAM=false`.
- `INTERNAL_API_SECRET` is set.
- `SUBSCRIPTION_WEBHOOK_SECRET` is set.
- `TELEGRAM_WEBHOOK_SECRET` is set.
- `ADMIN_TOKEN` is set and recently rotated.
- `/api/health` returns OK.
- D1 migrations are applied.
- `bot_routes` are real production routes.
- CORS allowlist is configured for production.
- Rate limiting is active.
- API key tables exist.
- Subscription expiry is checked with `current_period_end`.

## telegram_company_matcher_app

- Uses production D1.
- Uses production queues.
- Uses production DLQ.
- Uses production Telegram sources.
- Uses production bot secrets.
- Calls `market-signal-ai-bot /api/internal/access` before user-targeted delivery.
- Sends scanner payload with `contractVersion: "1.0"`.
- Has retry and resend-unsent behavior.
- Does not mark failed scanner delivery as sent.

## stock-signal-scanner

- Validates `contractVersion: "1.0"` payloads.
- Rejects invalid payloads with structured errors.
- Uses idempotency by `requestId`.
- Returns structured reports.
- Does not require user subscription knowledge.
- Does not receive raw Telegram bot tokens.

## QA

- Regression checklist is complete.
- Active subscription allows access.
- Expired subscription blocks access.
- Internal endpoint rejects invalid auth.
- Scanner rejects invalid payload.
- Duplicate news/request does not duplicate delivery.
- Admin dashboard works.

## DevOps

- Dev/staging/prod are separated.
- Production secrets are not reused from dev.
- Production D1 is not dev D1.
- Production queues are not dev queues.
- Health checks are monitored.
- DLQ is monitored.
- Rollback path is documented.
- Secret rotation process is documented.

## Go / No-Go

Release requires:

- Developer approval.
- Designer approval for user-facing surfaces.
- QA approval.
- DevOps approval.
- Project manager approval.
- Main manager approval.

