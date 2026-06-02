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

Send subscription events with the shared secret:

```http
POST /api/subscriptions
Content-Type: application/json
X-Webhook-Secret: <SUBSCRIPTION_WEBHOOK_SECRET>
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

## Next Steps

- Add Telegram init data signature verification before production launch.
- Replace placeholder `bot_routes` URLs in the D1 table with real country chatbots.
- Connect payment provider webhooks with signed payload verification.
- Add news ingestion and ticker analysis workers after the account/subscription layer is stable.
