# Security Threat Model and v1.0 Readiness

Owner: Cybersecurity / Application Security
Scope: Market Signal AI SaaS account core, Telegram WebApp/login, website account APIs, admin dashboard, internal service endpoints, subscription webhooks, API keys, and scanner integration.

## Executive Status

Status for v1.0: **Blocked**

The current code has useful security controls for Telegram WebApp init data, subscription webhook HMAC signatures, internal endpoint auth, API key hashing, audit events, and rate limiting. However, the public website account APIs still trust caller-supplied `userId`, `email`, or `telegramUserId` without an authenticated website session. Google OAuth is not implemented in this repository. A commercial SaaS launch must not proceed until real website authentication, session binding, CSRF protection, and account-linking controls are implemented and tested.

## Assets

- User accounts, Telegram IDs, email addresses, subscription status, country links, selected bot URLs, settings, and analysis history.
- API tokens and API usage metadata.
- Admin dashboard access and admin actions.
- Internal service trust boundary between account core, telegram matcher, and stock signal scanner.
- Subscription webhook integrity.
- Worker secrets: `ADMIN_TOKEN`, `INTERNAL_API_SECRET`, `SUBSCRIPTION_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, scanner/payment provider secrets.
- D1 data, audit logs, and operational logs.

## Trust Boundaries

- Browser or Telegram WebApp -> Market Signal AI Worker.
- Google OAuth provider -> Market Signal AI callback endpoint, once implemented.
- Telegram client/WebApp -> Market Signal AI Worker through signed init data.
- Telegram Bot API -> `/api/telegram/webhook`.
- Payment provider or billing system -> `/api/subscriptions`.
- Internal services -> `/api/internal/access` and `/api/internal/analysis-requests`.
- Admin browser -> `/admin` and `/api/admin/*`.
- Market Signal AI services -> stock signal scanner API.

## Threat Model

### Telegram Login and WebApp

Threats:

- Forged `telegramUserId` registration without signed Telegram init data.
- Replay of old `initData`.
- Account takeover through linking a victim email to an attacker-controlled Telegram identity.
- XSS in WebApp exposing locally stored `marketSignalUserId`.
- Bot webhook spoofing or replay.

Current controls:

- Telegram init data is verified with bot-token-derived HMAC.
- `auth_date` older than 24 hours is rejected.
- Strict mode blocks unsigned `telegramUserId` when `ALLOW_UNVERIFIED_TELEGRAM` is not `true`.
- Telegram webhook checks `X-Telegram-Bot-Api-Secret-Token` when configured.

Required before v1.0:

- Keep `ALLOW_UNVERIFIED_TELEGRAM=false` in production.
- Shorten Telegram init data acceptance to 5-15 minutes for login/linking actions.
- Treat Telegram login as an authenticated session establishment flow, not as a persistent account identifier stored only in browser local storage.
- Add account-linking rules: linking Telegram to an existing email account must require an active authenticated website session or verified email challenge.
- Add webhook idempotency for `update_id` to block duplicate processing.

### Google OAuth

Threats:

- CSRF login injection without `state`.
- Token substitution or replay without `nonce`/ID token validation.
- Open redirect after callback.
- Account takeover through email collision or unverified email claims.

Current controls:

- Google OAuth is not implemented in this repository.

Required before v1.0:

- Use Authorization Code + PKCE.
- Generate high-entropy `state` and `nonce`, bind both to a short-lived pre-auth cookie, and verify on callback.
- Validate issuer, audience, expiry, nonce, and `email_verified`.
- Allow account creation/linking only for verified emails.
- Redirect only to allowlisted relative paths.
- Never store Google access/refresh tokens unless the product needs Google API access; if stored, encrypt and rotate.

### Website Sessions

Threats:

- Horizontal account access by changing `userId`, `email`, or `telegramUserId`.
- CSRF on profile, settings, country deletion, and API key creation/revoke.
- Session theft through insecure cookies or long-lived sessions.
- XSS exposing tokens or local/session storage.

Current controls:

- No production-grade website session layer is implemented.
- `/api/me`, `/api/account`, `/api/settings`, and API key endpoints accept user identifiers from request parameters or body.

Required before v1.0:

- Use server-side session records or signed/encrypted session cookies bound to authenticated user id.
- Cookies must be `HttpOnly`, `Secure`, `SameSite=Lax` by default; use `SameSite=Strict` for sensitive admin flows where practical.
- Session cookie name should use the `__Host-` prefix in production.
- Idle timeout: 30 minutes for normal user sessions.
- Absolute timeout: 7-14 days for normal user sessions, shorter for high-risk actions.
- Admin sessions: 15 minute idle timeout and 8-12 hour absolute timeout.
- Add CSRF tokens for all cookie-authenticated state-changing requests, or require same-origin `Origin`/`Referer` plus double-submit token.
- Stop accepting caller-supplied account identifiers for authenticated user APIs; derive user id from the session.
- Add step-up verification for API token creation, account linking, billing changes, and admin actions.

### API Tokens

Threats:

- Raw token leakage through UI, logs, D1, or audit payloads.
- Token brute force or credential stuffing.
- Overbroad scopes.
- Long-lived unrecoverable keys.
- Abuse of scanner/API capacity.

Current controls:

- Raw API key is returned only once on creation.
- D1 stores `key_hash`, `key_prefix`, scopes, expiry, active flag, and last-used fields.
- Listing endpoints return prefix and metadata, not raw token.
- Revoke endpoint exists.

Gaps:

- No public API authentication path is currently enforcing API tokens.
- API token hash uses plain SHA-256. This is acceptable only if tokens have high entropy; prefer HMAC-SHA256 with a server-side pepper for defense in depth.
- Scopes are accepted from client input without an allowlist.
- Token creation/revoke currently trusts `userId` in body.
- Rotation flow is not explicit.

Required before v1.0:

- Authenticate API requests with `Authorization: Bearer <token>`.
- Store only HMAC-SHA256(token, `API_TOKEN_PEPPER`) or equivalent keyed hash, never raw tokens.
- Show only `key_prefix` after creation.
- Enforce an allowed scope set, for example `analysis:read`, `analysis:write`, `history:read`.
- Apply per-token, per-user, per-IP, and per-endpoint rate limits.
- Update `last_used_at` and write usage logs on every accepted API call.
- Add rotation as create-new-token plus revoke-old-token with audit trail.
- Add abuse detection for spikes, repeated 401s, impossible geography, and high error rates.

### Admin Dashboard

Threats:

- Admin token leakage through URL, browser history, referrer, logs, or screenshots.
- Brute-force admin bearer token.
- Overprivileged single admin role.
- No accountability for admin changes.
- Admin XSS exposing token from `sessionStorage`.

Current controls:

- Admin API requires `ADMIN_TOKEN`, and optionally `ADMIN_USERNAME`.
- Admin token is sent in the `Authorization` header from the UI.
- Admin actions write some audit events.
- Admin API has a coarse IP rate limit.

Gaps:

- Backend still accepts admin token and username from query parameters.
- Admin token is stored in browser `sessionStorage`.
- No distinct admin session, MFA, RBAC, or failed-attempt audit.
- Rate limit is not specifically tuned for failed login attempts.

Required before v1.0:

- Remove admin token/query parameter auth. Accept credentials only in headers or a secure session flow.
- Prefer admin login with short-lived secure cookie session and MFA.
- Add least-privilege roles: viewer, support, billing, operator, owner.
- Log all admin reads of sensitive records and all writes.
- Add failed admin attempt rate limit and alerting.
- Add no-store cache headers on admin HTML and admin API responses.

### Internal Service Endpoints

Threats:

- Forged access checks or analysis history writes.
- Replay of signed requests within or beyond timestamp window.
- Secret reuse across environments.
- Fail-open behavior when secret is missing.

Current controls:

- `INTERNAL_API_SECRET` is required and missing config returns 503.
- Bearer token auth is supported.
- HMAC signatures are supported with timestamp and canonical query.
- Timestamp skew over five minutes is rejected.

Gaps:

- Bearer token mode has no replay resistance.
- Signed POST body is not covered for `/api/internal/analysis-requests`; current internal HMAC signs method/path/query only.
- No key id/version header for rotation.
- No request id replay cache.

Required before v1.0:

- Prefer HMAC for all internal endpoints.
- Include method, path, canonical query, timestamp, and SHA-256 body digest in the signature base string.
- Require `X-Request-Id` and store recent ids for replay detection.
- Use per-service secrets or key ids, not one global shared secret.
- Keep fail-closed behavior when secrets are missing or invalid.

### Subscription Webhooks

Threats:

- Forged subscription activation.
- Replay of valid webhook within timestamp window.
- Duplicate events creating conflicting subscription state.
- Overtrusting unverified email to create or activate a user.

Current controls:

- HMAC-SHA256 over `<timestamp>.<raw_body>` is required.
- Timestamp skew over five minutes is rejected.
- Missing webhook secret returns 503.

Gaps:

- No provider event id idempotency table.
- No payment provider-specific schema validation yet.
- User auto-creation from webhook payload needs provider trust rules.

Required before v1.0:

- Store provider event id and reject duplicates.
- Verify provider-specific signature scheme when a provider is selected.
- Validate event type, provider account id, currency, plan id, status transitions, and customer ownership.
- Do not activate paid access from unsigned, test, or mismatched environment events.

### Scanner API

Threats:

- Untrusted services requesting paid analysis.
- Request replay causing duplicate delivery/cost.
- Payload tampering between matcher and scanner.
- Scanner receiving raw Telegram bot tokens.
- Data exfiltration through broad report/history payloads.

Current controls:

- Integration contract requires `contractVersion: "1.0"`.
- Contract uses `bot.tokenSecretName`, not raw bot token.
- Account core exposes internal access check before delivery.

Required before v1.0:

- Scanner must validate contract version, source, request id, market country, ticker bounds, and delivery options.
- Scanner API must require service-to-service auth with HMAC and timestamp/body digest.
- Scanner must enforce idempotency by `requestId`.
- Scanner must not receive raw Telegram bot tokens.
- Scanner must log request metadata without logging secrets or excessive user data.
- Matcher must call `/api/internal/access` before user-targeted delivery.

## Auth and Session Requirements

- User session identity must come from an authenticated session, not request-supplied `userId`.
- Cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `__Host-` prefix, no `Domain`.
- Session idle timeout: 30 minutes for users, 15 minutes for admins.
- Session absolute timeout: 7-14 days for users, 8-12 hours for admins.
- CSRF protection is mandatory for cookie-authenticated writes.
- OAuth must use PKCE, `state`, `nonce`, issuer/audience/expiry validation, and verified email checks.
- Telegram init data validation must be required for Telegram login/linking, with short TTL for login actions.
- Account linking must require proof of control for both identities or an already authenticated primary account.

## API Security Requirements

- Raw tokens are displayed only once during creation.
- UI and list APIs show only token prefix and metadata.
- D1 stores keyed token hashes, not raw tokens.
- Token scopes must come from a server-side allowlist.
- Token rotation and revoke must be audited.
- Usage logs must include token id, user id, endpoint, status, timestamp, and coarse IP/device signal.
- Rate limits must apply per token, user, IP, and endpoint.
- Abuse detection must alert on token guessing, high 401/403 rate, request spikes, and unusual country/IP changes.

## Secrets Requirements

- No raw secrets in source, docs, `.wrangler`, GitHub workflow logs, D1 rows, audit payloads, or console logs.
- Secrets must be configured per environment and never reused between dev/staging/prod.
- Production secret inventory must include owner, purpose, environment, last rotation date, and rotation runbook.
- Secret rotation must support dual-key overlap where webhooks or internal services need zero downtime.
- Logs must redact bearer tokens, signatures, webhook secrets, bot tokens, API tokens, and payment provider secrets.

## Production Security Checklist

### Blocking v1.0 Items

- [ ] Website auth is implemented for Google OAuth and/or Telegram login.
- [ ] `/api/me`, `/api/account`, `/api/settings`, and API key routes derive user identity from session.
- [ ] CSRF protection is enabled for cookie-authenticated writes.
- [ ] Admin query-token auth is removed.
- [ ] Admin auth uses secure sessions and MFA or a documented equivalent control.
- [ ] Internal HMAC signatures include body digest for POST endpoints.
- [ ] Subscription webhook idempotency is implemented.
- [ ] API token authentication is enforced on scanner/public API endpoints.
- [ ] API token scopes are allowlisted and enforced.
- [ ] Production CORS allowlist is configured; wildcard is not used for authenticated APIs.

### Required Verification

- [ ] Secret scan of repository and deploy artifacts is clean.
- [ ] D1 has no raw API tokens, admin tokens, webhook secrets, bot tokens, or payment secrets.
- [ ] Logs do not contain raw secrets, bearer tokens, signatures, or webhook payload secrets.
- [ ] `ALLOW_UNVERIFIED_TELEGRAM=false` in production.
- [ ] `ADMIN_TOKEN`, `INTERNAL_API_SECRET`, `SUBSCRIPTION_WEBHOOK_SECRET`, `TELEGRAM_WEBHOOK_SECRET`, and scanner secrets are set per environment.
- [ ] Rate limits are tested for registration, login, admin auth, API tokens, webhooks, and scanner calls.
- [ ] Audit logs cover login, logout, account linking, API token create/revoke, subscription changes, admin writes, and internal access decisions.
- [ ] Replay tests exist for Telegram init data, internal HMAC, subscription webhooks, and scanner request id.
- [ ] Incident response path exists for leaked API key, leaked admin token, leaked webhook secret, and compromised Telegram bot token.

## Current Repo Findings

- No raw production secrets were found by a local regex scan excluding `node_modules`, `dist`, `.wrangler`, and `.git`. Documentation references secret names and setup commands only.
- API key records store `key_hash` and `key_prefix`, not raw token.
- Subscription webhook and internal endpoint handlers fail closed when required secrets are missing.
- The main launch blocker is missing authenticated website session enforcement for user-owned account APIs.
