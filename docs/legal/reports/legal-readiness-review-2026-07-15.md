# Legal Readiness Review

Date: 2026-07-15
Owner: Oleg, Legal / Compliance
Status: `PASS for documentation and product-copy cleanup; paid/public launch still blocked by external legal/provider/security gates`

This is a product legal/compliance readiness review, not a final legal opinion.

## Scope Checked

- Terms of Service.
- Privacy Policy.
- Risk Disclaimer.
- Subscription Terms and Refund Policy.
- API Terms of Use.
- Checkout, pricing, signup, billing, dashboard, private analysis, API, Telegram, and reports microcopy.
- Forbidden investment wording.
- Old internal Bearer examples.

## Result

Legal documents and current product copy are ready for internal product review and Paddle/MoR preparation.

Public/paid launch is not legally ready until the remaining blockers are closed:

- final operating entity and jurisdiction confirmed;
- Paddle/MoR checkout, customer portal, cancellation, refund, invoice/receipt, webhook, and lifecycle flow confirmed;
- local securities/investment-adviser perimeter review completed for target markets;
- final privacy/cookie/vendor review completed;
- Roman and Lena approve security/QA production gates;
- final public website copy is reviewed after design/frontend implementation.

## Documents Reviewed

Reviewed and kept in the documentation index:

- `docs/legal/terms-of-service.md`
- `docs/legal/privacy-policy.md`
- `docs/legal/risk-disclaimer.md`
- `docs/legal/subscription-and-refund-policy.md`
- `docs/legal/api-terms-of-use.md`
- `docs/legal/disclaimer-ui-points.md`
- `docs/legal/ui-legal-microcopy.md`
- `docs/legal/forbidden-product-phrases.md`
- `docs/legal/api-commercial-use-mvp-wording.md`
- `docs/legal/payment-subscription-flow-legal-checklist.md`

## Copy Changes Made

Updated `src/index.ts`:

- replaced public-facing "signal team / signal board" style language with "market research / informational analytics";
- replaced "Signal summary" and "Bullish 85" with a safer informational summary;
- added no-advice / no-guarantee reminders to pricing, signup/auth, dashboard, reports, and billing;
- removed the public UI example `legacy internal Bearer secret pattern`;
- replaced it with a user API key example for `/api/analysis/requests` and a note that internal routes use backend HMAC signing only.

Updated `README.md`:

- clarified that authenticated user-session flows request checkout URLs through `/api/me/subscription/checkout`;
- clarified that browser code must not call internal HMAC subscription routes;
- clarified that internal service routes do not accept Bearer authentication.

Updated operational docs:

- `docs/devops-cloudflare-plan.md`
- `docs/production-checklist.md`
- `docs/versions/v0.1-current-report-and-assignments.md`

## Internal API Auth Wording

Current acceptable wording:

- internal service routes use HMAC-only;
- required headers include `X-Key-Id`, unique `X-Request-Id`, `X-Timestamp`, and `X-Signature`;
- `INTERNAL_API_SCOPES_JSON` controls endpoint-level permissions;
- browser code must not receive HMAC secrets;
- Bearer is acceptable only for user API keys such as `Authorization: Bearer msk_live_<user_api_key>`, not for internal service secrets.

Remaining Bearer references are acceptable when they are:

- user API key examples;
- admin auth examples for the admin endpoint;
- tests proving internal Bearer bypass is rejected;
- historical notes explicitly marked obsolete or rejected.

## Investment Wording Review

No active public product copy should say or imply:

- buy/sell/hold instruction;
- guaranteed profit;
- risk-free result;
- best stock for you;
- personalized recommendation;
- premium investment advice;
- auto-trading;
- copy trading;
- broker execution;
- portfolio management.

Remaining matches are in forbidden phrase lists, QA criteria, historical reports, or disclaimers that explicitly prohibit the language.

## Required Disclaimer Placements

Must remain visible in:

- pricing;
- checkout;
- signup/account creation;
- dashboard;
- subscription settings/billing;
- ticker analysis page;
- private Telegram bot first-use flow;
- read-only Telegram channel notices;
- API docs / API key creation;
- report screen and exports.

Minimum product disclaimer:

> Market Signal AI provides informational market analysis only. It is not investment advice, not a recommendation to buy or sell, and does not guarantee results. You are responsible for your own decisions.

## Legal Readiness Decision

Documentation/copy readiness: `PASS WITH LAUNCH BLOCKERS`

Paid/public launch readiness: `NOT READY`

Reason:

- legal documents exist and product copy has been cleaned;
- internal Bearer examples have been removed or marked obsolete where they could mislead implementers;
- but final launch still depends on Paddle/MoR flow, jurisdiction/legal entity, local legal review, privacy/vendor details, and security/QA approvals.

## References

- SEC Investor.gov bulletin on investment professionals and investment services: https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/investor-0
- FTC business guidance on negative option / subscription cancellation disclosures: https://www.ftc.gov/business-guidance/blog/2024/10/click-cancel-ftcs-amended-negative-option-rule-what-it-means-your-business
- Paddle customer portal documentation: https://developer.paddle.com/build/customers/integrate-customer-portal/
- Telegram Privacy Policy: https://telegram.org/privacy


