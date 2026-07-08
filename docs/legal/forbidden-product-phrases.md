# Forbidden Product Phrase List

Status: ready for product/design/QA use.
Owner: Oleg.
Last updated: 2026-06-23.

This list is for marketing, UI, Telegram, reports, API docs, and sales copy. It reduces the risk that Market Signal AI is perceived as licensed personalized investment advice or as promising investment outcomes.

## Hard-Banned Phrases

Do not use these in public product copy, generated reports, Telegram messages, pricing pages, ads, or API examples:

- guaranteed profit
- guaranteed return
- risk-free
- no risk
- safe trade
- sure profit
- can't lose
- buy now
- sell now
- hold now
- short now
- enter this trade
- exit this trade
- best stock for you
- perfect stock for you
- personal recommendation
- personalized investment recommendation
- investment advice for you
- financial advice for you
- our AI tells you what to buy
- AI predicts the market
- guaranteed signal
- winning signal
- profit signal
- licensed advice
- fiduciary advice
- portfolio management
- we manage your investments
- copy this trade
- follow this trade
- assured outcome
- guaranteed alpha
- guaranteed win rate

## High-Risk Phrases Requiring Legal Review

Do not use these without Oleg and local counsel review:

- buy signal
- sell signal
- trading signal
- recommendation
- recommended trade
- target price
- expected return
- win rate
- backtested profit
- model portfolio
- high-conviction idea
- suitable for your risk profile
- designed for your portfolio
- personalized for your goals
- actionable investment idea
- market-beating
- professional investment advice
- advisor-grade
- institutional-grade recommendations

## Safer Alternatives

Use these instead:

- market analysis
- informational research
- ticker context
- scenario analysis
- risk notes
- news-driven context
- technical context
- model output
- confidence score
- watchlist context
- momentum conditions
- downside risk
- upside scenario
- independent verification recommended
- not investment advice
- not a buy/sell recommendation
- user is responsible for decisions

## Safer Rewrites

Bad:

> Buy NVDA now.

Safer:

> The model flags bullish momentum conditions for NVDA. This is informational only and not a recommendation.

Bad:

> This is the best stock for your risk profile.

Safer:

> This ticker matches the selected research filters. Suitability for any user is not assessed.

Bad:

> Guaranteed profitable signal.

Safer:

> Historical and current signals may be wrong and do not guarantee future results.

Bad:

> Sell if support breaks.

Safer:

> A break below support may indicate downside risk. Verify independently before acting.

## QA Acceptance Criteria

- Landing, pricing, signup, dashboard, ticker page, API docs, reports, and Telegram text contain no hard-banned phrases.
- Generated report templates do not instruct the user to buy, sell, hold, enter, exit, or short.
- Signal-like terms are paired with informational disclaimer text.
- Any performance, return, target price, or win-rate claim is blocked until management and legal approve evidence and wording.

## Escalation Rule

Escalate to manager immediately if product, sales, or marketing asks to use hard-banned language or claims that Market Signal AI can guarantee outcomes.

