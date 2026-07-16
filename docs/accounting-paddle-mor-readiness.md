# Paddle MoR Accounting Readiness

Date: 2026-07-15
Owner: Sergey, SaaS and Merchant of Record accounting
Status: `Ready for CPA handoff; production blocked until CPA approval and Paddle approval`

## Scope

This readiness package covers accounting operations for Paddle as Merchant of Record:

- payouts;
- refunds and credits;
- chargebacks and chargeback reversals;
- taxes collected/remitted by Paddle;
- monthly close;
- CPA/bookkeeper handoff.

This is not a tax opinion or a signed CPA memo. It is the internal operating package that the external CPA/bookkeeper must review and approve before first paid production launch.

## Readiness Verdict

Sergey verdict: `PASS WITH BLOCKERS`

Internal accounting readiness is prepared:

- Required Paddle reports are identified.
- Payout reconciliation flow is defined.
- Refund, credit, chargeback and chargeback reversal treatment is defined.
- Tax handling is defined for MoR model.
- Monthly close checklist is defined.
- CPA handoff package is defined.

Production payment acceptance remains blocked until:

- Paddle approves the exact product and company account.
- A CPA/bookkeeper approves the chart of accounts, MoR revenue treatment, deferred revenue workflow and monthly close package.
- The first real Paddle sandbox/live exports are downloaded and checked for fields, currency, tax and payout reconciliation.
- Founder/local tax residency review is completed with Natalia.

## Paddle Source Objects And Reports

Accounting should reconcile from Paddle exports and API-backed reports, not from bank deposits alone.

Minimum required monthly sources:

| Source | Purpose | Monthly use |
| --- | --- | --- |
| Transactions report | Gross sales, billed invoices, canceled/past due transactions and revenue activity | Tie to subscription plans, billing periods, currencies and customer countries |
| Transaction line items report | Plan/product-level revenue detail | Split SaaS subscription, API subscription, discounts and annual plan service periods |
| Adjustments report | Refunds, credits, chargebacks and reversals | Reconcile contra-revenue and dispute activity |
| Adjustment line items report | Item-level adjustment detail | Match refunds/credits to original products and service periods |
| Subscriptions export/API | Active, trialing, paused, canceled and renewed subscriptions | Reconcile product access and deferred revenue schedule |
| Payout/settlement/balance report | Net cash settlement paid to bank | Reconcile Paddle clearing to bank deposits |
| Tax report | VAT, sales tax, GST or similar indirect taxes collected/remitted by Paddle | Archive as MoR tax evidence; normally not company revenue |
| Products/prices export | Active price catalog | Confirm plan IDs, billing periods, currencies and changes |
| Customer invoice/receipt samples | Evidence of customer-facing seller and tax document | Confirm Paddle/MoR is customer-facing seller |

Paddle documentation confirms that Reports can be created/listed/downloaded, transaction reports cover revenue and invoice activity, and adjustment reports cover refunds, credits and chargebacks. The exact field list must be validated against the live Paddle account exports before launch.

## Payout Reconciliation

Goal: every bank deposit from Paddle must tie back to Paddle payout activity and underlying transactions.

Monthly process:

1. Download Paddle payout/settlement/balance report for the month.
2. Download bank statement and bank deposit detail.
3. Match each payout by:
   - payout ID;
   - payout date;
   - payout currency;
   - payout amount;
   - bank deposit date;
   - bank reference where available.
4. Reconcile payout amount:
   - gross customer sales;
   - less refunds and credits;
   - less chargebacks;
   - less Paddle/platform/payment fees;
   - less chargeback fees;
   - less taxes collected/remitted by Paddle, if included in gross flow;
   - plus/minus FX and timing differences;
   - equals net payout to bank.
5. Post unmatched timing differences to `Paddle Clearing`.
6. Clear `Paddle Clearing` when the bank deposit arrives.

Readiness acceptance criteria:

- Each payout has a unique source report and bank match.
- No bank deposit is booked as revenue without Paddle support.
- No negative payout, reserve, holdback, refund, dispute or fee is left unexplained.
- FX differences are separated from Paddle fees.

## Refunds And Credits

Accounting treatment:

- Refunds and credits reduce revenue or are recorded as contra-revenue.
- If the original sale created deferred revenue, reduce deferred revenue first for unused service periods, then use contra-revenue as needed.
- Refund timing should follow Paddle reports, not only customer support notes.
- Access cancellation/refund state must be reconciled against Core subscription/access records.

Monthly checks:

- List all refunds and credits from adjustments reports.
- Match each refund/credit to original transaction ID, customer, plan, amount, currency and service period.
- Confirm whether access was canceled, downgraded or left active according to policy.
- Flag refunds without product access change when policy requires access change.
- Flag product access cancellation without matching Paddle refund when customer was promised refund.

Required CPA decisions:

- Whether refunds are posted as contra-revenue or direct revenue reversals.
- Whether annual-plan refunds reduce deferred revenue before current-period revenue.
- Whether discretionary goodwill credits need separate tracking.

## Chargebacks

Accounting treatment:

- Chargebacks reduce revenue or are recorded as contra-revenue.
- Chargeback fees are separate expenses, not refunds.
- Chargeback reversals reverse the prior chargeback entry when Paddle reports successful recovery.
- Chargeback warnings should be tracked operationally but not booked as final loss until they become chargebacks, unless CPA directs otherwise.

Monthly checks:

- Review all adjustment actions related to chargebacks, warnings and reversals.
- Match each chargeback to original transaction, customer, country, payment method and plan.
- Confirm product access is suspended or reviewed according to risk policy.
- Track dispute status and evidence deadlines if Paddle exposes them.
- Report repeat chargeback customers to product/security.

Readiness acceptance criteria:

- Chargeback amount and chargeback fee are separated.
- Reversals are not double-counted as new revenue.
- Active access after a successful chargeback is flagged.

## Taxes Collected And Remitted By Paddle

MoR principle:

- Paddle is expected to be the customer-facing Merchant of Record for MVP transactions.
- Customer indirect taxes collected/remitted by Paddle are normally not Market Signal AI revenue.
- Market Signal AI still has corporate income tax, bookkeeping, filings, local tax residency and possible PE/payroll obligations.

Monthly tax evidence package:

- Paddle tax report by country/jurisdiction.
- Customer invoice/receipt samples showing seller/tax document treatment.
- Paddle agreement or documentation showing MoR/tax responsibility.
- Product classification: SaaS/digital service/API subscription.
- Any direct sales exceptions: must be `none` for MVP unless separately approved.

Rules:

- Do not issue duplicate customer tax invoices for Paddle MoR sales unless CPA/legal approves exact wording.
- Do not sell directly through Stripe, bank transfer, crypto or manual invoice until direct-sales tax setup is approved.
- Archive tax reports even if Paddle remits the tax.

CPA questions to close:

- Should Paddle tax amounts be excluded entirely from books or tracked in memo accounts?
- Should reports show gross customer sales before tax or after tax for management dashboards?
- Are there any local VAT/GST obligations from founder/company location despite MoR flow?

## Monthly Close Checklist

Target deadline: 10th business day after month end.

Day 1-2:

- Download Paddle transactions, transaction line items, adjustments, adjustment line items, subscriptions, products/prices, payout and tax reports.
- Download bank statement and deposit detail.
- Archive checkout/pricing/refund/legal screenshots if wording changed.

Day 3-5:

- Reconcile gross sales to line items.
- Reconcile refunds, credits, chargebacks and reversals.
- Reconcile fees, tax and net payout.
- Match payout deposits to bank.
- Update deferred revenue schedule.
- Reconcile Core subscriptions/access state to Paddle subscriptions.

Day 6-8:

- Post journal entries.
- Review exception list.
- Prepare monthly P&L support.
- Prepare deferred revenue roll-forward.
- Prepare payout reconciliation workbook.

