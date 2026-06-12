# Market Signal AI Bot

Cloudflare Worker service for Telegram WebApp onboarding, user settings, subscription intake, and private admin monitoring.

## What This Service Does

- Registers Telegram WebApp users or website users.
- Stores language, email, risk profile, preferred tickers, delivery settings, and one or more selected news countries.
- Accepts subscription events from a website, payment provider, or another trusted source.
- Returns Telegram chat links for the selected news countries.
- Lets a returning user remove country/chat bindings from their account.
- Provides a private admin dashboard at `/admin`.
- Writes audit events for account, settings, and subscription activity.

## Current WebApp Chat Choices

The public WebApp currently allows only these news chat choices:

- Israel news in Hebrew: `@Israel_News_Ticker_Scanner_bot`
- US news in Russian: `@US_News_Ticker_Scanner_RU_bot`

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
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put INTERNAL_API_SECRET
npx wrangler secret put SUBSCRIPTION_WEBHOOK_SECRET
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

Optional public checkout URL in `wrangler.jsonc`:

```jsonc
"SUBSCRIPTION_CHECKOUT_URL": "https://your-site.example/checkout"
```

When this value is configured, the Telegram WebApp can send a newly registered user to your subscription checkout with `userId` appended to the URL.

Optional CORS allowlist in `wrangler.jsonc`:

```jsonc
"ALLOWED_ORIGINS": "https://market-signal-ai-bot.fnemoy.workers.dev,https://your-site.example"
```

If `ALLOWED_ORIGINS` is empty, the Worker keeps wildcard CORS behavior. If it is set, only listed origins are reflected.

`ADMIN_USERNAME` is optional. If it is configured, `/admin` and `/api/admin/*` require both the admin name and `ADMIN_TOKEN`.

`ADMIN_TOKEN` is the private password for `/admin` and `/api/admin/*`. Rotate it with:

```powershell
npx wrangler secret put ADMIN_TOKEN
npm run deploy
```

Deploy:

```powershell
npm run deploy
```

## Telegram Web App Setup

Create a bot in BotFather and set the returned token as `TELEGRAM_BOT_TOKEN`.

`TELEGRAM_WEBHOOK_SECRET` is a private random string used by Telegram when it calls `/api/telegram/webhook`.

After deploy, configure Telegram from the deployed Worker URL:

```powershell
$adminToken = "your-admin-token"
$appUrl = "https://market-signal-ai-bot.your-subdomain.workers.dev"
Invoke-RestMethod `
  -Method Post `
  -Uri "$appUrl/api/admin/telegram/setup" `
  -Headers @{ Authorization = "Bearer $adminToken" } `
  -ContentType "application/json" `
  -Body (@{ appUrl = $appUrl } | ConvertTo-Json)
```

This setup call registers:

- Telegram webhook: `/api/telegram/webhook`.
- Bot commands: `/start` and `/app`.
- Telegram chat menu button that opens the Web App.

In BotFather, also set the bot domain to the deployed Worker host if Telegram asks for a Web App domain.

## Main URLs

- `/` Telegram WebApp account setup screen.
- `/admin` private monitoring dashboard.
- `/api/register` create or update user.
- `/api/settings` update user settings.
- `/api/account` get account details and linked country chats.
- `/api/account/countries` remove a linked country chat.
- `/api/subscriptions` receive external subscription event.
- `/api/internal/access` internal subscription/access check for service-to-service delivery decisions.
- `/api/telegram/webhook` receive Telegram bot updates.
- `/api/admin/telegram/setup` configure Telegram webhook, commands, and Web App menu button.
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
  "displayName": "User Name",
  "language": "en",
  "country": "US",
  "provider": "website",
  "externalId": "sub_123",
  "plan": "pro",
  "status": "active",
  "currentPeriodEnd": "2026-07-02T00:00:00Z"
}
```

If `userId` is not provided, the service looks up the user by Telegram ID or email. If no user exists yet and the payload includes email or Telegram ID, the service creates a user with the provided country/language or the defaults from `wrangler.jsonc`.

The response includes `botUrl` only when the subscription status is `trialing` or `active` and the selected country has an active bot route.

## Operational Guards

- `/api/health` checks D1 plus `users`, `subscriptions`, and `bot_routes`.
- Rate limiting is applied to registration, settings, subscription intake, and admin API routes.
- Internal service access uses `INTERNAL_API_SECRET` via Bearer token or HMAC.

Run checks and tests:

```powershell
npm run check
npm test
```

## Admin Access

Open `/admin`, enter the admin name and `ADMIN_TOKEN`, and the dashboard will load users, subscriptions, and recent audit events.

The admin dashboard also manages editable user rows, country bot routes, and the right-side audit event log.

## GitHub Auto Deploy

The workflow in `.github/workflows/deploy.yml` deploys on every push to `main`.

Add this GitHub Actions secret:

```text
CLOUDFLARE_API_TOKEN
```

Add this GitHub Actions repository variable:

```text
CLOUDFLARE_ACCOUNT_ID
```

The token needs Cloudflare Workers Scripts write and D1 write permissions for this exact account. The D1 `database_id` in `wrangler.jsonc` must also belong to the same account.

## Next Steps

- Add Telegram init data signature verification before production launch.
- Replace placeholder `bot_routes` URLs in the D1 table with real country chatbots.
- Connect payment provider webhooks with signed payload verification.
- Add news ingestion and ticker analysis workers after the account/subscription layer is stable.
