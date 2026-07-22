# Service Status Report - market-signal-ai-bot

Date: `2026-07-17`

Service: `market-signal-ai-bot`

Repository path: `C:\Users\fnemo\Desktop\Trade\market-signal-ai-bot`

Status summary: `dev is active and progressing; production exists but is not ready for public/paid launch`

## Executive Summary

`market-signal-ai-bot` is the Core SaaS service for Market Signal AI. It is the source of truth for users, subscriptions, access decisions, API keys, quota, Telegram route ownership, analysis history, website account sessions, and admin monitoring.

The service is no longer only a Telegram bot. It has become the central SaaS control plane that connects:

- website account and billing;
- Telegram WebApp and Telegram delivery;
- subscription and quota enforcement;
- API access;
- scanner access/check and cache ownership;
- matcher broadcast delivery;
- admin/monitoring tools;
- legal, accounting, security, and production readiness documentation.

Current overall state:

- Dev environment is usable and has passed many automated checks.
- Core code contains the required scanner access/check and cache/commit logic.
- Dev Service Binding between `stock-signal-scanner-dev` and Core dev has been proven for access/check.
- Matcher broadcast to the IL/he dev Telegram channel has passed.
- Website subscription/account flow has Core endpoints, but paid Paddle lifecycle is not fully production-ready.
- Production Worker exists, but it is old and does not contain the current scanner/cache/internal subscription routes.
- Production D1 migrations `0007-0016` are pending.
- Production HMAC split secrets/scopes are not active.
- Security gate for paid/public production is currently `FAIL`.
- Recommended path is to prepare `inactive production` first, then move to active paid/public production only after all gates are closed.

## Product Purpose

Market Signal AI is a commercial SaaS product for market/news analytics:

1. Users register through website/Telegram.
2. Users choose countries and languages.
3. Users subscribe to a plan.
4. Users receive read-only Telegram news channels for selected country/language routes.
5. Premium users can request private ticker analysis through private Telegram bot, website, or API.
6. API users can request ticker analysis with scoped API keys.
7. Admins can monitor users, subscriptions, routes, usage, and events.

Important product decision:

- Country/language Telegram channels are read-only broadcast feeds.
- Private ticker analysis is separate and must never be delivered to public/broadcast channels.
- `market-signal-ai-bot` owns access, subscription, quota, billing identity, and delivery routing.
- `telegram_company_matcher_app` owns news scanning/matching and calls Core for broadcast delivery.
- `stock-signal-scanner` owns ticker analysis execution and calls Core for access/quota/cache decisions.

## Service Responsibilities

### Core Responsibilities

- User registration and profile.
- Telegram WebApp onboarding.
- Website session bootstrap from signed Telegram init data.
- CSRF token refresh for website sessions.
- Subscription intake and status.
- Paddle/MoR subscription readiness.
- Country/language preferences.
- Telegram bot/channel route configuration.
- API key creation, rotation, revocation, and usage tracking.
- User API analysis request authorization.
- Scanner access/quota/cache decision.
- Core-owned cache receipts and committed cache entries.
- Matcher delivery authorization and Telegram delivery.
- Private ticker request gating.
- Admin monitoring.
- Audit and operational events.

### Boundaries

This service must not:

- perform ticker analysis itself;
- scan Telegram news sources;
- let matcher/scanner own billing or quota;
- expose HMAC secrets or internal routes to browsers;
- treat browser-supplied `email` or `userId` as account ownership proof;
- post private ticker results to public country/language channels.

## Environments

### Dev

Worker: `market-signal-ai-bot-dev`

D1: `market-signal-ai-bot-dev-db`

URL: `https://market-signal-ai-bot-dev.fnemoy.workers.dev`

Known dev status:

- Health returns `200`.
- Scanner access/check exists and fails closed without HMAC.
- Scanner cache/commit exists and fails closed without HMAC.
- Dev D1 includes the current migrations.
- Dev Service Binding from scanner to Core has passed access/check smoke.
- IL/he matcher broadcast to a real Telegram channel has passed.

### Production

Worker: `market-signal-ai-bot`

D1: `market-signal-ai-bot-db`

URL: `https://market-signal-ai-bot.fnemoy.workers.dev`

Known production status:

