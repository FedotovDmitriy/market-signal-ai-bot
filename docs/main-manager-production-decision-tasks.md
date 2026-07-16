# Main Manager Production Decision Tasks

Date: `2026-07-15`

Owner: Main Manager

Purpose: capture the decisions and inputs required from the main manager before Market Signal AI can move from dev readiness to an inactive production environment, and later from inactive production to paid/public launch.

## Important Distinction

Production can be prepared in two stages:

1. `Production inactive`
   - Production infrastructure exists.
   - Production Worker, D1 migrations, HMAC key ids, service connections, Telegram production routes, domain, and monitoring are configured.
   - Real users are not invited yet.
   - Payments are not live or are restricted to test/approval mode.
   - This stage is useful because dependent services can connect to production parameters and validate configuration safely.

2. `Production active`
   - Real users can register/use the product.
   - Paid subscription can be purchased.
   - Telegram production channels/bots are used by customers.
   - API customers can use production tokens.
   - This stage requires security, legal, payment, QA, and manager approval.

Current recommendation: prepare `Production inactive` first, but do not open paid/public access until all launch gates are closed.

## Stage 1 - Product Identity

### Task 1. Confirm Production Product Name

Decision needed:

```text
Product name:
```

Recommended default:

```text
Market Signal AI
```

Why it matters:

- Paddle approval, legal documents, website, Telegram bots, email sender, support mailbox, domain, invoices, and API docs must all use one consistent name.
- Changing the name later can force legal, payment, domain, and UX rework.

Blocks:

- Paddle application.
- Checkout/invoice copy.
- Production website copy.
- Telegram bot/channel naming.

### Task 2. Confirm Production Domain

Decision needed:

```text
Primary domain:
App/account domain:
API domain:
Docs/legal domain:
```

Recommended MVP shape:

```text
Primary domain: market-signal.ai
App/account domain: app.market-signal.ai
API/Core domain: api.market-signal.ai
Docs/legal domain: market-signal.ai/legal
```

Why it matters:

- Cloudflare routes, cookies, CSRF, OAuth redirects, Paddle checkout return URLs, Telegram WebApp URL, and API clients all depend on stable production URLs.
- Services cannot finalize production configuration until URLs are stable.

Blocks:

- Website production deployment.
- Google OAuth redirect URLs.
- Telegram WebApp setup.
- Paddle application and checkout return URLs.
- Scanner/matcher production endpoint configuration.

### Task 3. Confirm Support Email

Decision needed:

```text
Support email:
```

Recommended default:

```text
support@market-signal.ai
```

Why it matters:

- Paddle, legal pages, refund policy, privacy requests, user support, and account issues all require a support contact.
- A missing support address can block payment approval or weaken legal readiness.

Blocks:

- Paddle application.
- Terms of Service.
- Privacy Policy.
- Refund/cancellation policy.
- Website footer and checkout support copy.

## Stage 2 - Launch Scope

### Task 4. Confirm Launch Mode

Decision needed:

```text
Launch mode: private beta / invite-only paid beta / public paid launch
```

Recommended default:

```text
Private beta first.
```

Why it matters:

- Private beta lets us connect production services and validate real production parameters without opening the product broadly.
- Public paid launch requires stronger legal, security, payment, support, and accounting readiness.

Blocks:

- QA scope.
- Legal risk level.
- Payment readiness.
- Telegram production channel strategy.

### Task 5. Confirm First Countries And Languages

Decision needed:

```text
Country/language 1:
Country/language 2:
```

Current default:

```text
Israel / Hebrew
US / Russian
```

Why it matters:

- Telegram channels, matcher route ids, Core bot routes, UX, onboarding, and support language all depend on this list.
- Adding many countries before production increases QA and operational risk.

Blocks:

- Telegram production channel setup.
- Matcher production route setup.
- User onboarding.
- QA regression matrix.

### Task 6. Confirm First Paid Plan

Decision needed:

```text
Plan name:
Monthly price:
Annual price:
Included countries:
Private ticker requests quota:
API access: yes/no
```

Recommended MVP default:

```text
Plan name: Pro
Monthly price: 79 USD
Annual price: later
Included countries: 2
Private ticker requests quota: limited MVP quota
API access: yes
```

Why it matters:

- Paddle product/price objects, website pricing, quota policies, legal subscription terms, and accounting setup depend on exact plan details.
- If price and quota are unclear, users cannot be billed fairly and QA cannot verify entitlement behavior.

Blocks:

- Paddle product setup.
- Checkout.
- Quota policy.
- Website pricing.
- Refund/cancellation wording.

### Task 7. Confirm Trial Policy

Decision needed:

```text
Trial: none / free trial / invite-only manual trial
Trial length:
Payment method required: yes/no
```

