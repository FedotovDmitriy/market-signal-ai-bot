# Payment And Subscription Flow Legal Checklist

Status: pre-provider checklist; final review pending Paddle or Lemon Squeezy selection.
Owner: Oleg.
Last updated: 2026-06-24.

This checklist defines what Legal/Compliance must review before the first paid launch of Market Signal AI.

## Current Position

Recommended commercial direction from the business/payment review is:

- Delaware C-Corp as preferred operating structure, subject to founder/local tax review.
- Paddle or Lemon Squeezy as Merchant of Record for the first paid launch.
- Direct Stripe is not recommended for the first paid launch.
- Product remains informational SaaS analytics, not personalized investment advice.

## Legal Status

Payment/subscription flow review is not complete until management selects the provider and shares the actual checkout, subscription, cancellation, refund, invoice/receipt, and webhook flow.

Until then, Legal can approve only the baseline product requirements:

- no hidden recurring billing;
- no pre-checked legal consent boxes;
- clear trial-to-paid conversion wording;
- clear renewal wording;
- clear cancellation route;
- clear refund policy;
- no conflict between Market Signal AI legal copy and the Merchant of Record checkout;
- no investment advice or profit promises in pricing or checkout copy.

## Must-Have Before Paid Launch

### Provider Decision

- Select Paddle or Lemon Squeezy for the first paid launch.
- Confirm whether the selected provider acts as Merchant of Record for the actual checkout flow used.
- Confirm provider country availability for the selected business entity.
- Confirm product category is acceptable to the provider as informational market analytics.

### Checkout Wording

Checkout must clearly show:

- plan name;
- price;
- billing interval;
- renewal rule;
- taxes/VAT/sales tax handling;
- trial length if any;
- whether payment details are required for trial;
- charge date after trial;
- cancellation method;
- refund policy link;
- Terms, Privacy Policy, Risk Disclaimer, Subscription Terms links.

Required checkbox:

> I understand that Market Signal AI provides informational market analysis only, is not investment advice, and that my subscription renews automatically until canceled.

### Trial Wording

If trial exists, UI must state:

- trial duration;
- included features and limits;
- price after trial;
- exact first charge date or charge rule;
- how to cancel before charge;
- whether API/Telegram/report access ends immediately or at trial end.

### Renewal Wording

Required wording:

> Your subscription renews automatically at the billing interval shown unless canceled before renewal.

### Cancellation Wording

Required wording:

> Canceling stops future renewals. Your current paid access may remain active until the end of the billing period unless the checkout or plan terms state otherwise.

### Refund Wording

Required wording:

> Refund requests are reviewed under the Refund Policy, the selected Merchant of Record's checkout rules, and applicable law.

Legal must confirm the Refund Policy does not contradict the provider's refund process.

### Billing Notices

Billing/account UI must show:

- current plan;
- renewal date;
- subscription status;
- failed payment status;
- cancellation status;
- support route for billing questions;
- links to Terms, Subscription Terms, Refund Policy, and Risk Disclaimer.

### Webhooks And Subscription Status

Legal/compliance must confirm the product maps provider events into user-facing statuses consistently:

- active;
- trialing;
- past_due or payment_failed;
- canceled;
- expired;
- refunded;
- chargeback/dispute;
- paused if provider supports it.

Access must not continue indefinitely after expiration, refund, chargeback, or canceled-with-ended-period status.

## Merchant Of Record Consistency Checks

Market Signal AI legal copy must not contradict the MoR checkout on:

- who sells to the customer;
- who collects taxes;
- who issues invoices or receipts;
- refund request route;
- cancellation route;
- customer support split;
- charge descriptor;
- payment dispute handling;
- VAT/sales tax display.

If MoR checkout says the provider is seller of record, Market Signal AI terms should not claim that Market Signal AI directly processes the customer payment.

## Legal Blockers Before Paid Launch

Paid launch is blocked until:

- provider is selected;
- provider onboarding/KYC/product approval is complete or conditionally approved;
- business entity and jurisdiction are confirmed;
- founder/local tax residency review is assigned;
- Terms, Subscription Terms, Refund Policy, checkout wording, and billing notices are aligned with selected provider;
- cancellation flow is implemented and visible;
- refund flow is documented;
- legal acceptance records store version and timestamp;
- Risk Disclaimer appears in pricing/checkout and first analysis flow;
- no UI copy promises profit or personal investment advice;
- securities/investment-adviser perimeter review is assigned for target markets;
- CPA/bookkeeper setup for MoR payouts, refunds, chargebacks, and deferred revenue is assigned.

## Should-Have Soon

- Provider-specific webhook event mapping document.
- Provider-specific refund and chargeback runbook.
- Customer billing support script.
- Tax/accounting export checklist.
- Country-specific consumer cancellation review for the first target markets.

## Needs From Manager

- Select Paddle or Lemon Squeezy for first provider review.
- Confirm business entity direction.
- Confirm whether there will be a free trial.
- Confirm whether trial requires payment details.
- Confirm monthly/annual/API/custom report refund posture.
- Confirm who owns billing support.
- Confirm whether any B2B/API customer needs a custom agreement before MVP.

