# Production-Ready Legal UI Texts

Status: ready for product/design review.
Owner: Oleg.
Last updated: 2026-07-10.

These texts are short UI-ready legal/compliance strings for Yasha and Glasha. They should be used together with the full legal documents, not instead of them.

## Global Footer

Links:

- Terms
- Privacy
- Risk Disclaimer
- Subscription Terms
- API Terms

Footer note:

> Market Signal AI provides informational market analysis only. Nothing on this service is investment, financial, tax, or legal advice.

## Landing Page

Hero-area note if the page mentions ticker analysis, market signals, or AI reports:

> Informational market research only. Not investment advice. No guaranteed results.

Longer section note:

> Market Signal AI helps organize market news, ticker context, and analytical reports. You remain responsible for all trading and investment decisions.

## Pricing Page

Plan-area note:

> Plans provide access to research tools, analysis limits, Telegram delivery, and API features. They do not include personalized investment advice.

Checkout reminder:

> Your subscription renews automatically until canceled. Market analysis is informational only and does not guarantee investment outcomes.

Required checkbox:

> I understand that Market Signal AI is not investment advice and that my subscription renews automatically until canceled.

## Signup

Account creation text:

> By creating an account, you agree to the Terms, Privacy Policy, and Risk Disclaimer.

Optional risk acknowledgment:

> I understand that market analysis is informational only and that I am responsible for my own investment decisions.

## First Ticker Analysis Use

Modal title:

> Before You Analyze

Modal body:

> Market Signal AI provides informational ticker analysis only. Outputs may be inaccurate, delayed, or incomplete. This is not a recommendation to buy, sell, or hold any asset.

Required button:

> I Understand

Secondary link:

> Read Risk Disclaimer

## Dashboard

Compact notice:

> Analysis and alerts are informational only. Verify independently before acting.

Read-only channels card:

> Country and language channels are read-only broadcast feeds. Channel posts may be visible to other channel subscribers and are not private ticker requests.

Private analysis card:

> Private ticker analysis is a premium feature available only through your private bot chat, website account, or API. It is still informational only and not personalized investment advice.

Expired subscription state:

> Your paid access has ended. You can still manage your account, but paid analysis, Telegram delivery, and API access may be unavailable until you renew.

Blocked access state:

> This feature is not available on your current plan or subscription status.

## Ticker Analysis Page

Above form:

> Ticker analysis is not a buy, sell, or hold recommendation.

Private analysis note:

> Results from this request are delivered only through your private bot chat, website account, or API. Do not submit private ticker requests in country/language broadcast channels.

Final private-analysis wording:

> Private ticker analysis provides informational analytics for the ticker you request. It is not personalized investment advice, not a recommendation to buy, sell, or hold, and not a guarantee of any market outcome.

Below generated result:

> This output is informational only and may contain errors. You are solely responsible for any investment or trading decision.

High-risk result note:

> High-risk scenario. Price movement may be volatile and losses are possible.

Low-confidence result note:

> Low-confidence analysis. Treat this result as uncertain and verify with independent sources.

## Reports

Top of report:

> Informational report only. Not personalized investment advice.

Report footer:

> Market Signal AI does not guarantee accuracy, completeness, or investment results. You are responsible for your own decisions.

Export confirmation:

> Exported reports must keep the Risk Disclaimer unless Market Signal AI gives written approval.

## API Access Page

API key creation warning:

> Keep API keys secret. Anyone with your key may use your plan limits.

API usage disclaimer:

> API outputs are informational only. You may not present them as personalized investment advice or guaranteed trading signals.

Private analysis API wording:

> API ticker analysis is a private request/response flow for approved plans. It does not provide portfolio advice, order execution, auto-trading, copy trading, or personalized recommendations.

Commercial display notice:

> MVP API use allows limited display with attribution, required disclaimers, and plan limits. Resale, redistribution, white-label use, paid signal services, and third-party advisory use require a separate written agreement.

