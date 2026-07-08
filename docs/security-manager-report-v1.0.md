# Market Signal AI Security Report for Management

Date: 2026-06-23  
Owner: Roman, Cybersecurity / Application Security Engineer  
Scope: Telegram login, Google OAuth, website sessions, API tokens, admin dashboard, internal endpoints, subscription webhooks, scanner API, secrets, and production readiness.

## Executive Summary

Security status before v1.0: **Blocked**

Market Signal AI already has several important security controls in place: Telegram WebApp init data validation, signed subscription webhooks, internal endpoint authentication, API key hashing, basic rate limits, audit events, and production secret configuration guidance.

However, the current SaaS account APIs are not ready for commercial production because website user identity is still taken from request parameters such as `userId`, `email`, or `telegramUserId`. This means a user could potentially access or modify another user's account data if they know or guess identifiers. A real authenticated session layer must be implemented before v1.0.

Google OAuth is also not implemented yet in this repository, so Google login cannot be marked security-ready.

## Key Blocking Risks

1. **No production-grade website sessions**

   Current account endpoints such as `/api/me`, `/api/account`, `/api/settings`, and API key management routes trust caller-supplied identifiers. For v1.0, user identity must come from an authenticated server-side session or secure signed session cookie.

2. **Google OAuth is not implemented**

   Before enabling Google login, the implementation must include PKCE, `state`, `nonce`, ID token validation, verified email checks, and redirect allowlisting.

3. **CSRF protection is missing for future cookie-based sessions**

   Once website sessions use cookies, all state-changing requests must be protected against CSRF.

4. **Admin authentication needs hardening**

   Admin APIs currently use an admin bearer token. The backend also accepts token values from URL query parameters, which should be removed before production. Admin access should use secure sessions, short expiration, failed-attempt rate limits, audit logs, and preferably MFA.

5. **Internal POST signatures need body protection**

   Internal endpoints support HMAC and timestamp replay protection, but POST request signatures should also include a request body digest.

6. **Subscription webhooks need idempotency**

   Webhook signatures are checked, but production should store provider event IDs and reject duplicate events.

7. **API token enforcement is incomplete**

   API keys are stored safely as hashes and only shown once, but scanner/public API authentication, scope enforcement, per-token limits, and usage-based abuse detection must be completed.

## Current Positive Controls

- Telegram WebApp init data is validated using Telegram-compatible HMAC.
- Old Telegram init data is rejected.
- Production config is expected to keep `ALLOW_UNVERIFIED_TELEGRAM=false`.
- Telegram webhook secret token is supported.
- Subscription webhooks require HMAC signatures and timestamp validation.
- Internal endpoints require `INTERNAL_API_SECRET` and fail closed when missing.
- Internal HMAC signatures include timestamp, method, path, and query.
- API keys are stored as hash plus prefix; raw tokens are returned only once.
- API key revoke flow exists.
- Basic rate limits exist for registration, settings, account APIs, subscriptions, and admin APIs.
- Audit events exist for important actions.
- Local secret scan did not find raw production secrets in the repository.

## Required Security Work Before v1.0

### Authentication and Sessions

- Implement real website login/session handling.
- Use secure cookies: `HttpOnly`, `Secure`, `SameSite=Lax` or stricter, `Path=/`, and production `__Host-` cookie prefix.
- Enforce idle and absolute session expiration.
- Derive user identity from the authenticated session, not from request parameters.
- Add CSRF protection for all cookie-authenticated write requests.

### Google OAuth

- Implement Authorization Code with PKCE.
- Validate `state` and `nonce`.
- Validate issuer, audience, expiry, and verified email.
- Allow redirects only to approved relative paths.
- Define safe account-linking rules.

### Telegram Login and Account Linking

- Require signed Telegram init data for Telegram login and linking.
- Keep `ALLOW_UNVERIFIED_TELEGRAM=false` in production.
- Shorten Telegram init data TTL for login/linking actions.
- Require proof of control before linking Telegram and email identities.
- Add Telegram webhook idempotency for duplicate updates.

### API Tokens

- Store token hashes using a keyed hash or server-side pepper.
- Show only token prefix after creation.
- Enforce allowed scopes.
- Add token rotation and revoke audit trails.
- Enforce per-token, per-user, per-IP, and per-endpoint rate limits.
- Add abuse detection for token guessing, request spikes, repeated failures, and unusual access patterns.

### Admin Security

- Remove admin token from URL query authentication.
- Use secure admin sessions with short expiration.
- Add MFA or document an approved temporary compensating control.
- Add failed-attempt rate limits and alerting.
- Add least-privilege roles.
- Audit all admin writes and sensitive reads.

### Internal Services and Scanner API

- Prefer HMAC auth over bearer token auth for internal calls.
- Include timestamp, method, path, query, and body digest in signatures.
- Require request IDs and replay detection.
- Use per-service secrets or key IDs for rotation.
- Scanner must validate `contractVersion: "1.0"`, enforce idempotency by `requestId`, and never receive raw Telegram bot tokens.

### Subscription Webhooks

- Keep HMAC signature validation.
- Add provider event ID idempotency.
- Validate provider account, event type, plan, environment, and status transitions.
- Do not activate paid access from unsigned, duplicate, test, or mismatched-environment events.

### Secrets

- Keep raw secrets out of source, D1, logs, docs, and GitHub Actions logs.
- Use separate secrets for dev, staging, and production.
- Maintain a rotation runbook for all production secrets.
- Redact bearer tokens, signatures, bot tokens, API tokens, and payment secrets from logs.

## Production Security Checklist Status

Current status: **Blocked**

Production can move to **Ready with security risks** only if management explicitly accepts temporary risks and compensating controls are documented. For a commercial SaaS with paid subscriptions and API access, the recommended target is **Security ready**, which requires closing the blocking items above.

## Recommendation

Do not launch v1.0 publicly until the website authentication/session layer, CSRF protection, admin hardening, webhook idempotency, internal body signatures, and API token enforcement are implemented and tested.

The most urgent engineering priority is to replace request-supplied user identity with authenticated session-derived identity across all account and API key routes.
