# Market Signal AI: questions for local lawyer and accountant

Date: 2026-06-23
Owner: Marina, business jurisdiction / payments / commercial launch
Status: answered practical launch review

Instructions for external reviewer:

Please answer directly under each question in the "Answer" field. If the answer depends on assumptions, please state the assumption. If a local filing, registration, license, invoice format or tax treatment is required, please include the authority, rule name and practical next step.

Assumptions used in this review:

- MVP sells non-personalized SaaS analytics, Telegram alerts and API access.
- No portfolio management, no execution, no custody, no copy trading and no customer-specific financial planning.
- First paid launch uses Paddle or Lemon Squeezy as Merchant of Record.
- Direct Stripe is a later option, not the default first launch route.
- Recommended company is a Delaware C-Corporation unless founder tax facts make another jurisdiction necessary.

## A. Company structure and tax residency

### 1. Which entity type is recommended for this business?

Context: Market Signal AI is a SaaS product with subscriptions, Telegram delivery, API access and market analytics by tickers.

Question:

Should we use LLC, corporation, Georgian LLC/IE, Estonia OÜ, UK Ltd, Israel Ltd or another structure?

Answer:

Recommended structure for a commercial paid SaaS launch: Delaware C-Corporation, using Paddle or Lemon Squeezy as Merchant of Record for the first paid launch.

Reason: Delaware C-Corp is the strongest option for global SaaS credibility, investor readiness, Stripe availability, clean cap table, stock option planning and B2B contracting. Delaware LLC is simpler but creates more tax complexity for foreign founders and future investors. Georgia LLC/IE is acceptable only for a low-cost MVP if direct Stripe is not needed. UK Ltd and Estonia OÜ are acceptable alternatives if there is real UK/EU operational substance or customer focus. Israel Ltd is not recommended unless founders, employees, investors or operations are actually in Israel.

Practical next step: before incorporation, confirm founder tax residence, expected bank country, UBO addresses, investor plans and whether the company will have employees or contractors outside the US.

### 2. Where would corporate tax residency arise?

Context: Founders, management and operations may be in a different country from the incorporation jurisdiction.

Question:

Could the company be treated as tax resident where the founders or management actually operate?

Answer:

Yes. Incorporation in Delaware does not automatically prevent another country from treating the company as locally tax resident if central management and control, effective management, directors, key commercial decisions, bank control, product operations or contract negotiation happen from that country.

Risk is highest if the same founder manages everything from Georgia, Israel, UK, EU or another country while the Delaware company has no real US management substance beyond a registered agent. For a Delaware C-Corp, US federal corporate tax still applies, but non-US tax residence or local taxable presence may also be asserted by the founder/operator country.

Practical next step: document board approvals, officer authority, contract-signing authority, management location, contractor roles and where strategic decisions are made. Obtain local tax advice in each country where founders or core operators live.

### 3. Is there permanent establishment risk?

Context: Team members may work from one or more countries while the company is incorporated elsewhere.

Question:

Could local team activity create permanent establishment, payroll, branch or local tax registration risk?

Answer:

Yes. Permanent establishment, payroll or branch risk can arise if people in a country habitually conclude contracts, negotiate material terms, manage the business, operate a fixed office, provide core product services or act as dependent agents for the company.

Lower-risk activity: independent contractors doing limited development or support from home without authority to bind the company. Higher-risk activity: founder/CEO running sales, pricing, contracting, finance and product from one country; local employees; local office; local customer-facing regulated advice.

Practical next step: use written contractor agreements, no authority-to-bind language, local payroll review before hiring, and country-by-country PE review once revenue or local headcount grows.

### 4. What filings are required after incorporation?

Question:

What annual reports, corporate filings, tax returns, bookkeeping records, accounting statements and beneficial ownership filings are required?

Answer:

For Delaware C-Corp:

