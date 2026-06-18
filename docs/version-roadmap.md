# Version Roadmap

This document defines the working release plan for Market Signal AI as a commercial SaaS product.

Current date: 2026-06-18.

## Release Rhythm

- Weekly management review: 1 hour.
- Workdays: Monday to Friday.
- Work hours: 09:00-18:00 Asia/Tbilisi.
- Each weekly review should cover:
  - What was completed.
  - What is blocked.
  - What enters the next version.
  - QA status.
  - DevOps status.
  - Launch deadline risk.

## Proposed Launch Deadline

Target public MVP launch: **2026-08-03**.

Reasoning:

- Gives roughly six work weeks from 2026-06-18.
- Leaves time for service integration, account dashboard, subscription/access hardening, QA regression, and production readiness.
- Keeps scope tight enough for an MVP instead of an open-ended platform build.

Milestone gates:

- 2026-06-28: v0.1 scope locked.
- 2026-07-12: integrated dev flow working.
- 2026-07-24: staging release candidate.
- 2026-07-31: production readiness review.
- 2026-08-03: MVP launch if approved.

## Versions

### v0.1 - SaaS Core And Contracts

Goal: lock the foundation so all services speak the same language.

Target date: 2026-06-28.

Scope:

- `market-signal-ai-bot`
  - Core account/subscription/access service.
  - `/api/internal/access` confirmed and tested.
  - API key tables and usage tracking documented.
  - Rate limiting active.
  - Health checks return core D1 table status.

- `telegram_company_matcher_app`
  - Reads integration contract.
  - Prepares `contractVersion: "1.0"` request shape.
  - Plans access-check call before delivery.

- `stock-signal-scanner`
  - Confirms final accepted analysis shape:
    - `risk`
    - `anchorBars`
    - `strategies`
  - Starts runtime validation plan.

Acceptance criteria:

- Contract fields are agreed across all service managers.
- `market-signal-ai-bot` tests pass.
- QA has a regression checklist for access and subscription.
- DevOps has environment checklist for dev/staging/prod.

### v0.2 - Integrated Telegram News To Ticker Analysis Flow

Goal: news service can send a matched ticker to scanner and receive a structured response.

Target date: 2026-07-12.

Scope:

- `telegram_company_matcher_app`
  - Sends valid `contractVersion: "1.0"` scanner payload.
  - Uses stable `requestId`.
  - Handles scanner failure without marking delivery as sent.
  - Stores blocked/error delivery reasons.

- `stock-signal-scanner`
  - Validates payload at runtime.
  - Returns structured response with `contractVersion`, `requestId`, `status`, `report`, and `errors`.
  - Supports idempotency by `requestId`.

- `market-signal-ai-bot`
  - Access endpoint is called by matcher in dev.
  - Subscription period expiry is enforced.

Acceptance criteria:

- One Telegram news item can become one scanner request.
- Invalid payload is rejected clearly.
- Duplicate `requestId` does not duplicate processing.
- Expired user access is blocked.

### v0.3 - Website Account MVP

Goal: user can manage subscription-related product access from the website.

Target date: 2026-07-24.

Scope:

- Website account dashboard.
- User profile.
- Country/language preferences.
- API key page.
- Basic ticker analysis request page.
- Request history.
- Billing/subscription status page.
- Admin monitoring for users, subscriptions, usage, and errors.

Acceptance criteria:

- User can see account state.
- User can see selected countries/languages.
- User can create/view API key prefix.
- User can see subscription/access status.
- Admin can inspect users and usage.

### v0.4 - Production Readiness Release Candidate

Goal: staging is stable enough for launch review.

Target date: 2026-07-31.

Scope:

- Production Cloudflare environment prepared.
- Dev/staging/prod separated.
- Production secrets configured.
- CORS allowlist configured.
- Payment webhook lifecycle selected and tested.
- QA regression complete.
- Runbooks complete.
- Production checklist complete.

Acceptance criteria:

- QA status: ready or ready with accepted risks.
- DevOps status: infrastructure ready or ready with accepted risks.
- No blocker bugs in subscription, access, payment, API keys, or data security.

### v1.0 - Public MVP Launch

Goal: paid SaaS MVP goes live.

Target date: 2026-08-03.

Scope:

- Public website and account dashboard.
- Paid subscription access.
- Telegram news delivery for initial countries/languages.
- Ticker analysis by Telegram, website, and API.
- Admin monitoring.
- Production alerts.

Launch criteria:

- Main manager approval.
- Project manager approval.
- QA approval.
- DevOps approval.
- Service manager approval for `telegram_company_matcher_app`.
- Service manager approval for `stock-signal-scanner`.

## Proposed Nearest Version Discussion

Recommended agenda for the next weekly review:

1. Confirm MVP launch target: 2026-08-03.
2. Confirm v0.1 deadline: 2026-06-28.
3. Decide final scanner analysis shape:
   - numeric risk or risk enum.
   - numeric anchorBars or interval array.
   - final strategy names.
4. Confirm payment provider direction.
5. Confirm first supported countries/languages.
6. Assign owners:
   - Yasha: core account/dashboard.
   - Glasha: SaaS dashboard UX.
   - Lena: v0.1 QA checklist.
   - Max: dev/staging/prod checklist.
   - News manager: matcher payload and access check.
   - Scanner manager: validation and response contract.

