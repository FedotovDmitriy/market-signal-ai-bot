# API Commercial Use MVP Wording

Status: ready for MVP product/legal review.
Owner: Oleg.
Last updated: 2026-06-23.

This document defines the MVP legal wording for commercial use of Market Signal AI API results.

## MVP Rule

For MVP, API customers may display Market Signal AI API results inside their own internal tools or user-facing products only if all of the following conditions are met:

- the customer's plan allows the intended API usage volume and display context;
- Market Signal AI is clearly attributed;
- the required informational-use and no-investment-advice disclaimers are shown near the displayed output;
- API outputs are not presented as personalized investment advice, financial advice, or guaranteed trading signals;
- the customer does not sell, sublicense, redistribute, publish, package, or provide the API outputs as a standalone data product or advisory product;
- the customer does not remove, obscure, or contradict Market Signal AI disclaimers;
- the customer follows API rate limits, caching limits, and third-party data restrictions.

Resale, redistribution, sublicensing, white-label resale, bulk export, public data feeds, paid newsletters, trading communities, broker integrations, or third-party advisory use are prohibited unless Market Signal AI signs a separate written agreement with the customer.

## Terms Text

Recommended clause for API Terms:

> Commercial display of API outputs is allowed only when your plan permits it, Market Signal AI is clearly attributed, required disclaimers are shown, and the outputs are not presented as personalized investment advice or guaranteed trading signals. You may not resell, sublicense, redistribute, publish, package, or provide API outputs as a standalone data product, advisory product, paid signal service, newsletter, trading community feature, broker integration, or white-label product unless Market Signal AI has signed a separate written agreement with you.

## Required Attribution

Short attribution:

> Data and analysis by Market Signal AI.

Long attribution:

> Market analysis provided by Market Signal AI for informational purposes only.

## Required Display Disclaimer

Short disclaimer:

> Informational market analysis only. Not investment advice. No guaranteed results.

Long disclaimer:

> Market Signal AI outputs are informational only and are not personalized investment advice, financial advice, or a recommendation to buy, sell, or hold any asset. Market data and AI analysis may be inaccurate, delayed, or incomplete. Users are responsible for their own decisions.

## Prohibited MVP Uses

For MVP, these uses are prohibited without a separate written agreement:

- reselling API results;
- redistributing API results to third parties as a data feed;
- offering Market Signal AI outputs as paid trading signals;
- creating a white-label product based on API outputs;
- using API results as personalized recommendations for another user's portfolio, goals, risk tolerance, or financial situation;
- using API outputs in broker, robo-adviser, copy-trading, portfolio management, or order-routing workflows;
- removing attribution or disclaimers;
- exceeding plan limits through multiple accounts, shared keys, caching abuse, or bulk export;
- storing or redistributing third-party market data in a way that violates data-provider restrictions.

## UI/API Docs Text

API docs notice:

> MVP API use allows limited display with attribution, required disclaimers, and plan limits. Resale, redistribution, white-label use, paid signal services, and third-party advisory use require a separate written agreement.

API key creation checkbox:

> I agree that API results may be displayed only with attribution, required disclaimers, and plan limits, and that resale or redistribution requires a separate written agreement.

Developer portal warning:

> Do not use API outputs as personalized investment advice or guaranteed trading signals. Do not remove disclaimers from user-facing displays.

## Acceptance Criteria For Yasha

- API docs show the MVP commercial-use notice.
- API key creation requires acceptance of API Terms.
- API key acceptance stores API Terms version and timestamp.
- API plan UI explains whether external display is included.
- API docs include required attribution and disclaimer examples.

## Acceptance Criteria For Lena

- API docs do not imply unrestricted commercial use.
- API key creation checkbox is not pre-checked.
- Public-display examples include attribution and disclaimer text.
- API examples do not use hard-banned investment phrases.
- Any resale, redistribution, white-label, paid signal, broker, or advisory wording is blocked unless linked to a separate written agreement.

## Escalation

Escalate to manager and local counsel before approving:

- enterprise redistribution;
- white-label resale;
- broker or trading platform integrations;
- paid newsletters or trading communities using API outputs;
- customer-specific investment recommendation use cases;
- market-data caching or redistribution beyond plan limits.