- Health returns `200` on the old production bundle.
- Active production version reported earlier: `967192f3-12cc-4176-8dc5-ceb0b0d21ae7`.
- `POST /api/internal/access/check` currently returns `404`.
- `POST /api/internal/access/cache/commit` currently returns `404`.
- Production D1 migrations `0007-0016` are pending.
- Production HMAC split key IDs are reserved but not activated:
  - `scanner-prod-v1`
  - `matcher-prod-v1`
  - `website-prod-v1`
- Production is not approved for paid/public launch.

## Current Implementation Highlights

### Website Account And Sessions

Implemented:

- `POST /api/session/bootstrap`
- `GET/POST /api/session/csrf`
- `GET /api/me`
- `PUT /api/me/profile`
- `GET /api/me/subscription`
- `POST /api/me/subscription/checkout`
- `POST /api/me/subscription/portal`
- `GET/POST/DELETE /api/me/api-keys`
- `POST /api/me/api-keys/rotate`
- `GET /api/me/analysis-history`
- `POST /api/me/analysis-requests`

Important security behavior:

- Core derives website identity from `ms_session`.
- Browser-supplied `email` and `userId` are not trusted as ownership proof.
- Mutating session endpoints require CSRF.
- HMAC is not used by browser `/api/me/*` endpoints.

Open items:

- Google OAuth production bootstrap is not complete.
- User logout/session revocation and idle timeout need hardening.
- Production `__Host-` cookie and same-origin checks need security review.

### Internal HMAC Service Auth

Implemented:

- HMAC-only internal routes.
- `X-Key-Id`, `X-Request-Id`, `X-Timestamp`, and `X-Signature`.
- Canonical string includes timestamp, key id, request id, method, pathname, query, and raw body hash.
- Replay protection with nonce storage.
- Endpoint scopes through `INTERNAL_API_SCOPES_JSON`.
- Split secret binding support such as `INTERNAL_API_SECRET_MATCHER_DEV_V1`.
- Bearer fallback is rejected for internal service routes.

Open items:

- Production split secrets and scope map are not activated.
- Production uniqueness/non-reuse of secrets must be attested by DevOps/security.

### Scanner Access And Cache Ownership

Implemented:

- `POST /api/internal/access/check`
- `POST /api/internal/access/check/` trailing slash alias
- `POST /api/internal/access/cache/commit`
- Contract version `1.1`.
- Integer half-credit quota accounting.
- Core-owned cache receipts.
- Committed cache entries.
- `cacheEntryId` in access/check response.
- Exact duplicate `requestId + ticker` returns the stored decision.
- New request from same user with fresh committed cache returns `own_repeat`/`own_repeat_fundrep`.
- New request from another user with fresh committed cache returns `cached_regular`/`cached_fundrep` at cached price.
- No double charge for exact duplicates.

Open items:

- Full scanner E2E including analysis result, cache commit, duplicate, own-repeat, cached regular, no-quota, failure behavior, and private result delivery is not fully closed by QA.
- Production scanner integration is not ready until production inactive setup is approved and deployed.

### Matcher Delivery

Implemented/confirmed:

- `POST /api/internal/deliver`
- Matcher should call only Core delivery for broadcast.
- Matcher does not own private ticker request flow.
- IL/he dev broadcast route was corrected and delivery to real channel passed.

Open items:

- Production route IDs and production Telegram bot/channel setup are not finalized.
- Production matcher HMAC key ID and secret are not activated.

### Payment And Subscription

Implemented/ready in Core:

- Subscription intake routes.
- Website subscription status endpoint.
- Checkout/portal route shape.
- Website internal subscription route with HMAC scope `website:subscriptions`.

Prepared:

- Paddle approval package.
- MoR accounting readiness.
- Subscription/refund legal documents.

Open items:

- Paddle application not submitted yet.
- Paddle product/pricing/trial/support/domain/company data are still needed from main manager.
- Provider-specific webhook verification/event-id ledger is not production-ready.
- Checkout/portal lifecycle is not fully tested with real Paddle.

### Telegram

Implemented/confirmed:

- Telegram WebApp registration/onboarding.
- Telegram webhook.
- Read-only broadcast channel model.
- Private ticker request is conceptually separated from broadcast channels.
- Dev IL/he channel delivery passed.

Open items:

- Production Telegram broadcast bot/channel and private bot/channel choices are not finalized.
- Real Telegram mobile WebApp QA still needed before paid/public launch.

### Admin

Implemented:

- `/admin` UI.
- Admin overview, users, events, subscriptions, API usage, channels, bot routes.

Open security blockers:

- Admin token/admin user can still be passed through URL query in current security review.
- Admin session/roles/MFA/rate-limit hardening not complete.
- Roman marked admin security as a production blocker.