- Delaware annual franchise tax report and franchise tax are due by March 1 each year. Delaware corporations must file an annual report and pay franchise tax.
- Federal income tax return: Form 1120 for a C-Corp. Calendar-year corporations generally file by the 15th day of the fourth month after year-end, subject to IRS rules and extensions.
- Registered agent must be maintained in Delaware.
- Corporate records: certificate of incorporation, bylaws, board consents, stock ledger, cap table, founder IP assignments, option/equity records, material contracts and accounting records.
- State/local registrations: may be needed if the company has employees, offices or taxable nexus in a US state.
- Beneficial ownership: as of the FinCEN March 2025 interim final rule, US-created companies are exempt from federal BOI reporting, but this must be rechecked before incorporation because CTA/BOI rules have changed repeatedly.

For Delaware LLC alternative:

- Delaware LLC annual tax is due by June 1; Delaware LLCs do not file the same annual report as corporations.
- Foreign-owned single-member LLCs can have IRS Form 5472/pro forma Form 1120 reporting.

Practical next step: retain US CPA/bookkeeper before launch; set monthly bookkeeping and annual federal/state compliance calendar.

## B. Payment providers and Merchant of Record

### 5. Can this entity onboard with Stripe?

Question:

Can the proposed entity open a direct Stripe account, and what documents, bank account and local presence are required?

Answer:

Delaware C-Corp can generally onboard with Stripe because the United States is a Stripe-supported country. Stripe will still perform KYC, business model review, sanctions review and restricted-business review. Market analytics related to securities may receive additional review because financial products and advisory-like claims are sensitive.

Required items usually include EIN, certificate of incorporation, US business address or acceptable business address, company website, bank account in a supported country/currency, UBO/officer identity documents, ownership/control information, product description, refund/cancellation policy, privacy policy and terms.

Georgia company should not be treated as reliable for direct Stripe unless Stripe availability is confirmed for that exact entity and bank setup.

Practical next step: for MVP, do not depend on Stripe direct. Prepare Stripe file in parallel but launch with MoR unless Stripe approves the exact product and tax workflow.

### 6. Can this entity use Paddle or Lemon Squeezy?

Question:

Can the proposed entity receive payouts from Paddle or Lemon Squeezy as Merchant of Record, and are there any local restrictions?

Answer:

Yes, a Delaware C-Corp is a good candidate for Paddle or Lemon Squeezy, subject to onboarding, KYC, prohibited-business review, sanctions screening and product risk review. Both are designed to act as Merchant of Record for software/SaaS sellers, meaning they generally sell to the end customer, process payments, handle many indirect tax obligations and pay the developer/vendor net payouts.

Local restrictions may still apply if founders or UBOs are in sanctioned or high-risk jurisdictions, if the product is marketed as investment advice, if it enables trading execution, or if the customer geography is restricted.

Practical next step: submit product positioning as "informational SaaS analytics / research tool", not "trading advice" or "investment recommendations".

### 7. How should Merchant of Record payouts be booked?

Context: Paddle or Lemon Squeezy may be the seller to the customer and pay the company after fees, refunds and taxes.

Question:

Should payouts be booked as gross revenue, net revenue, commission income, platform payout or another category?

Answer:

Book MoR payouts based on the contractual role. If Paddle/Lemon Squeezy is legally the seller of record and the company is the supplier/vendor to the MoR, the clean MVP treatment is to record revenue from the MoR/vendor platform, with deductions or contra-revenue for MoR fees, refunds, chargebacks and withheld taxes as shown in payout reports.

For management reporting, keep both gross customer sales and net payout views:

- gross customer sales: useful operational metric from MoR reports;
- tax collected by MoR: liability of MoR, not company revenue;
- refunds/chargebacks: contra-revenue or deduction matched to the original sale;
- MoR/platform fee: selling/payment processing expense unless contract requires net revenue presentation;
- net payout: cash received and reconciled to bank deposits.

Revenue recognition: recognize subscription revenue over the subscription service period, not automatically when cash is paid, if using accrual accounting. Deferred revenue may be needed for annual plans.

Practical next step: CPA should approve chart of accounts and monthly reconciliation using MoR exports.

### 8. What documents are needed for payment provider KYC?

Question:

Please list required documents for Stripe, Paddle and Lemon Squeezy onboarding: incorporation documents, tax ID, bank proof, shareholder data, UBO data, proof of address, website policies and product descriptions.

Answer:

Prepare one KYC folder:

- certificate of incorporation and formation details;
- EIN confirmation letter;
- bylaws or operating agreement, if applicable;
- cap table and shareholder register;
- director/officer list;
- UBO information for 25%+ owners and persons with control;
- passport/ID and address proof for UBOs and responsible persons;
- business bank account proof or bank letter;
- business address proof if requested;
- website URL, product screenshots and checkout flow;
- Terms of Service, Privacy Policy, Risk Disclaimer, Refund/Cancellation Policy;
- clear product description: informational market analytics, no execution, no custody, no personalized advice;
- expected volumes, countries served, pricing, refund rules and customer support contact.

Practical next step: ensure public website policies are live before applying.

## C. VAT, sales tax, GST and local taxes

### 9. Does the company need VAT registration locally?

Question:

Does selling SaaS subscriptions or receiving Merchant of Record payouts trigger local VAT registration?

Answer:

For a Delaware C-Corp with no local operations outside the US, merely receiving MoR payouts should not by itself create VAT registration in customer jurisdictions if the MoR is the seller of record and properly collects/remits indirect taxes. Local VAT/GST registration can still arise in a country where the company has local establishment, local sales, direct invoicing, employees, or direct sales outside the MoR flow.

If using Georgia, UK, Estonia, Ireland or another local company, local VAT rules must be checked separately, including whether SaaS exports, B2B services or domestic sales trigger registration.

Practical next step: do not sell outside the MoR flow until a country-specific VAT/sales tax matrix is approved.

### 10. Does Merchant of Record remove VAT/sales tax obligations?

Question:

If Paddle or Lemon Squeezy is Merchant of Record, does the company still need to register, collect or remit VAT, sales tax or GST in any customer jurisdictions?

Answer:

Usually MoR materially reduces VAT/sales tax/GST obligations because the MoR is the customer-facing seller, issues customer receipts/invoices, calculates tax, collects tax, remits tax and handles tax reporting for covered transactions. It does not remove all obligations.

Company still must:

- keep MoR agreements and tax/payout reports;
- confirm which countries and product categories the MoR covers;
- avoid issuing duplicate customer invoices showing itself as seller;
- handle corporate income tax on its own revenue;
- handle local VAT/payroll/PE if it has local substance;
- register if it sells directly outside the MoR.

Practical next step: obtain written MoR tax responsibility language from the chosen provider and archive monthly tax reports.

### 11. What changes if the company sells directly through Stripe?

Question:

If we use direct Stripe checkout, what VAT, sales tax, GST and digital services tax registrations may be required?

Answer:

Direct Stripe makes the company the seller to the customer. The company then becomes responsible for determining, collecting, remitting and reporting VAT, sales tax, GST and similar taxes.

Likely requirements:

- US sales tax nexus and SaaS taxability review by state;
- EU B2C VAT on digital services based on customer location, with OSS/non-Union OSS review;
- UK VAT for digital services to UK consumers if thresholds/rules require;
- Canada GST/HST, Australia GST, New Zealand GST and other digital services regimes depending on customer geography and thresholds;
- B2B validation and reverse-charge handling where applicable;
- invoice/receipt compliance and customer location evidence.

Digital services tax usually targets very large platforms and is unlikely for MVP revenue, but should be monitored if scale becomes material.

Practical next step: do not switch to direct Stripe until tax engine, registration matrix, invoice templates, customer-location evidence and monthly filings are ready.

### 12. Are SaaS subscriptions taxable in the relevant jurisdiction?

Question:

Are digital SaaS subscriptions, API access, Telegram signal delivery or market analytics taxable locally?

Answer:

Yes, they can be taxable depending on customer location and seller structure. SaaS, API access, digital content and electronic subscriptions are commonly treated as taxable digital services in many VAT/GST regimes. US sales tax treatment varies by state: some tax SaaS, some do not, and sourcing rules vary.

For MoR transactions, the MoR should determine customer-level taxability. For direct sales, Market Signal AI must determine it.

Practical next step: classify product SKUs as SaaS/digital service/API subscription and have CPA/tax provider confirm tax codes before direct checkout.

### 13. Are B2B and B2C sales treated differently?

