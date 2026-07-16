# Production Readiness Checklist v1.0

Date: `2026-07-15`

Status: `Blocked`

Scope: prepare `market-signal-ai-bot`, `stock-signal-scanner`, `telegram_company_matcher_app`, website, payments, legal, security, and operations for first controlled production launch.

Production launch is not allowed until every P0 gate below is `PASS` or explicitly accepted by the main manager with documented risk.

## Current Production Reality

- Production Worker exists: `market-signal-ai-bot`.
- Production health currently returns OK for the old production bundle.
- Production scanner endpoints are not ready yet:
  - `POST /api/internal/access/check` returns `404`.
  - `POST /api/internal/access/cache/commit` returns `404`.
- Production D1 migrations `0007-0016` are pending.
- Production HMAC key id is not confirmed.
- Production quota/cache ownership tables are not ready.

## P0 Launch Gates

- [ ] Production D1 backup completed and verified.
- [ ] Production migrations `0007-0016` applied.
- [ ] Production schema confirms `quota_decisions_v11`, `cache_receipts`, `core_cache_entries`, and `cache_entry_id`.
- [ ] Production Core Worker deployed with scanner access/check and cache/commit handlers.
- [ ] Production HMAC key ids and scopes configured for scanner, matcher, and website.
- [ ] Production endpoints fail closed without HMAC and pass with valid HMAC.
- [ ] Production Telegram bot/channel routing configured.
- [ ] Production domain selected, configured, and routed.
- [ ] Paddle approval path prepared.
- [ ] Legal pages and checkout legal copy approved.
- [ ] Accounting/MoR process approved.
- [ ] Security gate approved by Roman.
- [ ] QA regression approved by Lena.
- [ ] Rollback plan tested or explicitly verified.
- [ ] Main manager go/no-go decision recorded.

## Assignments

### Max - DevOps / Cloudflare

Owner of production infrastructure readiness.

Tasks:

- [ ] Confirm production Core Worker name, active version, route, and workers.dev availability.
- [ ] Create production D1 backup before any migration.
- [ ] Apply migrations `0007-0016` to production only after approval.
- [ ] Verify production schema:
  - `quota_balances`
  - `quota_decisions_v11`
  - `cache_receipts`
  - `core_cache_entries`
  - `cache_receipt_id`
  - `cache_entry_id`
- [ ] Configure production HMAC key ids and secrets without exposing values:
  - scanner production key id
  - matcher production key id
  - website production key id
- [ ] Configure production scopes:
  - scanner: `scanner:access`, `scanner:cache`, `scanner:history`
  - matcher: `matcher:deliver`
  - website: `website:subscriptions`
- [ ] Deploy Core production only after migration, secret, QA, and security approvals.
- [ ] Verify:
  - `/api/health` returns `200`.
  - `/api/internal/access/check` returns `401` without HMAC, not `404`.
  - `/api/internal/access/cache/commit` returns `401` without HMAC, not `404`.
  - production version id is recorded.
- [ ] Prepare rollback command and rollback criteria.

Report format:

```text
Owner: Max
Environment:
Production Worker:
Active version before:
Backup path / backup id:
Migrations applied:
Schema verified:
HMAC key ids configured:
Endpoints fail closed:
Production version after:
Rollback plan:
Secrets exposed: no
Result: PASS/FAIL
Blockers:
```

### Yasha - Core Developer

Owner of production Core behavior.

Tasks:

- [x] Confirm production code includes:
  - `POST /api/internal/access/check`
  - `POST /api/internal/access/check/`
  - `POST /api/internal/access/cache/commit`
  - cache ownership logic
  - exact duplicate idempotency
  - same-user `own_repeat`
  - other-user `cached_regular`
- [x] Confirm Core response contract includes `cacheEntryId`.
- [x] Confirm HMAC-only internal auth, no Bearer fallback.
- [x] Confirm production-safe diagnostic logs do not expose secrets, signatures, tokens, or auth headers.
- [ ] Provide safe production smoke examples without secrets.
- [x] Confirm website session endpoints are production-ready:
  - `POST /api/session/bootstrap`
  - `GET/POST /api/session/csrf`
  - `GET /api/me/subscription`
  - `POST /api/me/subscription/checkout`
  - `POST /api/me/subscription/portal`
  - `POST /api/internal/subscriptions`
- [ ] Confirm Paddle/provider placeholders or real integration status.