Required checkbox before first API key:

> I agree to the API Terms and will not share, resell, or misuse API outputs.

Commercial-use checkbox:

> I agree that API results may be displayed only with attribution, required disclaimers, and plan limits, and that resale or redistribution requires a separate written agreement.

Revocation confirmation:

> This API key will stop working immediately. Existing integrations using this key may fail.

## Billing Page

Active subscription:

> Your plan renews automatically on the date shown unless canceled before renewal.

Trial subscription:

> Your trial includes the features and limits shown here. If payment details are required, the paid plan starts automatically after the trial unless you cancel before the trial ends.

Past due subscription:

> Payment for your plan is past due. Paid features, API access, private analysis, and Telegram delivery may be paused until payment is updated.

Canceled subscription:

> Your subscription is canceled and will not renew. Paid access may continue until the end of the current billing period unless the checkout or provider terms state otherwise.

Expired subscription:

> Your paid access has expired. Paid channel access, private analysis, API usage, and report access may be unavailable until you renew.

Cancellation screen:

> Canceling stops future renewals. Your current paid access may remain active until the end of the billing period.

Refund support text:

> Refund requests are reviewed under the Refund Policy and applicable law.

Manage billing action:

> Billing, payment method, cancellation, renewal, invoices, and receipts may be handled through the approved Merchant of Record or customer portal.

Failed payment:

> We could not process your payment. Paid features may be paused if payment is not updated.

Subscription settings disclaimer:

> Subscription access controls product features only. Market Signal AI still provides informational analytics only and does not provide investment advice or guaranteed results.

Subscription settings links:

> Review Terms, Subscription Terms, Refund Policy, Privacy Policy, and Risk Disclaimer before starting, renewing, canceling, or changing a plan.

## Telegram Bot

Bot short description:

> AI market news and ticker analysis for informational research only. Not investment advice.

`/start` message:

> Welcome to Market Signal AI. This bot provides informational market analysis only. It is not investment advice, not a buy/sell recommendation, and does not guarantee results.

Read-only channel notice:

> Country and language channels are read-only broadcast feeds. Do not send private ticker requests there. Channel posts may be visible to other subscribers.

Private bot analysis notice:

> Private ticker requests are handled only in this private bot chat, the website account, or API. Results are informational only and not personalized investment advice.

Private bot final wording:

> Send a ticker here for private informational analysis if your plan allows it. This is not a buy/sell/hold recommendation and does not guarantee results.

Before first analysis in Telegram:

> Before continuing: ticker analysis is informational only and may be inaccurate or delayed. You are responsible for your own decisions.

Telegram message footer:

> Info only. Not investment advice. Trading involves risk.

## Admin/Internal Notes

Admin warning on user/payment changes:

> Admin actions may affect paid access, API usage, Telegram delivery, and audit logs. Confirm the user and reason before saving.

Audit log note:

> Important account, subscription, API, and admin events are logged for security and compliance.

Scanner/API-only boundary note:

> Scanner outputs must return through approved Core/API/private response flows only. Scanner must not post private analysis to broadcast channels or represent outputs as investment advice.

## Implementation Requirements

- Legal acceptance checkboxes must not be pre-checked.
- Legal links must open the current published version of each document.
- Store document version and timestamp when the user accepts Terms, Risk Disclaimer, Subscription Terms, or API Terms.
- Do not rely on footer-only disclaimers for ticker analysis, checkout, Telegram, or API outputs.
- Do not describe private delivery as personalized advice; "private" means delivery channel/privacy, not suitability for the user.
- Keep read-only channel copy separate from premium private analysis copy.
- Browser subscription settings must use user-session endpoints only; any HMAC or provider-secret wording belongs only to backend/internal docs and must never appear in client-facing copy.
- Checkout, portal, renewal, cancellation, refund, invoice, and receipt copy must not contradict the selected Merchant of Record flow.