Question:

What changes for B2B customers with tax IDs compared to B2C consumers?

Answer:

Yes. B2C digital services often require seller/MoR collection of VAT/GST/sales tax based on customer location. B2B can be different if the customer provides a valid VAT/GST/tax ID, business name and address. In many VAT systems, B2B cross-border services may use reverse charge, meaning the business customer accounts for VAT locally.

For the US, B2B status does not automatically remove sales tax; exemptions usually require valid exemption certificates or state-specific rules.

Practical next step: checkout must collect and validate tax IDs for B2B where supported, store customer business evidence, and separate B2B/B2C reporting.

## D. Invoices, receipts and bookkeeping

### 14. Who must issue invoices or receipts to customers?

Question:

If using Merchant of Record, is the MoR-issued receipt/invoice sufficient for the customer? Does our company need to issue any customer-facing invoice?

Answer:

If Paddle or Lemon Squeezy is Merchant of Record, the MoR-issued customer receipt/invoice should normally be the customer-facing tax document because the MoR is the seller of record. Market Signal AI should not issue a duplicate customer tax invoice for the same sale unless counsel/CPA confirms the required format and wording.

Market Signal AI should keep internal invoices/statements or accounting support for amounts receivable from the MoR, payout statements and monthly reconciliation.

Practical next step: configure checkout so customer receipts clearly show the MoR as seller and Market Signal AI as product/service where appropriate.

### 15. What invoice details are mandatory?

Question:

Please confirm required invoice details: legal name, tax ID, address, customer data, VAT ID, reverse-charge wording, service description, currency, tax amount and invoice numbering.

Answer:

For MoR customer invoices, mandatory details are controlled by MoR template and local tax law. Verify that invoices/receipts include seller legal name, seller tax/VAT ID where required, seller address, customer data where required, invoice/receipt number, date, service description, billing period, currency, tax rate/amount, total amount and refund/credit note handling.

For Market Signal AI invoices to business/API customers outside MoR, include:

- legal company name and address;
- tax ID/EIN and VAT/GST registration number if registered;
- invoice number and issue date;
- customer legal name, address and tax ID if B2B;
- description: SaaS/API market analytics subscription, not investment advice;
- service period;
- currency, net amount, tax amount, gross amount;
- reverse-charge wording where applicable;
- payment terms;
- cancellation/refund reference.

Practical next step: use MoR invoices for B2C MVP; create direct invoice template only for approved B2B/API contracts.

### 16. What records must be kept?

Question:

What accounting records, payment reports, customer location evidence, tax reports and refund records must be retained, and for how long?

Answer:

Keep:

- incorporation and governance records permanently;
- contracts, Terms versions, policy versions and checkout screenshots;
- monthly MoR payout reports, tax reports, fee reports and refund/chargeback reports;
- bank statements and reconciliations;
- invoices/receipts/credit notes;
- customer location evidence where available;
- tax filings and workpapers;
- subscription lifecycle records: signup, trial consent, renewal, cancellation, refund;
- API customer contracts and usage logs relevant to billing/compliance.

Retention: use at least 7 years for accounting and tax support unless local law requires longer; keep corporate records permanently.

Practical next step: create a monthly close checklist and archive MoR exports before dashboards overwrite or aggregate data.

### 17. How should refunds and chargebacks be recorded?

Question:

What is the correct accounting treatment for refunds, chargebacks, credits and failed payments?

Answer:

Refunds and credits should reduce revenue or be recorded as contra-revenue in the period they relate to, matched against the original subscription where practical. Chargeback fees should be recorded as payment/platform expense. Chargeback reversals should reverse the prior entry. Failed payments should not be recognized as cash receipts and should only remain as receivable if collection is probable.

For annual subscriptions under accrual accounting, refund of unused service may also reduce deferred revenue. For MoR, reconcile all refunds and chargebacks to provider reports rather than only bank deposits.

Practical next step: define chart-of-accounts categories for revenue, deferred revenue, MoR fees, refunds, chargebacks, chargeback fees and tax withheld by MoR.

## E. Subscription, refund and cancellation wording

### 18. What must be disclosed before payment?