Day 9-10:

- CPA/bookkeeper review.
- Lock monthly folder.
- Send unresolved items to manager with owners and deadlines.

Close package contents:

- Monthly summary.
- Paddle report exports.
- Bank statement and bank reconciliation.
- Payout reconciliation workbook.
- Deferred revenue schedule.
- Refund/chargeback report.
- Tax collected/remitted by Paddle report.
- Subscription/access exception report.
- Manual journal entry list.
- Open issues list.

## Journal Entry Templates

Final entries must be approved by CPA. Working templates:

Monthly subscription earned through MoR:

```text
Dr Accounts Receivable - MoR / Paddle Clearing
Cr SaaS Subscription Revenue
```

Annual prepaid subscription at sale:

```text
Dr Accounts Receivable - MoR / Paddle Clearing
Cr Deferred Revenue - Subscriptions
```

Monthly release of annual plan:

```text
Dr Deferred Revenue - Subscriptions
Cr SaaS Subscription Revenue
```

Paddle fee:

```text
Dr Paddle Fees
Cr Paddle Clearing
```

Refund:

```text
Dr Refunds And Credits / Deferred Revenue - Subscriptions
Cr Paddle Clearing
```

Chargeback:

```text
Dr Chargebacks
Cr Paddle Clearing
```

Chargeback fee:

```text
Dr Chargeback Fees
Cr Paddle Clearing
```

Bank payout received:

```text
Dr Cash - Operating Bank
Cr Paddle Clearing
```

## CPA Handoff Package

Send to CPA/bookkeeper before first paid launch:

Company:

- Certificate of incorporation.
- EIN confirmation.
- Bylaws, board consents, officer list and cap table.
- Registered agent details.
- Bank account details and statement access/export method.

Paddle:

- Paddle approval evidence.
- Paddle agreement/terms and fee schedule.
- Paddle MoR/tax responsibility language.
- Product, price and plan IDs.
- Webhook/subscription lifecycle mapping if available.
- Sample transactions, refunds, chargebacks, payout and tax exports.

Product/revenue:

- Pricing page.
- Subscription plan matrix.
- Monthly and annual service-period definitions.
- Trial, coupon and discount rules.
- Refund/cancellation policy.
- Terms, Privacy Policy, Risk Disclaimer and Subscription Terms versions.
- Core subscription/access state export format.

Accounting:

- Chart of accounts.
- Revenue recognition policy draft.
- Deferred revenue workbook.
- Payout reconciliation workbook.
- Monthly close checklist.
- Document retention policy.
- Open questions list.

## Open Questions For CPA

- Gross versus net presentation for Paddle/MoR revenue.
- Exact deferred revenue policy for annual plans, refunds and credits.
- Whether Paddle-collected taxes are memo-only or tracked in balance sheet accounts.
- Functional currency and FX policy.
- Treatment of negative payouts, reserves or payout holds if Paddle applies them.
- Whether API/B2B plans need separate revenue recognition review.
- Whether any state/local registrations are triggered by company operations, employees or founders.

## Production Gate

Accounting/MoR production gate remains `BLOCKED`.

It can move to `PASS` only after:

- CPA/bookkeeper is engaged.
- CPA approves this readiness package.
- Paddle approval is complete.
- First account-specific Paddle exports are tested.
- Manager confirms all paid MVP sales go through Paddle MoR only.

## References

- `docs/accounting-mor-setup.md`
- `docs/legal/reports/task-09-local-counsel-accountant-questions.md`
- `docs/legal/reports/task-08-business-jurisdiction-payment-report.md`
- Paddle reports API: https://developer.paddle.com/api-reference/reports/list-reports/
- Paddle transactions API: https://developer.paddle.com/api-reference/transactions/list-transactions/
- Paddle adjustments API: https://developer.paddle.com/api-reference/adjustments/list-adjustments/
- Paddle subscriptions API: https://developer.paddle.com/api-reference/subscriptions/list-subscriptions/
