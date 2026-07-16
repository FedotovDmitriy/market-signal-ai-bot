# Market Signal AI Bot

Cloudflare Worker service for Telegram WebApp onboarding, user settings, subscription intake, and private admin monitoring.

## What This Service Does

- Registers Telegram WebApp users or website users.
- Stores language, email, risk profile, preferred tickers, delivery settings, and one or more selected news countries.
- Accepts subscription events from a website, payment provider, or another trusted source.
- Returns Telegram chat links for the selected news countries.
- Lets a returning user remove country/chat bindings from their account.
- Provides SaaS core APIs for user dashboard, profile, subscription status, API keys, and analysis request history.
- Provides a private admin dashboard at `/admin`.
- Writes audit and API usage events for account, settings, subscription, and internal service activity.
- Acts as the core account, subscription, access, API key, and usage service for the Market Signal AI SaaS product.

## Documentation

Start here:

- `docs/documentation-index.md` - documentation map.
- `docs/saas-product-architecture.md` - SaaS product and service boundaries.
- `docs/integration-contract.md` - shared service contract and internal access check.
- `docs/team-roles.md` - team roles and release responsibilities.
- `docs/qa-plan.md` - QA responsibilities and regression checklist.
- `docs/devops-cloudflare-plan.md` - Cloudflare infrastructure plan.
- `docs/production-checklist.md` - production readiness checklist.

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
npx wrangler secret put INTERNAL_API_KEY_ID
npx wrangler secret put API_KEY_HASH_SECRET
npx wrangler secret put INTERNAL_API_SECRETS_JSON
npx wrangler secret put INTERNAL_API_SCOPES_JSON
npx wrangler secret put EMAIL_VERIFICATION_SECRET
npx wrangler secret put EMAIL_FROM
npx wrangler secret put SUBSCRIPTION_WEBHOOK_SECRET
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

Optional public checkout URL in `wrangler.jsonc`:

```jsonc
"SUBSCRIPTION_CHECKOUT_URL": "https://your-site.example/checkout"
```

When this value is configured, authenticated user-session flows can request a checkout URL through `/api/me/subscription/checkout`. Browser code must not call internal HMAC subscription routes directly.

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

- `/` commercial SaaS landing page.
- `/pricing` SaaS pricing page.
- `/signup` and `/login` account access screens.
- `/onboarding` post-registration setup flow.
- `/dashboard` user dashboard.
- `/channels` country, language, and channel selection.
- `/api-access` API access and key management screen.
- `/ticker` ticker analysis workspace.
- `/reports` analysis report history.
- `/billing` subscription and billing screen.
- `/telegram` Telegram WebApp quick account entry.
- `/admin` private monitoring dashboard.
- `/api/health` service and core table health check.
- `/api/config` public WebApp/SaaS configuration.
- `/api/register` create or update a user only through a verified identity provider. Email-only registration remains closed until confirmation email delivery is configured.
- `/api/auth/email/request` send a 15-minute passwordless email verification link.
- `/api/auth/email/verify` consume the one-time link, create/login the verified account, and provision the free `beta` plan when no active plan exists.
- `/api/session/bootstrap` exchange signed Telegram init data for a Core `ms_session` cookie and CSRF token.
- `/api/session/csrf` refresh a CSRF token using a valid Core `ms_session` cookie after page reload.
- `/api/settings` update user settings.
- `/api/account` get account details and linked country chats.
- `/api/account/countries` remove a linked country chat.
- `/api/me` get the SaaS user dashboard payload: profile, linked chats, current subscription, API keys, and recent analysis history.
- `/api/me/profile` update profile, language, and selected countries.
- `/api/me/subscription` list user subscription records and current access state.
- `/api/me/subscription/checkout` create a user-session checkout URL when `SUBSCRIPTION_CHECKOUT_URL` is configured.
- `/api/me/subscription/portal` create a user-session billing portal URL when `SUBSCRIPTION_PORTAL_URL` is configured.
- `/api/me/api-keys` list, create, or revoke user API keys. New raw tokens are returned only once on creation.
- `/api/me/api-keys/rotate` atomically revoke one key and return its replacement token once.
- `/api/me/analysis-history` list user analysis request history.
- `/api/me/analysis-requests` submit a premium private analysis request from an authenticated website session.
- `/api/analysis/requests` submit an analysis request using a scoped user API key.
- `/api/subscriptions` receive external subscription event.
- `/api/internal/subscriptions` receive website subscription events through HMAC scope `website:subscriptions`.
- `/api/internal/access` internal subscription/access check for service-to-service delivery decisions.
- `/api/internal/access/check` production scanner access and quota decision with idempotency by `requestId`.
- `/api/internal/access/cache/commit` commit a successful scanner result using a one-time Core-issued cache receipt.
- `/api/internal/deliver` idempotently deliver a matcher-owned plain-text message to a Core-resolved Telegram user or channel route.
- `/api/internal/analysis-requests` internal endpoint for trusted services to record analysis request history.
- `/api/telegram/webhook` receive Telegram bot updates.
- `/api/admin/telegram/setup` configure Telegram webhook, commands, and Web App menu button.
- `/api/admin/overview` private summary metrics.
- `/api/admin/users` private user list.
- `/api/admin/events` private audit log.
- `/api/admin/subscriptions` private subscription monitoring.
- `/api/admin/api-usage` private API usage monitoring.
- `/api/admin/channels` private channel and linked-user monitoring.
- `/api/admin/bot-routes` private bot route list, upsert, and delete endpoint.
- `/api/admin/bot-routes` private channel route management.

## Subscription Intake

Send subscription events with an HMAC signature. The signature payload is:

```text
<unix_timestamp_seconds>.<raw_json_body>
```

Sign it with `SUBSCRIPTION_WEBHOOK_SECRET` using HMAC-SHA256 and send. This legacy route is for trusted subscription intake only; browser code must not call it directly.

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

If `userId` is not provided, the service may resolve an existing user by verified Telegram ID or verified email. It does not create or attach a paid subscription using an unverified email-only identity; checkout integrations should pass the core `userId`.

The response includes `botUrl` only when the subscription status is `trialing` or `active` and the selected country has an active bot route.

## Operational Guards

- `/api/health` checks D1 plus account, subscription, session, legal acceptance, API usage, and quota tables.
- Rate limiting is applied to registration, settings, user account APIs, subscription intake, and admin API routes.
- Private account APIs use the `ms_session` HttpOnly cookie. Cookie-authenticated write requests require `X-CSRF-Token`.
- Website session bootstrap trusts signed Telegram init data or an existing Core session only. Browser-supplied `email` or `userId` never establishes account ownership. Website Worker/browser flows use `/api/session/bootstrap`, `/api/session/csrf`, and `/api/me/*`; HMAC remains reserved for backend-only `/api/internal/*` routes.
- Email ownership is never inferred from address equality. Email signup/login uses a one-time HMAC-hashed link that expires after 15 minutes; only successful consumption sets `email_verified_at` and issues a session. A verified user without an active plan receives the free `beta` plan with 25 analysis units (50 half-credits).
- User API analysis requires a Bearer API key with `analysis:write`, an active key/user/subscription, and available key/user/IP rate limits and analysis quota. `API_KEY_HASH_SECRET` is required for keyed token hashes. Keys created before migration `0011_api_auth_and_internal_replay.sql` return `api_key_rotation_required` and must be replaced.
- Telegram channel delivery and private ticker analysis are separate access paths. Country/language channels are broadcast-only destinations. Private Telegram ticker requests are accepted only from a user's private chat, require an active premium plan (`pro`/`premium`) and available quota, and are recorded as private analysis requests. Broadcast channels and groups cannot be used as arbitrary user ticker request destinations.
- Internal service access is HMAC-only. Every request requires `X-Key-Id`, unique `X-Request-Id`, `X-Timestamp`, and `X-Signature`; replayed request IDs are rejected.

Internal signing canonical value:

```text
<timestamp>.<key_id>.<request_id>.<method>.<pathname>.<canonical_query>.<sha256_raw_body>
```

Use `INTERNAL_API_SECRETS_JSON` as a secret JSON object for key rotation, for example `{"scanner-v1":"<32+ byte secret>","matcher-v1":"<different 32+ byte secret>"}`. A single caller can also be added without rewriting the shared keyring by setting a split secret named `INTERNAL_API_SECRET_<KEY_ID_NORMALIZED>`, for example `matcher-dev-v1` reads `INTERNAL_API_SECRET_MATCHER_DEV_V1` and `website-dev-v1` reads `INTERNAL_API_SECRET_WEBSITE_DEV_V1`. Configure a separate mandatory `INTERNAL_API_SCOPES_JSON`, for example `{"scanner-v1":["scanner:access","scanner:cache","scanner:history"],"matcher-v1":["matcher:access","matcher:deliver"],"website-dev-v1":["website:subscriptions"]}`. A valid signature never grants permissions absent from this explicit map, and scope rejection happens before nonce consumption. The legacy single `INTERNAL_API_SECRET` works only when `INTERNAL_API_KEY_ID` identifies it; Bearer authentication is not accepted for internal service routes.

Email verification uses the Cloudflare Email Service `EMAIL` binding. Enable a sender domain, set `EMAIL_FROM` to an address on that domain, and set a separate random `EMAIL_VERIFICATION_SECRET` of at least 32 bytes. Raw verification tokens are sent by email once and are never stored in D1.

API analysis request example:

```http
POST /api/analysis/requests
Authorization: Bearer msk_live_<token>
Content-Type: application/json

{"requestId":"req_123","ticker":"NVDA","reportType":"regular","forceRefresh":false,"language":"ru"}
```

The API key must include `analysis:write`. An accepted request returns HTTP `202` after subscription, rate-limit, and quota checks and is added to analysis history.

Scanner access uses contract `1.1`. Migration `0012_access_contract_v11_half_credits.sql` keeps the `1.0` journal intact, stores new quota usage as integer half-credits, and persists decisions in `quota_decisions_v11` under `(requestId, ticker)`. Migration `0013_core_cache_receipts.sql` adds one-time cache receipts and the Core-owned cache ledger. Scanner cache metadata is diagnostic only: a cache discount is granted only for an unexpired committed Core entry with matching ticker, report type, generation, and language. Allowed new/refresh decisions return a receipt that the scanner must commit within 15 minutes after successful generation. Exact access repeats return the same receipt without another charge; same-digest commit repeats are idempotent.

Create or reset the isolated QA fixture in the remote dev database only:

```powershell
npm run db:seed:test-user:dev
```

The fixture uses user `dev_test_scanner_user`, non-deliverable email `scanner-fixture@example.invalid`, and active `pro` subscription `dev_test_scanner_subscription`. It contains no Telegram identity, API key, token, or production personal data. Never apply `scripts/dev/seed-test-user.sql` to production.

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

- Finalize the real `stock-signal-scanner` analysis payload shape.
- Keep matcher-to-scanner payload compatibility documented separately; scanner-to-core access checks must use `contractVersion: "1.1"`.
- Connect payment provider lifecycle events to subscription status and period end.
- Complete production Cloudflare separation for dev, staging, and production.