Question:

For recurring subscriptions, what price, renewal, billing cycle, cancellation, trial and refund information must be shown before checkout?

Answer:

Before payment, checkout must clearly show:

- price and currency;
- billing period: monthly/annual;
- automatic renewal statement;
- first charge date;
- trial length and date/price after trial if trial exists;
- cancellation method and effective date;
- refund policy;
- taxes, if shown separately;
- customer support contact;
- Terms, Privacy Policy, Risk Disclaimer and Refund/Cancellation Policy links.

Customer must affirmatively consent to recurring billing. Do not hide renewal or cancellation details in only the Terms.

Practical next step: preserve screenshots of checkout and renewal/trial wording for compliance evidence.

### 19. What cancellation flow is required?

Question:

Does cancellation need to be self-service? Can cancellation be handled by email or support request? Are there time limits?

Answer:

Use self-service online cancellation for MVP if technically possible. Even where a specific federal click-to-cancel rule is uncertain or has been challenged, consumer protection risk is much lower when cancellation is as easy as signup. Some US states and non-US consumer regimes may require simple online cancellation for online subscriptions.

Email-only cancellation is higher risk, especially for US consumers, EU/UK consumers and app-like recurring subscriptions. If support cancellation is used temporarily, it should be processed promptly, with confirmation email and no additional friction.

Practical next step: configure cancellation through MoR customer portal and link it from account, receipt emails and support pages.

### 20. What refund policy is allowed?

Question:

Can we use "no refunds after digital access begins", partial refunds, pro-rata refunds or discretionary refunds?

Answer:

For MVP, use a clear limited refund policy aligned with the MoR flow. A strict "no refunds after digital access begins" can be possible for digital services in some jurisdictions only if pre-contract disclosures and consumer consent/acknowledgment are handled correctly. It is risky as a global blanket statement.

Recommended practical policy:

- monthly plans: no routine refund after billing period starts, but discretionary refunds for billing errors, duplicate charges, technical failure or legal requirements;
- annual plans: consider pro-rata or partial refund for early MVP to reduce disputes;
- trials: charge only after disclosed trial end date;
- chargebacks: resolve through MoR process.

Practical next step: make policy match Paddle/Lemon Squeezy settings exactly.

### 21. Are free trials or promotional discounts regulated?

Question:

What wording is required for free trials, introductory prices, annual plans and automatic conversion to paid subscription?

Answer:

Yes. Trials and discounts must disclose the trial length, what happens at the end, amount and date of first charge, renewal period, cancellation deadline and cancellation method. Introductory pricing must disclose the regular price after promotion. Annual plans must disclose upfront annual charge and renewal date.

Recommended wording near purchase button: "After the trial ends on [date], your subscription renews at [price] every [period] until cancelled. You can cancel online before renewal."

Practical next step: send trial-ending and renewal reminders where MoR supports them, especially for annual plans.

## F. Market analytics, ticker signals and investment advice risk

### 22. Can the product launch without an investment adviser license?

Context: The product provides non-personalized market analytics and ticker signals. It does not manage portfolios, execute trades or tailor advice to a user's financial situation.

Question:

Can this product be launched as informational SaaS analytics without investment adviser, financial adviser, broker-dealer or similar registration?

Answer:

Potentially yes, but only if it remains genuinely impersonal informational analytics. The product should be positioned as a software/research tool that provides general market analytics, not advice to buy, sell or hold securities for a particular user.

US risk is material because the Investment Advisers Act definition can cover compensated analyses or reports concerning securities. The safer basis is the impersonal publication/research-tool position: no personalization, no client-specific suitability, no portfolio-based recommendations, no fiduciary language and no execution.

This is not fully cleared for unrestricted global launch. Securities counsel should review US, UK, EU and Israel exposure before paid launch to those markets.

Practical next step: MVP may launch as informational SaaS only with strict product limits, disclaimers and blocked high-risk features.

### 23. Which product features would trigger licensing risk?

Question:

Please identify features that may create licensing risk: buy/sell/hold signals, personalized recommendations, portfolio import, risk profile, target price, expected return, auto-trading, copy trading, alerts based on user holdings or API execution integrations.

