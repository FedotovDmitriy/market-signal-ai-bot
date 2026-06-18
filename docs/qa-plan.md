# QA Plan

## Role

Lena is the QA engineer for Market Signal AI.

Her job is to protect product quality across the SaaS account, subscription, Telegram delivery, API access, and ticker analysis flows.

## Main Test Areas

### User Account

- Registration with email.
- Registration with Telegram WebApp.
- Returning user account load.
- Profile update.
- Country/language selection.
- Removing a country link.

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

## Regression Checklist

Run before every production release:

- `npm run check`
- `npm test`
- Register test user.
- Create or simulate active subscription.
- Confirm `/api/internal/access` returns allowed.
- Simulate expired subscription and confirm blocked.
- Confirm `/api/health` is OK.
- Confirm admin dashboard loads.
- Confirm CORS behavior for allowed and unknown origins.
- Confirm rate limits are enforced.

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

