# Production-Ready Legal UI Texts

Status: ready for product/design review.
Owner: Oleg.
Last updated: 2026-06-23.

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

Expired subscription state:

> Your paid access has ended. You can still manage your account, but paid analysis, Telegram delivery, and API access may be unavailable until you renew.

Blocked access state:

> This feature is not available on your current plan or subscription status.

## Ticker Analysis Page

Above form:

> Ticker analysis is not a buy, sell, or hold recommendation.

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

Cancellation screen:

> Canceling stops future renewals. Your current paid access may remain active until the end of the billing period.

Refund support text:

> Refund requests are reviewed under the Refund Policy and applicable law.

Failed payment:

> We could not process your payment. Paid features may be paused if payment is not updated.

## Telegram Bot

Bot short description:

> AI market news and ticker analysis for informational research only. Not investment advice.

`/start` message:

> Welcome to Market Signal AI. This bot provides informational market analysis only. It is not investment advice, not a buy/sell recommendation, and does not guarantee results.

Before first analysis in Telegram:

> Before continuing: ticker analysis is informational only and may be inaccurate or delayed. You are responsible for your own decisions.

Telegram message footer:

> Info only. Not investment advice. Trading involves risk.

## Admin/Internal Notes

Admin warning on user/payment changes:

> Admin actions may affect paid access, API usage, Telegram delivery, and audit logs. Confirm the user and reason before saving.

Audit log note:

> Important account, subscription, API, and admin events are logged for security and compliance.

## Implementation Requirements

- Legal acceptance checkboxes must not be pre-checked.
- Legal links must open the current published version of each document.
- Store document version and timestamp when the user accepts Terms, Risk Disclaimer, Subscription Terms, or API Terms.
- Do not rely on footer-only disclaimers for ticker analysis, checkout, Telegram, or API outputs.