Answer:

High-risk or blocked for MVP:

- personalized recommendations;
- portfolio import used to generate alerts or recommendations;
- risk profile or suitability questionnaire;
- "you should buy/sell/hold" outputs;
- target prices or expected returns presented as action guidance;
- auto-trading, copy trading or broker/API execution;
- order routing or trade placement;
- alerts based on user holdings;
- model portfolios for a user's circumstances;
- managed accounts or custody;
- human analyst chat giving individualized trade advice.

Lower-risk if carefully drafted: general ticker analytics, sentiment, volatility, technical/fundamental indicators, educational commentary, watchlists selected by user without personalization, and neutral alerts that do not tell the user what action to take.

Practical next step: keep feature gate in product roadmap and require legal review before any high-risk feature ships.

### 24. Which words should be avoided in marketing?

Question:

Please confirm whether we should avoid words such as "investment advice", "advisor", "recommendation", "buy", "sell", "guaranteed profit", "portfolio advice", "AI financial adviser" or similar terms.

Answer:

Yes. Avoid "investment advice", "financial advice", "advisor/adviser", "recommendation", "buy now", "sell now", "hold", "guaranteed profit", "safe return", "risk-free", "beat the market", "portfolio advice", "personalized trading advice", "AI financial adviser", "we tell you what to trade" and similar wording.

Preferred wording: "market analytics", "informational signals", "ticker analytics", "research tool", "educational market data", "non-personalized analytics", "decision-support software".

Practical next step: run a marketing copy review before paid launch and block prohibited terms in website, Telegram and emails.

### 25. What disclaimers are required?

Question:

What disclaimer wording should appear in Terms, checkout, website, Telegram messages, API docs, emails and dashboard?

Answer:

Use short, repeated disclaimers at the point of use:

"Market Signal AI provides non-personalized market analytics and informational tools only. It is not investment, financial, legal or tax advice. We are not a broker, dealer, investment adviser, portfolio manager or fiduciary. We do not execute trades or manage assets. You are solely responsible for your own investment decisions."

For Telegram/API outputs add:

"Signals and analytics are general information, not a recommendation to buy, sell or hold any security or asset."

For checkout add:

"Subscription provides access to informational analytics only and does not include personalized financial advice."

Practical next step: place disclaimers in Terms, Risk Disclaimer, footer, checkout, Telegram bot messages, dashboard, API docs and B2B contract templates.

### 26. Should any countries or customer types be blocked?

Question:

Should we geoblock or restrict US, EU, UK, Israel or other jurisdictions until further licensing review?

Answer:

Recommended MVP restrictions until securities counsel review:

- Do not actively market paid subscriptions as investment/trading signals to US, UK, EU or Israel retail investors.
- Avoid paid B2C ads targeted to regulated financial-advice-sensitive markets until review is complete.
- Block sanctioned countries and regions required by payment provider and applicable sanctions law.
- Block users who state they are broker-dealers, investment advisers, asset managers, signal resellers, copy-trading providers or trading communities unless they sign a separate B2B/API agreement.
- Block minors and users in jurisdictions where the payment provider cannot serve customers.

I would not fully geoblock the US/EU/UK for a limited informational SaaS MVP if counsel accepts the impersonal-publication position, but I would avoid targeted marketing and high-risk wording there until review is complete.

Practical next step: add restricted-use terms and customer-type self-certification for API/B2B.

### 27. Are API customers a special risk?

Question:

If B2B customers use our API to build trading tools or customer-facing signals, what terms and restrictions should we impose?

Answer:

Yes. API customers can create downstream regulated-use risk. API Terms should prohibit use in personalized advice, broker execution, robo-advice, copy trading, managed portfolios, order routing, paid signal resale, white-label advisory services, trading communities or consumer-facing recommendations without a separate written agreement and legal approval.

Require API customers to:

- display Market Signal AI attribution and disclaimers where outputs are shown;
- comply with financial services laws in their jurisdictions;
- not present outputs as personalized recommendations;
- not use outputs for automated execution;
- indemnify Market Signal AI for misuse;
- provide audit/cooperation rights for suspected prohibited use;
- use plan limits and no redistribution unless licensed.

