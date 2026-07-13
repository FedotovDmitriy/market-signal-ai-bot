# Subscription Terms And Refund Policy

Status: working product draft, not final legal advice.
Last updated: 2026-07-10.

These Subscription Terms and Refund Policy apply to paid access to Market Signal AI.

## 1. Plans

Market Signal AI may offer free, trial, monthly, annual, API, professional, or enterprise plans. Each plan may include different limits for:

- ticker analysis requests;
- API calls;
- Telegram channels or bots;
- countries and languages;
- report history;
- delivery priority;
- data refresh frequency;
- support level.

Plan details must be shown clearly before checkout.

## 2. Trials

If a trial is offered, the checkout flow must clearly show:

- trial length;
- features included;
- whether payment details are required;
- when the user will be charged;
- price after the trial;
- how to cancel before being charged.

## 3. Billing And Automatic Renewal

Paid subscriptions renew automatically unless canceled before the renewal date.

Before purchase, the user must see:

- plan name;
- price;
- billing interval;
- taxes or tax handling;
- renewal date or renewal rule;
- cancellation method;
- refund policy;
- whether usage limits apply.

The product should obtain express consent for recurring charges before starting a paid subscription or converting a trial to a paid plan.

## 4. Cancellation

Users must be able to cancel through the billing/account interface or through a support route if the billing provider requires it.

Cancellation should be at least as easy to find and complete as signup. After cancellation:

- access may continue until the end of the paid billing period unless product policy says otherwise;
- renewal charges stop after the current period;
- API keys and Telegram access may be disabled or downgraded at period end;
- historical reports may become unavailable or read-only depending on plan rules.

If the selected payment provider or Merchant of Record provides a hosted customer portal, the account interface may link to that portal for cancellation, renewal, payment method updates, invoices, and receipts.

## 5. Failed Payments

If a payment fails, Market Signal AI may retry payment, notify the user, provide a grace period, downgrade access, suspend paid features, or terminate the subscription.

The grace period and retry rules should be defined before launch.

User-facing subscription status should distinguish at least: `trialing`, `active`, `past_due` or `payment_failed`, `canceled`, `expired`, `refunded`, and `chargeback/dispute` where supported by the provider.

## 6. Plan Changes

Users may be allowed to upgrade, downgrade, or change billing interval. The checkout or billing interface must show how prorations, credits, immediate charges, or next-cycle changes work.

## 7. Price Changes

Market Signal AI may change plan prices. For existing paid subscriptions, users should receive reasonable advance notice where required by law or payment provider rules.

## 8. Refund Policy

Unless required by law or expressly stated at checkout:

- subscription fees are generally non-refundable after a billing period begins;
- unused time is generally not refunded after cancellation;
- API usage, custom reports, enterprise setup, and one-time services are generally non-refundable once delivered or consumed;
- duplicate charges, confirmed billing errors, and unauthorized charges should be reviewed case by case;
- refunds may be refused for abuse, fraud, policy violations, excessive refund requests, or chargeback misuse.

Refund requests should be submitted through the support contact with:

- account email;
- payment date;
- invoice or transaction ID if available;
- reason for request;
- relevant screenshots or error details.

## 9. Service Interruptions

Market Signal AI does not guarantee uninterrupted service. Outages, third-party data failures, Telegram delivery failures, API downtime, or temporary analysis unavailability do not automatically create a refund right unless required by law or promised in a paid SLA.

For material prolonged outages, management may provide credits or refunds case by case.

## 10. Chargebacks And Disputes

Users should contact support before filing a payment dispute so the team can investigate. If a chargeback or payment dispute is opened, Market Signal AI may suspend the account while the dispute is pending.

## 11. Taxes And Invoices

Prices may exclude taxes unless stated otherwise. Users are responsible for taxes, duties, and similar charges except where Market Signal AI or the payment provider is required to collect them.

Invoice and receipt requirements must be configured according to the payment provider and operating jurisdiction.

## 12. Website Subscription Management

The website may show subscription details from the user's authenticated account session, including plan, status, renewal date, cancellation state, channel access, API availability, private-analysis entitlement, and quota summary.

Browser code must not call internal HMAC routes and must not receive payment webhook secrets, provider secrets, raw HMAC secrets, or internal service tokens.

Checkout, manage-billing, renewal, cancellation, invoices, receipts, refunds, and payment-method updates should use approved Core/provider URLs only.

The website must not imply that a paid subscription includes investment advice, personalized recommendations, guaranteed profit, auto-trading, copy trading, broker execution, or portfolio management.

Local legal review required before launch:

- automatic renewal and cancellation requirements in the United States and target US states;
- EU/UK consumer withdrawal and digital content rules;
- Israeli consumer protection and cancellation rules if targeting Israel;
- tax/VAT/sales tax registration and invoice requirements;
- Stripe, Telegram Payments, or chosen provider flow review.
