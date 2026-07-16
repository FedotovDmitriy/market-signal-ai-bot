# SaaS Merchant of Record Accounting Setup

Date: 2026-06-26
Owner: Sergey, SaaS and Merchant of Record accounting
Status: ready with CPA confirmation required

## Purpose

This document defines the MVP accounting setup for Market Signal AI subscriptions sold through Paddle as Merchant of Record.

It is a working accounting checklist, not a signed CPA tax memo. A licensed CPA/bookkeeper must approve the final chart of accounts, revenue recognition policy, tax treatment and closing process before the first paid subscription.

Operational readiness details for production gate are tracked in `docs/accounting-paddle-mor-readiness.md`.

## Assumptions

- First paid launch uses Paddle as Merchant of Record.
- Lemon Squeezy remains the backup MoR provider.
- Direct Stripe is not used for MVP paid launch.
- Product is informational SaaS analytics, Telegram alerts and API access.
- Company direction is Delaware C-Corp.
- Accounting basis for launch planning is accrual accounting, with management reporting for gross customer sales and net cash payouts.

## CPA And Bookkeeper Setup Checklist

Complete before first paid subscription:

- Engage a US CPA or qualified bookkeeper who can support Delaware C-Corp SaaS accounting.
- Confirm accounting basis: accrual for books and tax-basis adjustments as CPA requires.
- Confirm fiscal year, reporting currency, accounting system and bank feed.
- Confirm whether the accounting system will track customers/subscriptions directly or only by summarized monthly Paddle exports.
- Approve chart of accounts for MoR sales, fees, refunds, chargebacks, taxes, deferred revenue and bank clearing.
- Approve revenue recognition policy for monthly, annual, trials, discounts, refunds and credits.
- Confirm whether annual prepaid plans create deferred revenue and monthly revenue release.
- Confirm how MoR tax collected/remitted by Paddle is recorded: memo/reporting only unless CPA requires separate liability tracking.
- Confirm bank reconciliation process for Paddle payout deposits.
- Confirm monthly close owner, review owner and close deadline.
- Confirm document retention folder and naming convention.
- Confirm annual compliance calendar: Delaware franchise tax, federal Form 1120, registered agent, state/local filings if any, and CPA tax workpapers.

## Chart Of Accounts

Recommended MVP accounts:

| Account | Type | Use |
| --- | --- | --- |
| Cash - Operating Bank | Asset | Bank deposits and operating cash. |
| Paddle Clearing | Asset / clearing | Temporary account for expected payouts and payout reconciliation. |
| Accounts Receivable - MoR | Asset | Optional accrual account for earned vendor/platform revenue not yet paid by Paddle. |
| Deferred Revenue - Subscriptions | Liability | Annual or prepaid subscription service not yet earned. |
| SaaS Subscription Revenue | Revenue | Earned subscription revenue from Paddle/MoR relationship. |
| API Subscription Revenue | Revenue | Earned API subscription revenue if separated from dashboard subscriptions. |
| Gross Customer Sales - Management | Memo / reporting | Gross customer-facing sales from Paddle reports; use for analytics, not necessarily GAAP revenue. |
| Refunds And Credits | Contra-revenue | Refunds and credits tied to customer subscriptions. |
| Chargebacks | Contra-revenue | Customer chargebacks that reverse recognized sales. |
| Paddle Fees | Expense | MoR/platform/payment fees, unless CPA requires net presentation. |
| Chargeback Fees | Expense | Chargeback dispute fees and related processing fees. |
| Taxes Collected By MoR | Memo / liability if required | VAT, sales tax, GST or other indirect tax collected/remitted by Paddle. Usually not company revenue if Paddle is seller of record. |
| Foreign Exchange Gain/Loss | Other income/expense | Currency differences between Paddle reports and bank deposits. |
| Bank Fees | Expense | Bank and wire fees not already included in Paddle fees. |

CPA decision needed:

- Whether books present MoR activity on a gross basis with separate fees/refunds, or net revenue from Paddle with supplemental gross-sales reporting.
- Whether Paddle tax amounts are excluded entirely from company revenue or tracked in memo accounts.
- Whether API plans require separate revenue class, deferred revenue schedule or contract review.

## Revenue Recognition Rules

Monthly plans:

- Recognize revenue over the monthly service period.
- If the subscription period starts and ends inside one month, monthly close may recognize the earned amount in that month.
- Refunds reduce revenue or are recorded as contra-revenue.

Annual plans:

- Record cash or receivable from Paddle when earned/collectible under the MoR reports.
- Record unearned portion as deferred revenue.
- Release revenue monthly over the service period.
- Refund unused periods by reducing deferred revenue first, then revenue/contra-revenue as CPA approves.

Trials and discounts:

- Do not recognize revenue during a free trial with no charge.
- Recognize discounted price over the service period.
- Keep promo/discount reporting from Paddle for revenue analysis.

Chargebacks:

- Reverse revenue or record contra-revenue for the disputed amount.
- Record chargeback fees separately as expense.
- Reverse the chargeback entry if the dispute is won and Paddle reports recovery.