## Team And Roles

### Main Manager

Owner: project owner.

Responsibilities:

- Product and commercial decisions.
- Production go/no-go.
- Domain, pricing, launch mode, support email, entity path, and external advisor decisions.

### Project Manager / Documentation Owner

Owner: Codex in this thread.

Responsibilities:

- Break down tasks.
- Coordinate specialists and service managers.
- Maintain documentation, readiness reports, and task boards.
- Summarize status, blockers, and next steps.

### Yasha - Developer

Focus:

- Core service implementation.
- Website account/session endpoints.
- Scanner access/cache logic.
- API keys and subscription/account flows.
- Tests.

Current status:

- `PASS` for Core behavior confirmation.
- Open: safe production smoke examples and final provider/Paddle implementation status.

### Glasha - Designer

Focus:

- SaaS UX.
- Website/account/subscription/billing UX.
- Telegram WebApp UX.
- Clear separation between read-only channels and private analysis.

Current status:

- `PASS WITH RISKS`.
- Paid production `NO-GO` until Paddle checkout/portal, persisted legal acceptance, first-use ticker disclaimer, private-analysis E2E, and real Telegram mobile review.

### Lena - QA

Focus:

- Regression plans.
- Dev and production-like testing.
- Scanner/Core, matcher, website, auth, fail-closed behavior.

Current status:

- Dev Core baseline: `PASS`.
- Matcher IL/he broadcast: `PASS`.
- Production-like regression: `BLOCKED FOR PRODUCTION`.

### Max - DevOps / Cloudflare

Focus:

- Cloudflare Workers, D1, secrets, service binding, deployment, rollback.

Current status:

- Dev Service Binding scanner -> Core passed.
- Production infrastructure gate is prepared but blocked pending approval, split secrets, migrations, and deploy.

### Roman - Security / AppSec

Focus:

- HMAC, session, CSRF, admin, payment webhook, secret handling, production security gate.

Current status:

- Code-level HMAC is strong.
- Production security gate: `FAIL`.
- Blockers: production split HMAC not active, no dev/prod secret uniqueness evidence, admin hardening, payment webhook hardening, session hardening.

### Oleg - Legal / Compliance

Focus:

- Terms, privacy, risk disclaimer, subscription/refund, API terms, product language.

Current status:

- `PASS WITH LAUNCH BLOCKERS`.
- Legal copy is prepared for internal/product readiness.
- Final public/paid legal approval requires entity, Paddle flow, local securities perimeter, privacy/vendor/cookie review, and security/QA approvals.

### Marina - Business Jurisdiction / Payments Counsel

Focus:

- Business jurisdiction, payments, Paddle approval, MoR model.

Current status:

- Paddle approval package prepared.
- Actual Paddle submission is open until company/bank, pricing, trial, support email, launch countries, and URL are confirmed.

### Sergey - Accounting / MoR Setup

Focus:

- Paddle/MoR accounting, payouts, refunds, chargebacks, monthly close, CPA handoff.

Current status:

- `PASS WITH BLOCKERS`.
- Internal accounting package ready.
- External CPA/bookkeeper, Paddle approval, real Paddle exports, and local tax review remain blockers.

### Natalia - Local Legal / Tax Accounting

Focus:

- Local legal, tax, founder residency, Delaware C-Corp + Paddle MoR feasibility, external CPA/legal actions.

Current status:

- Earlier recommendation supported Delaware C-Corp + Paddle/Lemon Squeezy MoR direction with risks.
- Production paid launch still needs external/local confirmation.

### Claude - Website Developer

Focus:

- Website subscription/account/payment UI.
- Reverse-proxy/BFF integration with Core.
- Session bootstrap and CSRF.

Current status:

- Website architecture was aligned around BFF/reverse-proxy.
- Needs real Paddle checkout/portal flow and production domain/env details.

### Victor - Proposed Production Release Coordinator

Recommended role:

- Coordinate inactive production transition.
- Track readiness gates.
- Prevent premature paid/public launch.
- Consolidate reports from Max, Yasha, Roman, Lena, Oleg, Marina, Sergey, Claude, Glasha, and service managers.

### Service Managers

#### stock-signal-scanner Manager

Focus:

- Scanner production integration.
- Service Binding/custom production transport.
- HMAC key ID.
- Access/check, cache/commit, own-repeat, cached regular, fail-closed.

Current status:

- Dev access/check through Service Binding passed.
- Full analysis/cache/private-result E2E remains open.

#### telegram_company_matcher_app Manager

Focus:

- News matching and broadcast delivery through Core.
- Production route IDs and HMAC.
- Broadcast/private separation.

Current status:

- Dev IL/he broadcast flow passed.
- Production HMAC/route IDs/channels still need final setup.

## What Has Been Done

### Product And Architecture

- Confirmed `market-signal-ai-bot` as Core account/subscription/access service.
- Confirmed read-only country/language Telegram channels.
- Confirmed private ticker analysis belongs only in private bot, website, or API.
- Confirmed `telegram_company_matcher_app` does not own private ticker flow.
- Confirmed `stock-signal-scanner` does not own subscription/billing/quota source of truth.
- Created product architecture documentation.
- Created service-manager coordination regulation.

### Core Engineering

- Built/expanded SaaS skeleton pages and admin UI.
- Added user registration, settings, profile, account dashboard, API keys, analysis history.
- Added website session bootstrap and CSRF refresh.
- Added email verification path and safer email identity handling.
- Fixed account takeover through unverified email.
- Added API key authorization and keyed hashing.
- Added internal HMAC auth, scopes, replay protection, and split secrets.
- Added scanner access/check contract `1.1`.
- Added quota ledger with half-credit accounting.
- Added Core-owned cache receipts and cache commit.
- Added cache ownership logic and `cacheEntryId`.
- Added matcher delivery endpoint and Telegram route handling.
- Added safe internal diagnostic logs.

### DevOps

- Created dev/prod environment split in Cloudflare config.
- Created isolated dev D1.
- Applied dev migrations.
- Configured dev HMAC keys for scanner/matcher/website.
- Created dev Service Binding path for scanner -> Core.
- Confirmed public workers.dev Worker-to-Worker access caused Cloudflare pre-Worker `1042/404`.
- Documented release and rollback runbook.
- Prepared production infrastructure plan and backup process.

### QA

- Automated tests reached `72/72` passing in latest reports.
- TypeScript check passes in latest reports.
- Dev Core smoke passes.
- Dev scanner access/check via Service Binding passed.
- Dev matcher IL/he broadcast passed.
- Production current version smoke confirms production is old/not ready.

### Security

- HMAC canonical string and replay protection reviewed.
- Bearer fallback for internal routes rejected.
- Diagnostic logs avoid secrets/signatures/auth headers.
- Key scope checks happen before nonce consumption/business logic.
- Security gate still fails for production due to config/admin/payment/session issues.

### Legal And Compliance

- Created risk disclaimer.
- Created Terms of Service.
- Created Privacy Policy.
- Created subscription/refund policy.
- Created API Terms.
- Created legal microcopy.
- Created forbidden phrase list.
- Created API commercial use wording.
- Cleaned public product copy to avoid investment advice language.
- Prepared legal readiness review.

### Payments And Accounting

- Chose recommended direction: Delaware C-Corp + Paddle Merchant of Record.
- Prepared Paddle approval package.
- Prepared Paddle MoR accounting readiness.
- Prepared CPA/bookkeeper handoff checklist.
- Paid production remains blocked until external/provider/business data are complete.

### Production Planning

- Created production readiness checklist.
- Created main-manager production decision tasks.
- Defined inactive production vs active paid/public production.
- Recommended inactive production as next phase.

## Current Status By Area

| Area | Status | Notes |
| --- | --- | --- |
| Core dev | PASS with open E2E items | Dev Worker and D1 are current. |
| Core production | BLOCKED | Old Worker, pending migrations, no split HMAC. |
| Scanner integration | PARTIAL PASS | Dev access/check through Service Binding passed; full E2E open. |
| Matcher integration | PASS in dev for IL/he broadcast | Production route/HMAC/channel setup open. |
| Website subscription flow | PASS WITH RISKS | Core endpoints exist; real Paddle lifecycle open. |
| Payment/Paddle | PREPARED, NOT SUBMITTED | Needs business decisions and provider setup. |
| Legal | PASS WITH LAUNCH BLOCKERS | Needs final paid/public review. |
| Accounting | PASS WITH BLOCKERS | Needs external CPA/Paddle exports. |
| Security | FAIL for production | Admin/session/payment/HMAC production config blockers. |
| QA | BLOCKED FOR PRODUCTION | Dev baseline ok; full production-like flow incomplete. |
| UX | PASS WITH RISKS | Paid production NO-GO until checkout/legal/private-analysis UX gates. |

