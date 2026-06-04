# Market Signal AI Bot

Cloudflare Worker service for Telegram WebApp onboarding, user settings, subscription intake, and private admin monitoring.

## What This Service Does

- Registers Telegram WebApp users or website users.
- Stores country, language, risk profile, preferred tickers, and delivery settings.
- Accepts subscription events from a website, payment provider, or another trusted source.
- Returns the Telegram bot link for the selected country.
- Provides a private admin dashboard at `/admin`.
- Writes audit events for account, settings, and subscription activity.

## Cloudflare Setup

Create a D1 database:

```powershell
npx wrangler d1 create market-signal-ai-bot-db
```

Copy the returned `database_id` into `wrangler.jsonc`.

Apply migrations:

```powershell
npx wrangler d1 migrations apply market-signal-ai-bot-db --remote
```

Set secrets:

```powershell
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put SUBSCRIPTION_WEBHOOK_SECRET
npx wrangler secret put TELEGRAM_BOT_TOKEN
```

`ADMIN_TOKEN` is the private password for `/admin` and `/api/admin/*`. Rotate it with:

```powershell
npx wrangler secret put ADMIN_TOKEN
npm run deploy
```

Deploy:

```powershell
npm run deploy
```

## Main URLs

- `/` Telegram WebApp account setup screen.
- `/admin` private monitoring dashboard.
- `/api/register` create or update user.
- `/api/settings` update user settings.
- `/api/subscriptions` receive external subscription event.
- `/api/admin/overview` private summary metrics.
- `/api/admin/users` private user list.
- `/api/admin/events` private audit log.

## Subscription Intake

Send subscription events with an HMAC signature. The signature payload is:

```text
<unix_timestamp_seconds>.<raw_json_body>
```

Sign it with `SUBSCRIPTION_WEBHOOK_SECRET` using HMAC-SHA256 and send:

```http
POST /api/subscriptions
Content-Type: application/json
X-Timestamp: <unix_timestamp_seconds>
X-Signature: sha256=<hex_hmac_sha256>
```

```json
{
  "email": "user@example.com",
  "provider": "website",
  "externalId": "sub_123",
  "plan": "pro",
  "status": "active",
  "currentPeriodEnd": "2026-07-02T00:00:00Z"
}
```

## Admin Access

Open `/admin`, enter `ADMIN_TOKEN`, and the dashboard will load users, subscriptions, and recent audit events.

The admin dashboard also manages country bot routes and approved news sources for the upstream news pipeline.

## GitHub Auto Deploy

The workflow in `.github/workflows/deploy.yml` deploys on every push to `main`.

Add this GitHub Actions secret:

```text
CLOUDFLARE_API_TOKEN
```

The token needs Cloudflare Workers Scripts write and D1 write permissions for the target account.

## Next Steps

- Add Telegram init data signature verification before production launch.
- Replace placeholder `bot_routes` URLs in the D1 table with real country chatbots.
- Connect payment provider webhooks with signed payload verification.
- Add news ingestion and ticker analysis workers after the account/subscription layer is stable.