## Monthly Close Process

Target close timing: complete by the 10th business day after month end.

1. Export reports from Paddle.
   - Transactions or sales report.
   - Subscriptions report.
   - Adjustments, refunds and credits report.
   - Chargebacks/disputes report.
   - Fees report.
   - Tax/VAT/sales tax/GST report.
   - Payouts or balance/settlement report.
   - Customer invoices/receipts sample archive if available.

2. Store reports.
   - Folder: `Accounting/YYYY-MM/`.
   - Use immutable exports where possible: CSV/PDF plus screenshots for dashboard-only settings.
   - Keep checkout, refund policy and subscription wording screenshots when they change.

3. Reconcile Paddle activity.
   - Tie gross customer sales to refunds, credits, chargebacks, fees, taxes and net payout.
   - Tie payout report to bank deposits by payout ID, payout date, currency and amount.
   - Post unmatched timing differences to `Paddle Clearing`.
   - Identify FX differences and bank fees.

4. Reconcile subscriptions and deferred revenue.
   - Compare active subscriptions, cancellations, renewals and trials to product subscription records.
   - Update deferred revenue schedule for annual plans.
   - Confirm refunds and cancellations changed product access correctly.

5. Review exceptions.
   - Failed payments with accidental access.
   - Chargebacks with active access.
   - Refunds without cancelled access when policy requires cancellation.
   - Duplicate subscriptions or duplicate payouts.
   - Missing tax or payout report for a country/currency.

6. Prepare close package.
   - Monthly P&L summary.
   - Deferred revenue roll-forward.
   - Paddle payout reconciliation.
   - Refund/chargeback summary.
   - Tax collected/remitted by Paddle summary.
   - Open issues list for CPA/bookkeeper and product manager.

## Documents Needed By External CPA / Bookkeeper

Company and tax:

- Certificate of incorporation.
- EIN confirmation letter.
- Bylaws, board consents and cap table.
- Registered agent details.
- Business address and officer/UBO information.
- Prior tax filings once available.

Payment and MoR:

- Paddle contract, terms, fee schedule and MoR tax responsibility language.
- Paddle KYC approval evidence.
- Payout reports.
- Transaction/sales reports.
- Refund, credit and chargeback reports.
- Fee reports.
- Tax/VAT/sales tax/GST reports.
- Customer invoice/receipt samples.

Product and revenue:

- Pricing page and plan list.
- Subscription period definitions.
- Trial, discount and coupon rules.
- Refund and cancellation policy.
- Terms, Privacy Policy, Risk Disclaimer and Subscription Terms versions.
- Product access records for paid/expired/refunded users.
- API plan limits and enterprise/API customer contracts if any.

Bank and reconciliation:

- Bank statements.
- Bank deposit detail.
- Accounting system exports.
- Manual journal entries.
- Deferred revenue schedule.
- Payout reconciliation workbook.

## Coordination With Natalia

Mandatory tax/accounting points before first paid subscription:

- Delaware C-Corp and founder/local tax residency review path is confirmed.
- CPA/bookkeeper is selected and accepts MoR accounting workflow.
- Revenue recognition, deferred revenue and MoR payout treatment are approved.
- Paddle tax responsibility language is archived.
- Direct sales outside Paddle are prohibited until separate VAT/sales tax/invoice review.
- Securities/investment-adviser perimeter and product wording remain aligned with informational SaaS positioning.

## Coordination With Marina

Required Paddle reports for accounting:

- Payout/settlement reports with payout IDs and bank transfer amounts.
- Transaction/sales reports with customer, plan, country, currency and billing period.
- Fee reports with platform/payment fees.
- Refund and credit reports.
- Chargeback/dispute and chargeback-fee reports.
- Tax reports showing tax collected/remitted by Paddle.
- Subscription lifecycle reports: new, renewal, cancellation, trial conversion, failed payment.
- Product/price catalog exports and changes.

For Paddle approval/onboarding, accounting needs:

- Clear product description as informational SaaS analytics.
- No personalized investment advice wording.
- Live Terms, Privacy Policy, Risk Disclaimer and Refund/Cancellation Policy.
- Bank account proof and company documents.
- Expected volume, countries served, pricing and refund rules.

## Launch Gate

Accounting status: `Готово с рисками`

Paid launch should remain blocked until:

- CPA/bookkeeper is selected.
- CPA approves the chart of accounts and monthly close workflow.
- Paddle approval is received for the exact product.
- Paddle payout/tax/refund reports are confirmed available for the account.
- Founder/local tax residency review is completed with Natalia.

## References

- Paddle API transactions: https://developer.paddle.com/api-reference/transactions/list-transactions
- Paddle API reports: https://developer.paddle.com/api-reference/reports/list-reports
- Paddle MoR accounting readiness: `docs/accounting-paddle-mor-readiness.md`
- Natalia local counsel/accountant review: `docs/legal/reports/task-09-local-counsel-accountant-questions.md`
- Marina jurisdiction/payment memo: `docs/legal/reports/task-08-business-jurisdiction-payment-report.md`
