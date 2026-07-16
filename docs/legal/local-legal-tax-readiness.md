# Local Legal And Tax Readiness

Date: 2026-07-15

Owner: Natalia - local counsel and tax accountant

Status: `Ready with conditions; first paid client blocked`

This is an internal practical readiness note for launch planning. It is not a signed legal opinion, tax memo, or replacement for advice from licensed counsel and a CPA in the relevant jurisdictions.

## Confirmed Direction

- The recommended first paid launch structure remains Delaware C-Corp + Paddle as Merchant of Record.
- Lemon Squeezy remains the backup Merchant of Record option if Paddle approval or timing blocks launch.
- Direct Stripe or direct card processing is not recommended for the first paid launch because it moves VAT/sales tax/GST, invoicing, refund, and customer tax handling burden directly onto the company.
- The MVP must stay positioned as informational SaaS analytics. It must not include personalized investment advice, portfolio-specific recommendations, auto-trading, copy trading, broker/order routing, or managed-account workflows without separate legal review.

## Delaware C-Corp Setup Checklist

Required before first paid customer:

- Form Delaware C-Corp.
- Appoint Delaware registered agent.
- Obtain EIN.
- Open business bank account in the company name.
- Approve bylaws, initial board consent, officer appointments, founder stock issuance, cap table, and IP assignment.
- Create corporate records folder for formation documents, board approvals, equity records, contracts, tax documents, and bank/KYC records.
- Calendar Delaware annual report and franchise tax obligations.
- Calendar federal corporate tax return obligations.
- Confirm beneficial ownership and any applicable company reporting obligations with counsel/CPA.

## Paddle Merchant Of Record Readiness

Required before first paid customer:

- Paddle account approved for the exact product: paid informational market/news/ticker analytics SaaS.
- Product, pricing, checkout, cancellation, refund, and renewal wording match the live legal documents.
- Paddle portal or self-service flow is available for cancellation and subscription management.
- Paddle reports are available for payouts, transactions, fees, refunds, disputes/chargebacks, taxes, subscriptions, products, and prices.
- Payment webhooks are configured, signature-verified, idempotent, and tested before relying on paid subscription state.
- No paid sales are accepted outside the selected Merchant of Record until a separate tax/invoicing review is completed.

## CPA / Bookkeeper Setup Checklist

Required before first paid customer:

- Select CPA/bookkeeper who understands Delaware C-Corp SaaS and Merchant of Record accounting.
- Approve chart of accounts for bank, Paddle clearing, gross sales reporting, net payouts, fees, refunds, chargebacks, taxes collected/remitted by MoR, deferred revenue, SaaS/API revenue, FX, and bank fees.
- Approve monthly close workflow using Paddle exports and bank statements.
- Define revenue recognition for monthly and annual subscriptions, including deferred revenue for annual plans.
- Define refund, chargeback, dispute, coupon, trial, failed-payment, and cancellation accounting treatment.
- Store monthly Paddle reports, bank statements, reconciliation workbooks, legal policy versions, and pricing versions in a controlled folder.

## Founder / Local Tax Residency Review Checklist

Required before first paid customer:

- Identify all founders, directors, officers, and core operators who make management, product, finance, or sales decisions.
- Confirm each person's tax residency, physical location, address, days of presence, role, compensation, contract status, and signing authority.
- Confirm where board decisions, banking decisions, pricing decisions, product decisions, and customer-contract decisions are actually made.
- Review whether any country creates local tax residency, permanent establishment, payroll, branch, contractor, employer-of-record, or local registration risk.
- Minimum countries to review are the countries where founders/directors/core operators live or materially manage the business, including Georgia, Israel, US, UK/EU, or any other actual management location if applicable.
- Document whether local filings, payroll setup, contractor agreements, or board-process changes are required before paid launch.

## First Paid Customer Requirements

The first paid customer is blocked until all of the following are completed:

- Delaware C-Corp is formed, EIN is received, bank account is ready, and corporate records are organized.
- Paddle approval is received for the exact product and checkout flow.
- CPA/bookkeeper is selected and MoR accounting workflow is approved.
- Founder/local tax residency review is completed and action items are resolved or explicitly accepted by management.
- Securities/investment-adviser perimeter review confirms the live MVP remains informational and non-personalized.
- Legal documents are live and aligned with product UX: Terms of Service, Privacy Policy, Risk Disclaimer, Subscription and Refund Policy, API Terms, and payment checkout wording.
- Subscription lifecycle, cancellation, refunds, webhooks, admin monitoring, and access-control behavior pass QA/security checks.

## Go / No-Go

Planning readiness: `Pass with risks`

First paid customer readiness: `No-go until blockers are cleared`

The project can continue implementation and Paddle onboarding using Delaware C-Corp + Paddle MoR as the working structure. It should not accept the first paid customer until the required entity, MoR, accounting, founder/local tax, securities perimeter, legal-document, and payment-lifecycle gates are closed.

## References

- `docs/accounting-mor-setup.md`
- `docs/legal/reports/task-08-business-jurisdiction-payment-report.md`
- `docs/legal/reports/task-09-local-counsel-accountant-questions.md`
- `docs/legal/payment-subscription-flow-legal-checklist.md`
- Delaware Division of Corporations: https://corp.delaware.gov/frtax/
- IRS Form 1120: https://www.irs.gov/forms-pubs/about-form-1120
- Paddle webhooks: https://developer.paddle.com/webhooks/