## Current Blockers

### P0 Blockers For Production Active Launch

1. Roman security gate is `FAIL`.
2. Production HMAC split secrets/scopes are not active.
3. Production D1 migrations `0007-0016` are pending.
4. Production Worker is old and returns `404` for scanner/cache internal routes.
5. Payment provider webhook lifecycle is not production-ready.
6. Paddle approval is not submitted.
7. Admin auth hardening is not complete.
8. Session hardening is not complete.
9. Full Scanner/Core/private-analysis E2E is not closed by QA.
10. Production domain/support email/plan/price/trial/company details are not fully confirmed.
11. External CPA/bookkeeper and local legal/privacy/securities review are not finalized.

### Blockers For Inactive Production

Inactive production can be prepared earlier, but still needs:

- Main manager approval for inactive production setup.
- Production HMAC key IDs confirmed.
- Production domain decision or temporary production URL decision.
- Production migration/deploy window approval.
- Production Telegram bot/channel plan.
- Max runbook execution.
- Roman review of inactive production boundaries.

## Recommended Next Steps

### Step 1 - Main Manager Decisions

Answer the immediate decision packet:

```text
1. Product name:
2. Production domain:
3. Support email:
4. Launch mode:
5. First countries/languages:
6. First paid plan and price:
7. Trial policy:
8. Entity path:
9. Paddle submission approval:
10. Approve inactive production setup:
11. Production HMAC key ids:
12. Production Telegram bot/channels:
13. CPA/bookkeeper:
14. External legal/privacy/securities reviewer:
```

### Step 2 - Prepare Inactive Production

Goal: production exists and services can connect, but no public paid launch.

Tasks:

- Production D1 backup.
- Production migrations.
- Production Worker deploy.
- Production HMAC split secrets/scopes.
- Production scanner/matcher/website smoke tests.
- Production domain or temporary production URL.
- Rollback verified.

### Step 3 - Close Security And Payment

Tasks:

- Admin auth hardening.
- Session hardening.
- Payment webhook event-id ledger.
- Paddle provider-specific verification.
- No dev/prod secret reuse attestation.
- Roman re-review.

### Step 4 - Close Full E2E QA

Tasks:

- Scanner access/check.
- Analysis result.
- Cache receipt and commit.
- Exact duplicate.
- Same-user own repeat.
- Other-user cached regular.
- No quota/no access.
- Private result delivery only to private destination.
- Matcher broadcast remains broadcast-only.
- Website subscription lifecycle.

### Step 5 - Paid/Public Go-No-Go

Only after:

- DevOps PASS.
- Security PASS or accepted risks.
- QA PASS or accepted risks.
- Legal PASS or accepted risks.
- Payment approval.
- Accounting readiness.
- Main manager approval.

## Service-Related File Inventory

This inventory lists visible project files related to the service as of this report.

### Root Files

- `.gitattributes`
- `.gitignore`
- `package-lock.json`
- `package.json`
- `PROJECT_REVIEW_HE.md`
- `README.md`
- `tsconfig.json`
- `wrangler.jsonc`

### Source Files

- `src/index.ts`
- `src/index.test.ts`
- `src/integration-contract.ts`

### Migrations

- `migrations/0001_initial.sql`
- `migrations/0002_israel_sources.sql`
- `migrations/0003_user_country_links.sql`
- `migrations/0004_real_news_chat_routes.sql`
- `migrations/0005_rate_limits.sql`
- `migrations/0006_saas_core.sql`
- `migrations/0007_sessions_and_acceptances.sql`
- `migrations/0008_scanner_access_quota.sql`
- `migrations/0009_verified_email_identity.sql`
- `migrations/0010_pending_email_identity.sql`
- `migrations/0011_api_auth_and_internal_replay.sql`
- `migrations/0012_access_contract_v11_half_credits.sql`
- `migrations/0013_core_cache_receipts.sql`
- `migrations/0014_internal_delivery_email_beta.sql`
- `migrations/0015_subscription_event_idempotency.sql`
- `migrations/0016_cache_entry_ownership_links.sql`

### Scripts

- `scripts/dev/seed-test-user.sql`

### GitHub / CI

- `.github/workflows/deploy.yml`

### Main Documentation

