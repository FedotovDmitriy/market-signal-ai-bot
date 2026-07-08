# QA Plan

## Role

Lena is the QA engineer for Market Signal AI.

Her job is to protect product quality across the SaaS account, subscription, Telegram delivery, API access, and ticker analysis flows.

## Main Test Areas

### User Account

- Registration with required email.
- Email confirmation before protected account actions.
- Login with protected session.
- Login with Google OAuth.
- Login with Telegram WebApp.
- Telegram account linking to an existing email account.
- Returning user account load.
- Profile update.
- Country/language selection.
- Removing a country link.
- Logout invalidates the active session.
- CSRF protection blocks state-changing browser requests without a valid token.

### Subscription And Access

- Active subscription allows access.
- Expired subscription blocks access.
- Canceled subscription behavior follows product policy.
- User without subscription cannot receive paid channels or analysis.
- User with one country cannot access another country.
- Internal access endpoint blocks unsupported country/language combinations.

### Telegram

- `/start` and `/app` open the WebApp.
- Telegram init data is required when configured.
- Country chat links appear only when allowed.
- Telegram delivery errors are logged.
- Duplicate news does not cause duplicate user delivery.

### API Access

- User can create an API key.
- API commercial-use acceptance checkbox is not pre-checked.
- API commercial-use acceptance stores version and timestamp.
- API key prefix and hash behavior is safe.
- Disabled API key cannot be used.
- Usage is counted.
- Rate limits return `429`.
- Another user's API key cannot access private data.

### Service Integration

- `telegram_company_matcher_app` builds a valid scanner payload.
- `stock-signal-scanner` rejects invalid payloads.
- `telegram_company_matcher_app` checks access before delivery.
- Scanner downtime does not mark delivery as successful.
- Retried `requestId` does not create duplicate delivery.

### Admin

- Admin auth is required.
- User list pagination works.
- Subscription data is visible.
- Bot routes can be managed.
- Audit events are visible.
- API usage dashboard is visible.

### Payment Sandbox

- Paddle or Lemon Squeezy sandbox checkout creates a subscription event.
- Successful checkout maps to active subscription access.
- Failed payment maps to payment-failed or blocked paid access state.
- Cancellation maps to canceled subscription policy.
- Renewal maps to a new valid current period.
- Refund or chargeback maps to the agreed access policy.
- Duplicate webhook events do not create duplicate subscription rows or duplicate access grants.
- Checkout cannot complete without required subscription, renewal, and risk acknowledgments.
- Merchant of Record hosted checkout wording matches Terms, Subscription Terms, Refund Policy, and Risk Disclaimer.

## v0.1 Regression Checklist

Run before the v0.1 production gate.

### Automated Gate

- `npm run check` passes.
- `npm test` passes.
- Account API smoke tests cover `/api/me/api-keys` and `/api/me/analysis-history`.
- Protected account/API endpoints reject attempts to read another account by changing `userId`, `email`, or `telegramUserId`.
- Telegram WebApp init data verification is covered.
- Strict Telegram registration blocks unsigned `telegramUserId`.
- Subscription access helper blocks expired and missing subscriptions.
- `/api/internal/access` blocks unauthenticated service calls.
- CORS allowlist accepts configured origins and rejects unknown origins.
- Rate limit returns `429` with `rate_limited` when a bucket is exhausted.
- `/api/health` checks D1 plus `users`, `subscriptions`, `bot_routes`, `api_keys`, and `analysis_requests`.

### Manual Release Gate

- Register a new website user with required email.
- Confirm email must be verified before protected session/account actions that require verified identity.
- Confirm Google OAuth login creates or links the correct account and does not overwrite another user's account.
- Confirm Telegram login creates or links the correct account only after signed Telegram init data and explicit linking flow.
- Confirm state-changing browser actions fail without a valid CSRF token.
- Confirm logout/session expiry blocks reuse of the old session.
- Register or update a Telegram WebApp user with signed init data.
- Confirm unsigned Telegram registration is blocked when `ALLOW_UNVERIFIED_TELEGRAM` is not `true`.
- Confirm account, API key, subscription, and analysis-history endpoints reject `userId`, `email`, and `telegramUserId` tampering.
- Create or simulate an active subscription and confirm paid access is allowed.
- Simulate an expired subscription and confirm paid access is blocked.
- Confirm a user without subscription cannot receive paid bot/channel access.
- Confirm user with access to one country cannot access another selected country unless linked.
- Confirm `/api/internal/access` returns allowed only for supported country/language, linked country, configured bot route, and active subscription.
- Confirm `/api/internal/access` rejects missing/invalid bearer token or HMAC signature.
- Confirm CORS behavior for production allowed origins and an unknown origin.
- Confirm rate limits are enforced for registration, account APIs, subscription intake, and admin APIs.
- Confirm `/api/health` is OK after migrations are applied.
- Confirm admin dashboard loads users, subscriptions, audit events, API usage, channels, bot routes, and integration errors/logs where available.
- Confirm Telegram webhook rejects wrong secret token and handles duplicate/replayed updates without duplicate paid delivery.
- Confirm staging Telegram flow covers webhook -> matcher -> access check -> scanner request -> retry/resend -> delivery status.
- Confirm API key list/create/revoke flow does not expose another user's keys.
- Confirm analysis history displays request status and does not expose another user's history.

### Payment Sandbox Gate

- Run Paddle sandbox checkout if Paddle is selected.
- Run Lemon Squeezy sandbox checkout if Lemon Squeezy is selected.
- Confirm checkout success, failed payment, cancellation, renewal, refund, and duplicate webhook behavior.
- Confirm subscription lifecycle events are signed and rejected when the signature is missing, invalid, or expired.
- Confirm Merchant of Record customer portal cancellation changes access according to product policy.
- Confirm billing UI shows active, expired, canceled, payment failed, and renewal states correctly.
- Confirm subscription webhook replay is idempotent.

### Legal And Disclaimer Acceptance Criteria

- Risk Disclaimer link is visible from landing, pricing, signup, dashboard, ticker analysis, API docs, Telegram start message, and reports.
- Paid checkout cannot complete without subscription and risk acknowledgment checkbox.
- Legal acceptance checkboxes are not pre-checked.
- Accepted Terms, Privacy Policy, Risk Disclaimer, Subscription Terms, and API Terms store document version and timestamp where applicable.
- First ticker analysis cannot run until the user accepts the Risk Disclaimer.
- Telegram `/start` includes the short disclaimer.
- Telegram signal-style messages include a short "info only / not investment advice" footer where practical.
- Reports include report disclaimer in exported and on-screen versions.
- API docs include API disclaimer and link to API Terms.
- API key creation requires API Terms acknowledgment before first key.
- No UI, Telegram text, report, or API output says or implies guaranteed profit, personal recommendation, risk-free result, or instruction to buy/sell/hold.

## Bug Report Format

Every bug report should include:

- Title.
- Environment.
- Service.
- Severity: blocker, high, medium, low.
- Steps to reproduce.
- Expected result.
- Actual result.
- Logs, screenshots, or request IDs.
- Suggested owner: Yasha, service manager, Max, or Glasha.

## Release Status

Lena reports one of:

- `Ready for production`
- `Ready with risks`
- `Blocked`

Payment, access, data leak, and subscription bugs are always high or blocker severity.
