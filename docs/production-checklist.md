# Production Checklist

Use this checklist before a production launch or major release.

## Product

- Product is treated as one SaaS with website account as the center.
- Telegram is a delivery channel, not the only product surface.
- Pricing and subscription rules are documented.
- Country/language access rules are documented.
- API usage rules are documented.
- API outputs policy is approved: display is allowed only with attribution and restrictions; resale and redistribution require written agreement.
- Первые страны и языки запуска подтверждены: Израиль/иврит и США/русский.
- Новые страны и языки можно добавлять через админку.
- Email обязателен для каждого аккаунта, включая пользователей, которые входят через Telegram или Google.
- Financial/investment disclaimer is approved.
- Terms of Service and Privacy Policy are approved.

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

## Security Gate

- Current v1.0 security status from Roman: `Blocked`.
- Public v1.0 must not launch until website sessions, CSRF protection, Google OAuth, admin hardening, webhook idempotency, internal body signatures, and API-token enforcement are implemented and tested, unless management explicitly accepts a lower status with documented compensating controls.
- Website account APIs derive user identity from authenticated sessions, not caller-supplied `userId`, `email`, or `telegramUserId`.
- Google OAuth, if enabled, uses PKCE, `state`, `nonce`, issuer/audience/expiry validation, verified email checks, and redirect allowlisting.
- Telegram login/linking requires valid signed init data and production keeps `ALLOW_UNVERIFIED_TELEGRAM=false`.
- Secure cookies use `HttpOnly`, `Secure`, `SameSite=Lax` or stricter, and production `__Host-` cookie names.
- CSRF protection is active for cookie-authenticated write requests.
- Admin auth does not accept tokens in URL query parameters.
- Admin access has failed-attempt rate limits, audit logs, and least-privilege roles or a documented temporary exception.
- API tokens are stored as keyed hashes, only prefixes are shown after creation, scopes are allowlisted, and revoke/rotation is audited.
- Internal service HMAC signatures include timestamp, method, path, query, and request body digest.
- Subscription webhooks have signature validation, timestamp replay protection, and provider event id idempotency.
- Scanner API requires service-to-service auth, validates `contractVersion: "1.0"`, enforces idempotency by `requestId`, and never receives raw Telegram bot tokens.
- Scanner-to-core access/quota check uses `POST /api/internal/access/check`; billing, ownership, and quota ledger stay in `market-signal-ai-bot`.
- Secret scan is clean for source, deploy artifacts, D1, and logs.
- Production status is explicitly recorded as `Security ready`, `Ready with security risks`, or `Blocked`.

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

- Dev/prod are separated for the current phase; staging is deferred.
- Production secrets are not reused from dev.
- Production D1 is not dev D1.
- Production queues are not dev queues.
- Health checks are monitored.
- DLQ is monitored.
- Rollback path is documented.
- Secret rotation process is documented.

## Legal / Compliance

- Terms of Service are ready.
- Privacy Policy is ready.
- Subscription Terms are ready.
- Refund Policy is ready.
- API Terms of Use are ready.
- Risk Disclaimer is ready.
- Telegram bot/channel disclaimer is ready.
- Website footer links to legal documents.
- Ticker analysis pages show or link to financial disclaimer.
- API docs include API terms and redistribution limits.
- Product language does not promise returns.
- Product language does not present outputs as personalized investment advice.
- Third-party market-data restrictions are reviewed.

## Юрисдикция / платежи

- Юрисдикция бизнеса выбрана.
- Основное направление по платежному провайдеру выбрано.
- Платежный провайдер поддерживает выбранную юрисдикцию.
- Состояния жизненного цикла подписки сопоставлены с логикой `market-signal-ai-bot`.
- Требования к счетам и квитанциям проверены.
- Политика возвратов и отмены подписки проверена с учетом требований провайдера и юрисдикции.
- Вопросы по налогам, НДС и sales tax подготовлены для квалифицированного бухгалтера или локального консультанта.

## Безопасность

- Модель угроз для входа через Telegram проверена.
- Модель угроз для входа через Google проверена.
- Безопасность сессий сайта проверена.
- Хеширование API-токенов, показ только префикса, ротация, отзыв, права доступа и логи использования проверены.
- Внутренние эндпоинты используют только HMAC-авторизацию с отдельным key id для каждого сервиса, уникальным request id, подписью метода/пути/query/тела и защитой от повторного воспроизведения. Bearer-секрет для внутренних endpoint-ов запрещён.
- Каждый internal key id имеет явные endpoint scopes; ключ matcher не может вызывать scanner access/cache endpoint-ы, а ключ scanner не может вызывать matcher delivery endpoint-ы.
- Админ-эндпоинты не принимают секреты в URL.
- Подписи вебхуков обязательны и протестированы.
- Production-секреты разделены по окружениям, процесс ротации существует.
- Секреты не хранятся в коде, D1 или логах в открытом виде.

## Go / No-Go

Release requires:

- Developer approval.
- Designer approval for user-facing surfaces.
- QA approval.
- DevOps approval.
- Legal / compliance approval.
- Подтверждение юрисдикции и платежей.
- Подтверждение безопасности.
- Project manager approval.
- Main manager approval.
