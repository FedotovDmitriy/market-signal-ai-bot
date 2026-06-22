# Investment Recommendation Risk Review

Status: working product compliance review, not final legal advice.
Last updated: 2026-06-18.

## Executive Summary

Current product architecture can be positioned as informational market research, but there is a material risk that users or regulators could perceive the product as investment advice if UI, Telegram messages, API outputs, or reports use directive trading language.

The risk is manageable if the product consistently avoids personalized recommendation language, avoids profit promises, keeps risk disclaimers visible, and does not tailor outputs to a user's personal financial situation.

## Higher-Risk Product Features

- Ticker analysis with `signal: bullish | bearish | neutral`.
- Confidence scores.
- Risk profile collected from the user.
- Telegram delivery of signal-style messages.
- User-requested reports.
- API outputs that could be embedded in third-party products.
- Paid subscription access to market analysis.

## Main Risk Drivers

The product starts to look like personalized investment advice if it:

- tells a specific user to buy, sell, hold, short, enter, exit, or size a position;
- uses personal user profile, capital, portfolio, goals, risk tolerance, age, country, or tax situation to make recommendations;
- claims outputs are suitable for the user;
- markets itself as a financial adviser, investment adviser, portfolio manager, or trading adviser;
- shows profit guarantees, expected guaranteed returns, win rates without substantiation, or "risk-free" language;
- lets users believe Telegram messages are real-time instructions from a licensed professional;
- allows API customers to resell outputs as recommendations.

## Safer Product Positioning

Use:

- "market analysis";
- "research tool";
- "news and ticker context";
- "informational report";
- "watchlist context";
- "risk notes";
- "scenario analysis";
- "technical/news summary";
- "not personalized";
- "verify independently".

Avoid:

- "buy signal";
- "sell signal";
- "best stock for you";
- "guaranteed return";
- "personalized recommendation";
- "safe entry";
- "sure profit";
- "we recommend";
- "you should buy";
- "portfolio advice".

## Output Language Rules

Replace directive text:

- Bad: "Buy NVDA now."
- Better: "The model flags bullish momentum conditions for NVDA. This is informational only and not a recommendation."

- Bad: "Sell if price breaks support."
- Better: "A break below support may indicate downside risk. Users should verify independently."

- Bad: "This trade is suitable for high-risk users."
- Better: "This scenario is high risk and may not be appropriate for many users."

## Required Product Controls

Must-have before launch:

- Full Risk Disclaimer.
- Terms of Service with no-advice clause.
- API Terms restricting third-party advisory use.
- First-use acceptance before ticker analysis.
- Checkout acknowledgment for recurring billing and risk.
- Telegram `/start` disclaimer.
- Report disclaimer.
- UI copy review against banned phrases.

Should-have soon:

- Central disclaimer component.
- Copy approval checklist for signal-like features.
- Log of legal text versions accepted by users.
- Human review process for new strategy labels.
- API customer approval process for public/commercial redistribution.

Nice-to-have later:

- Jurisdiction gating if certain countries create high regulatory risk.
- Enterprise compliance appendix.
- Data-provider license matrix.
- Periodic legal review of product copy and marketing.

## Escalation To Manager

Escalate before launch if any of these are true:

- Product wants to say "buy", "sell", "hold", or "recommended trade" in UI or Telegram.
- Product will collect portfolio size, investment goals, or financial situation and use it to shape outputs.
- API customers will resell analysis to their own users.
- Marketing wants to publish performance claims or win-rate claims.
- Product targets users in the US, UK, EU, Israel, or other regulated markets without local legal review.

## Conclusion

The product can be framed as informational SaaS analytics, but only if disclaimers, UX placement, output language, subscription terms, and API restrictions are implemented consistently. The biggest launch blocker is not the existence of ticker analysis itself; it is directive, personalized, or profit-promising language around that analysis.

