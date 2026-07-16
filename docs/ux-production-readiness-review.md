# UX Production Readiness Review

Date: 2026-07-15

Owner: Glasha - UX / product design

Status: `Pass with risks; production paid launch still blocked`

Scope:

- Subscription UX.
- Checkout entry and Merchant of Record wording.
- Read-only country/language channels versus private ticker analysis.
- Required disclaimers.
- Mobile Telegram WebApp.

## Summary

The UX direction is production-aligned for a commercial SaaS MVP: website is the main product, Telegram WebApp is a quick account and delivery control surface, read-only channels are clearly separated from private premium ticker analysis, and key legal disclaimers are visible in the product surfaces.

Production paid launch remains blocked until Paddle/MoR checkout is fully connected, legal acceptance is persisted, the first-use ticker disclaimer gate is implemented, and private analysis end-to-end delivery is approved by QA/security.

## Checked Surfaces

### Subscription And Checkout

Status: `Pass with risks`

Confirmed:

- Pricing explains that subscriptions provide research tools and informational analytics, not investment advice.
- Pricing now includes pre-checkout recurring billing and risk acknowledgment copy.
- Billing page now explains renewal, cancellation, payment method, invoices, receipts, and provider portal ownership through the approved Merchant of Record.
- Browser checkout and portal APIs use user-session endpoints, not browser-exposed HMAC routes.

Remaining blockers:

- Checkout is still not a real Paddle checkout flow in the static UI.
- Required checkout/risk checkbox is present as UX copy, but not yet enforced or persisted.
- Provider success/pending/failed/canceled states still need live implementation and QA.

### Read-Only Channels Versus Private Analysis

Status: `Pass with risks`

Confirmed:

- Landing, pricing, dashboard, channels, ticker page, and UX docs separate read-only country/language channels from private ticker analysis.
- Dashboard now has separate panels for read-only news channels and private analysis quota.
- Channels page states that country channels are broadcast-only and ticker requests belong in private bot, website, or API.
- Ticker page states private results are not posted to country channels.

Remaining blockers:

- Private Telegram/scanner execution remains a broader QA/security gate outside pure UX.
- Final plan names and quota wording still need manager confirmation.

### Disclaimers

Status: `Pass with risks`

Confirmed:

- Landing/pricing/dashboard/ticker/reports/billing/API/Telegram texts avoid personalized advice and buy/sell/hold promises.
- Ticker form now includes a direct no buy/sell/hold disclaimer near the action.
- Pricing and billing now include subscription/renewal/cancellation risk copy.
- Telegram WebApp now includes a compact notice that Telegram is a quick entry, country channels are read-only, private analysis is separate, and outputs are informational only.

Remaining blockers:

- First-use ticker disclaimer modal is specified but not implemented.
- Terms/Privacy/Risk/Subscription/API acceptance version storage must be wired and tested.
- Exported/on-screen report disclaimer placement still needs final implementation verification.

### Mobile Telegram WebApp

Status: `Pass with risks`

Confirmed:

- Telegram WebApp has mobile viewport meta and a narrow `app-shell`.
- Form controls meet mobile touch-size expectations.
- Telegram WebApp copy now states that it is quick entry, not the full product.
- Country selection fieldset is explicitly labeled as read-only news countries.
- Subscription unlock copy continues to redirect to website/MoR checkout rather than hosting heavy checkout inside Telegram.

Remaining blockers:

- Need final mobile screenshot review inside Telegram after deployment/domain setup.
- Need confirm WebApp theme behavior in real Telegram clients.
- Need verify deep links/open channel/start private bot behavior with real routes.

## UX Go / No-Go

Design/product UX: `PASS WITH RISKS`

Production paid launch: `NO-GO`

Do not open paid production until:

- Paddle checkout/portal is connected and provider states are tested.
- Required subscription/risk acceptance checkbox is enforced and persisted.
- First-use ticker disclaimer gate is implemented.
- Private analysis E2E proves no broadcast-channel leakage.
- Mobile Telegram WebApp is screenshot-reviewed in Telegram.
- Legal docs are live and linked from footer, signup, checkout, billing, ticker, API, reports, and Telegram start surfaces.

## Validation

- `npm.cmd run check`: pass.
- `npm.cmd test`: pass, 72 tests.
- Local Worker HTML smoke: `/pricing`, `/billing`, `/ticker`, and `/telegram` returned `200 OK`.
- Real Telegram client screenshot review: not completed; required after production domain/WebApp setup.

## Files Reviewed / Updated

- `docs/saas-ux-v0.1.md`
- `docs/legal/disclaimer-ui-points.md`
- `docs/legal/ui-legal-microcopy.md`
- `src/index.ts`