Recommended MVP default:

```text
No public free trial. Invite-only manual beta access first.
```

Why it matters:

- Trials complicate billing, cancellation, abuse prevention, legal copy, Paddle configuration, and quota handling.
- A manual beta is simpler until payments and security are fully proven.

Blocks:

- Paddle setup.
- Subscription lifecycle logic.
- Legal refund/cancellation copy.
- QA payment scenarios.

## Stage 3 - Business And Payment

### Task 8. Confirm Company/Entity Path

Decision needed:

```text
Entity path:
Entity name:
Country/state:
```

Current recommendation:

```text
Delaware C-Corp + Paddle Merchant of Record
```

Why it matters:

- Paddle KYC, tax handling, invoices, bank payouts, accounting, and legal contracts require company/entity information.
- Without entity/payment KYC details, paid production cannot launch.

Blocks:

- Paddle approval.
- Bank/payout setup.
- Accounting readiness.
- Legal final approval.

### Task 9. Confirm Payment Provider Submission

Decision needed:

```text
Submit Paddle first: yes/no
Submission owner:
```

Current recommendation:

```text
Yes, Paddle first.
```

Why it matters:

- Paddle approval may take time.
- Product positioning for financial analytics should be reviewed before submission.
- Payment approval is a long pole for paid production.

Blocks:

- Checkout.
- Billing portal.
- Subscription lifecycle.
- Paid launch.

## Stage 4 - Production Connections

### Task 10. Approve Inactive Production Setup

Decision needed:

```text
Approve inactive production setup: yes/no
Allowed actions:
Forbidden actions:
```

Recommended approval:

```text
Approve inactive production setup.
Allowed:
- production D1 backup
- production migrations
- production Worker deploy
- production HMAC key ids/secrets
- production domain routing
- service-to-service production connection smoke tests
- Telegram production bot/channel configuration

Forbidden until final go-live:
- public user launch
- real paid checkout for public users
- broad marketing traffic
- production API customer onboarding
```

Why it matters:

- Services need production parameters to connect and validate integration.
- We can make production technically ready without activating the business launch.
- This separates infrastructure readiness from public launch risk.

Blocks:

- Scanner production connection.
- Matcher production connection.
- Website production connection.
- Production smoke testing.

### Task 11. Confirm Production HMAC Key IDs

Decision needed:

```text
Scanner key id:
Matcher key id:
Website key id:
```

Recommended values:

```text
scanner-prod-v1
matcher-prod-v1
website-prod-v1
```

Why it matters:

- Each service needs a stable production key id before its secret can be generated and configured.
- Key ids can be shared in docs; secret values must never be shared in chat or Git.

Blocks:

- Scanner production E2E.
- Matcher production E2E.
- Website production subscription webhooks.
- Roman security approval.

### Task 12. Confirm Telegram Production Bot/Channels

Decision needed:

```text
Production broadcast bot:
Production private bot:
Israel/Hebrew channel:
US/Russian channel:
```

Why it matters:

- Broadcast channels are public to subscribers and must be separate from private ticker request flows.
- Private ticker analysis must be delivered only in private bot/account/API surfaces.

Blocks:

- Matcher production broadcast.
- Private ticker production flow.
- Telegram WebApp setup.
- QA Telegram production smoke.

## Stage 5 - External Reviews

### Task 13. Choose External CPA/Bookkeeper

Decision needed:

```text
CPA/bookkeeper name:
Country:
Contact:
```

Why it matters:

- Internal accounting readiness is prepared, but paid production needs external review for taxes, payouts, refunds, and bookkeeping.

Blocks:

- Accounting production approval.
- Paid launch.

### Task 14. Choose External Legal/Securities/Privacy Review

Decision needed:

```text
Reviewer:
Scope:
```

Recommended scope:

```text
Local securities perimeter, privacy/vendor/cookie review, subscription/payment legal review.
```

Why it matters:

- The product touches financial market analytics. We need independent confirmation that MVP positioning stays informational and not personalized investment advice.

Blocks:

- Final legal approval.
- Public paid launch.

## Immediate Decision Packet

The main manager can answer these first:

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

## Work That Can Continue Without Main Manager Answers

- Core production smoke examples without secrets.
- Admin auth hardening.
- Session hardening.
- Payment webhook event-id ledger design.
- Production HMAC activation runbook.
- Production migration runbook.
- QA regression matrix.
- Legal wording cleanup.
- Paddle approval draft refinement.
- Accounting handoff package.

## Work That Requires Main Manager Answers

- Paddle submission.
- Production domain routing.
- Google OAuth production redirect URLs.
- Production Telegram bot/channel final configuration.
- Production paid plan setup.
- Public or paid launch approval.
- External CPA/legal engagement.