Practical next step: keep MVP API limited to internal business use or low-risk display with written approval.

## G. Practical launch approval

### 28. What must be completed before paid launch?

Question:

Please list mandatory legal, tax, accounting, payment and compliance items required before accepting paid subscriptions.

Answer:

Mandatory before paid launch:

- final company decision and incorporation;
- EIN and bank account;
- CPA/bookkeeper engaged;
- chart of accounts and MoR reconciliation workflow;
- MoR onboarding approved for exact product;
- Terms, Privacy Policy, Risk Disclaimer, Refund/Cancellation Policy live;
- checkout disclosures for price, renewal, cancellation, trial and refund;
- self-service cancellation or MoR customer portal;
- invoice/receipt flow confirmed;
- securities/investment-advice perimeter review for MVP wording and features;
- marketing copy review;
- restricted countries/customer types implemented;
- sanctions/payment provider restrictions followed;
- data protection basics and customer support contact;
- monthly compliance calendar for filings, tax, bookkeeping and policy version archive.

### 29. What can wait until after MVP?

Question:

Which items can be deferred until revenue, customer geography or product features expand?

Answer:

Can defer if MVP uses MoR and stays non-personalized:

- direct Stripe sales tax/VAT registrations;
- full multi-country VAT/GST registrations outside MoR;
- complex revenue recognition automation, if manual monthly close is accurate;
- enterprise SOC/security certifications;
- formal equity/option plan unless hiring/investment requires it;
- local foreign subsidiary/branch registrations unless local staff or office exists;
- broader country-specific financial regulatory opinions beyond launch markets;
- custom B2B invoicing automation until enterprise/API sales begin.

Do not defer securities perimeter review, checkout disclosures, refund/cancellation alignment, MoR approval or bookkeeping setup.

### 30. What is your recommended launch structure?

Question:

Based on the above, please recommend the best launch structure and any unacceptable alternatives.

Answer:

Recommended launch structure:

Delaware C-Corp + Paddle or Lemon Squeezy as Merchant of Record + strict informational SaaS analytics positioning + no personalized advice/execution features + CPA-led monthly MoR accounting.

Acceptable alternatives:

- UK Ltd + MoR if founders prefer UK substance and UK accountant is engaged.
- Estonia OÜ/Ireland Ltd + MoR if EU focus and EU VAT/accounting support exist.
- Georgia company + MoR only for low-cost MVP, not for Stripe-led launch or investor-ready structure.

Unacceptable for paid launch now:

- direct Stripe from day one without sales tax/VAT/invoice readiness;
- marketing as investment advice or AI financial adviser;
- buy/sell personalized signals;
- portfolio import with recommendations;
- auto-trading/copy trading/broker integrations;
- accepting API customers for resale/advisory use without separate contract and legal review.

Final status: Готово с рисками

## H. Reviewer details

Reviewer name: Natalia

Jurisdiction: Practical cross-border SaaS launch review; Delaware/US-first structure with customer-jurisdiction tax and regulatory caveats

Role: lawyer / accountant / tax adviser / other: local counsel and tax/accounting reviewer role; external licensed counsel/CPA sign-off still required before launch

Date: 2026-06-24

Notes:

This review is launch-operational, not a substitute for a signed legal opinion or CPA tax memo. The structure is workable, but paid launch remains conditional on: (1) MoR approval, (2) founder/local tax residency review, (3) securities/investment-adviser perimeter review, and (4) accounting setup for MoR payouts, refunds and deferred revenue.

Current verification sources used:

- Stripe global availability: https://docs.stripe.com/global
- Delaware annual report/franchise tax: https://corp.delaware.gov/frtax/
- FinCEN BOI current alert: https://www.fincen.gov/boi
- Paddle Merchant of Record: https://www.paddle.com/merchant-of-record
- Lemon Squeezy Merchant of Record: https://www.lemonsqueezy.com/features/merchant-of-record
- SEC investment adviser information: https://www.sec.gov/investment
- Investment Advisers Act definition reference: https://www.law.cornell.edu/uscode/text/15/80b-2