- `docs/accounting-mor-setup.md`
- `docs/accounting-paddle-mor-readiness.md`
- `docs/devops-cloudflare-plan.md`
- `docs/documentation-index.md`
- `docs/integration-contract.md`
- `docs/legal-compliance-plan.md`
- `docs/main-manager-production-decision-tasks.md`
- `docs/production-checklist.md`
- `docs/production-readiness-checklist-v1.0.md`
- `docs/qa-plan.md`
- `docs/saas-product-architecture.md`
- `docs/saas-ux-v0.1.md`
- `docs/security-manager-report-v1.0.md`
- `docs/security-threat-model.md`
- `docs/service-manager-coordination-regulation.md`
- `docs/service-status-report-2026-07-17.md`
- `docs/team-roles.md`
- `docs/ux-production-readiness-review.md`
- `docs/version-roadmap.md`
- `docs/version-task-process.md`

### Handoff Documents

- `docs/handoffs/stock-signal-scanner-v1.1-tasks.md`
- `docs/handoffs/telegram-company-matcher-v1.1-tasks.md`

### Runbooks

- `docs/runbooks/cloudflare-release-and-rollback.md`

### Version And Task Boards

- `docs/versions/v0.1-current-report-and-assignments.md`
- `docs/versions/v0.1-management-report.md`
- `docs/versions/v0.1-next-steps-blockers-assignments.md`
- `docs/versions/v0.1-task-board.md`

### Legal Documents

- `docs/legal/api-commercial-use-mvp-wording.md`
- `docs/legal/api-terms-of-use.md`
- `docs/legal/disclaimer-ui-points.md`
- `docs/legal/forbidden-product-phrases.md`
- `docs/legal/investment-recommendation-risk-review.md`
- `docs/legal/legal-research-notes.md`
- `docs/legal/local-legal-tax-readiness.md`
- `docs/legal/payment-subscription-flow-legal-checklist.md`
- `docs/legal/privacy-policy.md`
- `docs/legal/risk-disclaimer.md`
- `docs/legal/subscription-and-refund-policy.md`
- `docs/legal/terms-of-service.md`
- `docs/legal/ui-legal-microcopy.md`

### Legal Reports

- `docs/legal/reports/legal-readiness-review-2026-07-15.md`
- `docs/legal/reports/paddle-approval-package.md`
- `docs/legal/reports/task-01-risk-disclaimer-report.md`
- `docs/legal/reports/task-02-terms-of-service-report.md`
- `docs/legal/reports/task-03-privacy-policy-report.md`
- `docs/legal/reports/task-04-subscription-refund-report.md`
- `docs/legal/reports/task-05-api-terms-report.md`
- `docs/legal/reports/task-06-disclaimer-ui-points-report.md`
- `docs/legal/reports/task-07-investment-recommendation-risk-report.md`
- `docs/legal/reports/task-08-business-jurisdiction-payment-report.md`
- `docs/legal/reports/task-09-local-counsel-accountant-questions.md`

## Important External Service Files Outside This Repository

These files are not inside this repository but are part of the wider project context:

- `C:\Users\fnemo\Desktop\Trade\stock-signal-scanner`
- `C:\Users\fnemo\Desktop\Trade\telegram_company_matcher_app`
- `C:\Users\fnemo\Desktop\Trade\telegram_company_matcher_app\docs\matcher_roman_p0_private_flow_evidence_2026-07-10_ru.md`
- `C:\Users\fnemo\Desktop\Trade\telegram_company_matcher_app\docs\unblock_tasks_readonly_broadcast_2026-07-09_ru.md`

## Known Sensitive Files And Handling Rules

Sensitive runtime values must never be committed or pasted into chat:

- HMAC secrets.
- Telegram bot tokens.
- Admin tokens.
- Paddle/provider webhook secrets.
- API key hash secret.
- Raw user API tokens.
- Raw signatures and Authorization headers.

Known local handoff/backup areas:

- `.wrangler/handoff/`
- `.wrangler/backups/`

These should remain local-only and should not be committed.

## Final Assessment

`market-signal-ai-bot` is now a serious Core SaaS service with a broad amount of architecture, security, legal, accounting, QA, and DevOps preparation completed.

The project is not ready for active paid/public production, mainly because security, production infrastructure, payment lifecycle, admin/session hardening, and full E2E QA are not complete.

The recommended next milestone is `inactive production`:

- production deployed with current Core code;
- production D1 migrated;
- production HMAC split keys configured;
- services connected to production parameters;
- no public users and no public paid checkout;
- smoke tests and monitoring completed;
- rollback ready.

After inactive production is stable, the team should close security/payment/legal/QA gates for active paid launch.
