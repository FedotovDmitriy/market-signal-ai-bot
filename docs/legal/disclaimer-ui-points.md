# Required Disclaimer Points In UI And Delivery Channels

Status: working product draft, not final legal advice.
Last updated: 2026-06-18.

## Principle

Disclaimers must be visible before the user can reasonably rely on analysis, pay for access, receive Telegram signals, use API outputs, or download reports.

Do not hide the only disclaimer inside Terms. Use short, repeated, context-specific notices.

## Landing Page

Placement:

- near hero CTA if the page mentions AI signals, ticker analysis, market opportunities, or trading;
- near any product screenshot showing signals or performance-like outputs;
- footer link to full Risk Disclaimer and Terms.

Text:

> Market Signal AI provides informational market analysis only. It is not investment advice and does not guarantee investment results.

## Pricing

Placement:

- next to plan comparison if plans include signals, reports, Telegram delivery, or API access;
- near checkout CTA;
- in subscription consent checkbox.

Text:

> Subscription gives access to research tools and informational analysis. It does not include personalized investment advice or guaranteed trading outcomes.

Required checkbox before purchase:

> I understand that Market Signal AI is not investment advice, that markets involve risk, and that subscriptions renew automatically until canceled.

## Signup

Placement:

- before account creation submit button;
- as required consent links to Terms, Privacy Policy, and Risk Disclaimer.

Text:

> By creating an account, you agree to the Terms, Privacy Policy, and Risk Disclaimer. Market Signal AI is for informational research only.

## Dashboard

Placement:

- persistent footer or compact notice in dashboard;
- visible near first-time onboarding or first analysis entry point.

Text:

> Analysis and alerts are informational only. You are responsible for your own investment decisions.

## Ticker Analysis Page

Placement:

- above the analysis form;
- inside or below generated output;
- before first-use confirmation modal if the user has not accepted Risk Disclaimer.

Text:

> Ticker analysis is not a buy, sell, or hold recommendation. Outputs may be inaccurate, delayed, or incomplete. Verify independently before acting.

First-use confirmation:

> I understand that ticker analysis is informational only and not personalized investment advice.

## API Docs

Placement:

- top of API documentation;
- near endpoint descriptions that return signals, confidence scores, summaries, or reports;
- in API Terms acceptance flow.

Text:

> API outputs are informational market analysis only. You may not present them as personalized investment advice or guaranteed trading signals.

## Telegram Bot / Channel

Placement:

- BotFather description and about text;
- `/start` message;
- before first ticker analysis request;
- periodic pinned message in channels;
- footer in signal-style messages where practical.

Text for bot description:

> AI market news and ticker analysis for informational research only. Not investment advice.

Text for `/start`:

> Welcome to Market Signal AI. This bot provides informational market analysis only. It is not investment advice, not a buy/sell recommendation, and does not guarantee results.

Short footer:

> Info only. Not investment advice. Trading involves risk.

## Reports

Placement:

- top or first page of PDF/HTML report;
- footer or final section of report;
- metadata or export page if reports are downloadable.

Text:

> This report is for informational purposes only and is not personalized investment advice. Market Signal AI is not responsible for trading decisions made based on this report.

## Email / Notifications If Added Later

Placement:

- footer of market alerts;
- unsubscribe/preferences page.

Text:

> Market information only. Not investment advice. You are responsible for your own decisions.

## Acceptance Criteria For Lena

- Risk disclaimer link is visible from landing, pricing, signup, dashboard, ticker analysis, API docs, Telegram start message, and reports.
- Paid checkout cannot complete without subscription and risk acknowledgment checkbox.
- First ticker analysis cannot run until the user accepts the Risk Disclaimer.
- Telegram `/start` includes short disclaimer.
- Reports include report disclaimer in exported and on-screen versions.
- API docs include API disclaimer and link to API Terms.
- No UI text says or implies guaranteed profit, personal recommendation, or instruction to buy/sell.

## Requirements For Yasha

- Add persisted field for Risk Disclaimer acceptance with timestamp and version.
- Store Terms/Privacy acceptance version and timestamp at signup or checkout.
- Add checkbox state to checkout or subscription flow.
- Add disclaimer component reusable across ticker page, reports, and API docs.
- Include disclaimer text in Telegram `/start` and first-use bot flow.

## Requirements For Glasha

- Design disclaimers as visible but compact product notices.
- Make first-use disclaimer modal clear and non-alarming.
- Ensure disclaimers are visible on mobile, Telegram WebApp, and desktop.

## Escalation

Escalate to manager if product copy uses:

- "guaranteed profit";
- "safe trade";
- "best stock for you";
- "personal recommendation";
- "buy now";
- "sell now";
- "risk-free";
- "AI knows where the price will go";
- "licensed advice" unless an actual license exists and counsel approves the wording.