Report format:

```text
Owner: Yasha
Core endpoints: PASS - Core code includes `POST /api/internal/access/check`, trailing-slash alias `POST /api/internal/access/check/`, and `POST /api/internal/access/cache/commit`.
Scanner contract: PASS - automated tests confirm exact duplicate idempotency, same-user `own_repeat`, other-user `cached_regular`, FundRep/replay scenarios, no double charge, and `cacheEntryId` in Core responses.
Cache ownership: PASS - cache discount is Core-owned through committed cache entries and one-time Core-issued `cacheReceiptId`; scanner cache hints alone do not grant ownership.
Website subscription flow: PASS - session bootstrap, CSRF refresh, `/api/me/subscription`, checkout, portal, and scoped `/api/internal/subscriptions` are covered by tests.
Provider integration status: PARTIAL - Core endpoints are ready, but final Paddle/provider production configuration remains a release-management item.
Tests: PASS - `npm.cmd run check` passed and `npm.cmd test` passed with 72 tests on 2026-07-15.
Secrets exposed: no
Result: PASS for Core behavior confirmation; no production deploy or secret changes were made.
Blockers: safe production smoke examples and final provider/Paddle status still need separate release documentation.
```

### Roman - Security / AppSec

Owner of security gate.

Tasks:

- [ ] Review production HMAC configuration and key separation.
- [ ] Confirm no shared dev secrets are reused in production.
- [ ] Confirm internal routes reject Bearer fallback.
- [ ] Confirm HMAC canonical string includes method, path, query, timestamp, request id, key id, and body hash.
- [ ] Confirm replay protection and nonce storage in production.
- [ ] Review diagnostic logs for secret leakage.
- [ ] Review website session bootstrap, cookies, CSRF refresh, and account-link flow.
- [ ] Review payment webhook signature validation and idempotency.
- [ ] Review admin access and production secret handling.
- [ ] Give final verdict: `PASS`, `PASS WITH RISKS`, or `FAIL`.

Report format:

```text
Owner: Roman
HMAC security:
Session/CSRF security:
Payment webhook security:
Admin security:
Secret leakage check:
Verdict:
Required fixes:
Result: PASS/FAIL
Blockers:
```

### Lena - QA

Owner of production-like regression.

Tasks:

- [ ] Prepare production readiness regression plan.
- [ ] Verify dev E2E before production:
  - scanner access/check
  - cache receipt
  - cache commit
  - exact duplicate
  - same-user own repeat
  - other-user cached price
  - no double charge
- [ ] Verify matcher broadcast flow.
- [ ] Verify website subscription/account flow.
- [ ] Verify failed auth cases return `401/403`, not `404`.
- [ ] Verify Core unavailable behavior is fail-closed.
- [ ] Run production smoke after deployment, without creating unwanted real charges.
- [ ] Give final release verdict.

Report format:

```text
Owner: Lena
Dev E2E:
Website flow:
Payment flow:
Telegram production smoke:
Scanner production smoke:
Regression:
Verdict:
Result: PASS/FAIL
Blockers:
```

### Marina - Business Jurisdiction / Payments Counsel

Owner of Paddle approval and payment provider readiness.

Tasks:

- [ ] Prepare Paddle approval package.
- [ ] Confirm product positioning as informational SaaS analytics.
- [ ] Confirm first paid plan and pricing language.
- [ ] Confirm refund and cancellation model.
- [ ] Confirm checkout/legal requirements from Paddle.
- [ ] Confirm no direct Stripe dependency for first paid launch unless main manager changes decision.
- [ ] Confirm whether public paid launch is allowed before Delaware C-Corp setup is complete.

Report format:

```text
Owner: Marina
Payment provider:
Approval package:
Business jurisdiction:
Refund/cancellation:
Launch risks:
Result: PASS/FAIL
Blockers:
Questions for main manager:
```

### Oleg - Legal / Compliance

Owner of public legal readiness.

Tasks:

- [x] Review Terms of Service for production launch.
- [x] Review Privacy Policy for production launch.
- [x] Review Risk Disclaimer.
- [x] Review Subscription and Refund Policy.
- [x] Review API Terms of Use.
- [x] Review checkout, pricing, signup, Telegram, API, and report microcopy.
- [x] Remove or rewrite high-risk wording:
  - buy/sell/hold
  - guaranteed profit
  - personal recommendation
  - best stock for you
  - personalized investment advice
- [x] Confirm all internal API examples use HMAC-only and do not show Bearer as accepted.

Report format:

```text
Owner: Oleg
Legal pages:
Checkout copy:
Disclaimers:
Forbidden phrases:
API/internal auth wording:
Result: PASS/FAIL
Blockers:
```

Report:

```text
Owner: Oleg
Legal pages: PASS for internal product/legal readiness. Terms, Privacy, Risk Disclaimer, Subscription/Refund, API Terms, disclaimer points, UI microcopy, forbidden phrases and API commercial-use wording reviewed.
Checkout copy: PASS for baseline wording. Final Paddle/MoR checkout, customer portal, invoices/receipts, refunds, chargebacks and lifecycle copy still require provider-specific review.
Disclaimers: PASS. Required placements confirmed for pricing, checkout, signup, dashboard, subscription settings, private analysis, API access, Telegram channel/bot and reports.
Forbidden phrases: PASS. Active public copy no longer uses buy/sell/hold instructions, guaranteed profit, risk-free, best stock for you, personal recommendation or premium investment advice. Remaining matches are forbidden-phrase lists, QA criteria, historical notes or disclaimers.
API/internal auth wording: PASS. Public UI no longer shows `legacy internal Bearer secret pattern`. Internal service docs state HMAC-only. Bearer remains only for user API keys, admin auth, tests proving internal Bearer rejection, or historical notes marked obsolete/rejected.
Result: PASS WITH LAUNCH BLOCKERS.
Blockers: not final legal opinion; final paid/public launch still requires operating entity/jurisdiction, Paddle/MoR approval and exact flow review, local securities/investment-adviser perimeter review, privacy/vendor/cookie review, and Roman/Lena security/QA approval.
Files: `docs/legal/reports/legal-readiness-review-2026-07-15.md`, `src/index.ts`, `README.md`, `docs/devops-cloudflare-plan.md`, `docs/production-checklist.md`, `docs/versions/v0.1-current-report-and-assignments.md`.
```

### Sergey - Accounting / MoR Setup

Owner of accounting readiness.

Tasks:

- [x] Confirm Paddle/MoR accounting flow.
- [x] Confirm payout reconciliation process.
- [x] Confirm chart of accounts for subscriptions, refunds, chargebacks, fees, taxes, and payouts.
- [x] Confirm monthly close checklist.
- [x] Confirm what reports must be exported from Paddle.
- [x] Confirm CPA/bookkeeper handoff.

Report format:

```text
Owner: Sergey
MoR accounting:
Payout reconciliation:
Refund/chargeback handling:
Tax/sales tax notes:
CPA handoff:
Result: PASS/FAIL
Blockers:
```

Report:

```text
Owner: Sergey
MoR accounting: PASS WITH BLOCKERS - Paddle MoR accounting flow is documented in `docs/accounting-mor-setup.md` and production readiness is documented in `docs/accounting-paddle-mor-readiness.md`.
Payout reconciliation: PASS - reconcile Paddle payout/settlement/balance report to bank deposits through `Paddle Clearing`; do not book bank deposits as revenue without Paddle support.
Refund/chargeback handling: PASS - refunds and credits reduce revenue or deferred revenue; chargebacks are contra-revenue; chargeback fees are separate expenses; reversals reverse prior entries.
Tax/sales tax notes: PASS WITH CPA REVIEW REQUIRED - Paddle/MoR collected taxes are treated as MoR evidence and normally not company revenue; direct sales outside Paddle remain blocked until separate VAT/sales tax/invoice review.
Monthly close: PASS - target close by 10th business day with Paddle reports, bank reconciliation, deferred revenue roll-forward, refund/chargeback summary, tax report archive and open issues list.
CPA handoff: PASS - company, Paddle, product/revenue and accounting document package is listed.
Result: PASS WITH BLOCKERS for internal readiness package; production accounting gate remains BLOCKED until CPA/bookkeeper approval, Paddle approval, and first real Paddle export verification.
Blockers: external CPA/bookkeeper not selected/approved; Paddle exact-product approval not complete; real Paddle account exports not validated; founder/local tax residency review still required with Natalia.
```

### Natalia - Local Legal / Tax Accounting

Owner of local legal and founder tax review.

Tasks:

- [ ] Review whether the chosen setup can proceed to first paid production launch.
- [ ] Confirm founder/local tax residency risks.
- [ ] Confirm whether Delaware C-Corp + Paddle MoR is acceptable for MVP.
- [ ] Confirm local accounting requirements before first paid customer.
- [ ] List any required external lawyer/CPA actions.

Report format:

```text
Owner: Natalia
Local legal:
Tax residency:
Delaware C-Corp + Paddle:
Accounting requirements:
External actions:
Result: PASS/FAIL
Blockers:
```

### Claude - Website Developer

Owner of website subscription UX readiness.

Tasks:

- [ ] Connect website to Core through reverse-proxy/BFF.
- [ ] Use Core session bootstrap and CSRF refresh.
- [ ] Implement subscription status, checkout, and billing portal flows.
- [ ] Do not expose HMAC, provider secrets, Core internal endpoints, or raw tokens to browser.
- [ ] After payment return, re-fetch subscription state from Core.
- [ ] Show required legal disclaimers on pricing, checkout entry, account, and ticker analysis surfaces.
- [ ] Confirm website production domain and environment variables with Max.

Report format:

```text
Owner: Claude
Website domain:
Session flow:
CSRF:
Subscription status:
Checkout:
Billing portal:
Legal copy:
Secrets exposed: no
Result: PASS/FAIL
Blockers:
```

### Glasha - Designer

Owner of production UX clarity.

Tasks:

- [ ] Review production website UX for account, subscription, checkout entry, billing management, and ticker analysis.
- [ ] Confirm clear separation between read-only channels and private ticker analysis.
- [ ] Confirm legal/risk disclaimers are visible but not disruptive.
- [ ] Confirm upgrade/plan/quota states are understandable.
- [ ] Confirm mobile Telegram WebApp UX is usable.

Report format:

```text
Owner: Glasha
Website UX:
Telegram UX:
Subscription UX:
Legal UX:
Result: PASS/FAIL
Blockers:
```

### Manager - stock-signal-scanner

Owner of scanner production integration.

Tasks:

- [ ] Confirm production transport to Core:
  - service binding or approved production custom route
  - no public dev workers.dev dependency
- [ ] Confirm production HMAC key id with Core.
- [ ] Confirm `POST /api/internal/access/check`.
- [ ] Confirm `POST /api/internal/access/cache/commit`.
- [ ] Confirm scanner stores and commits Core-issued `cacheReceiptId`.
- [ ] Confirm exact duplicate, own repeat, cached regular, FundRep, refresh, and no quota behavior.
- [ ] Confirm scanner fails closed if Core is unavailable or denies access.
- [ ] Confirm scanner never receives billing ownership or raw Telegram bot tokens.

Report format:

```text
Owner: stock-signal-scanner manager
Environment:
Core transport:
HMAC key id:
Access check:
Cache commit:
Own repeat:
Cached regular:
Fail closed:
Secrets exposed: no
Result: PASS/FAIL
Blockers:
```

### Manager - telegram_company_matcher_app

Owner of matcher production integration.

Tasks:

- [ ] Confirm production HMAC key id with Core.
- [ ] Confirm matcher calls only `POST /api/internal/deliver` for broadcast delivery.
- [ ] Confirm matcher does not handle private ticker requests.
- [ ] Confirm route ids for first production country/language channels.
- [ ] Confirm no raw Telegram chat id is sent by matcher unless explicitly allowed by contract.
- [ ] Confirm duplicate delivery idempotency.
- [ ] Confirm matcher fails closed on Core denial or Core unavailability.

Report format:

```text
Owner: telegram_company_matcher_app manager
Environment:
HMAC key id:
Deliver contract:
Route ids:
Broadcast/private separation:
Idempotency:
Fail closed:
Secrets exposed: no
Result: PASS/FAIL
Blockers:
```

### Main Manager

Owner of final go/no-go.

Decisions needed:

- [ ] Confirm production domain.
- [ ] Confirm product name for paid launch.
- [ ] Confirm first paid plan and price.
- [ ] Confirm launch countries/languages.
- [ ] Confirm Paddle as first payment provider.
- [ ] Confirm whether launch is private beta or public.
- [ ] Approve production migration/deploy window.
- [ ] Approve final go/no-go after all reports.

## Final Go/No-Go

Production launch decision:

```text
Decision:
Approved by:
Date:
Conditions:
Known risks:
Rollback owner:
```

