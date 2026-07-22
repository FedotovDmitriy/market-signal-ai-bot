# Documentation Index

This folder is the working knowledge base for Market Signal AI.

## Product And Architecture

- [SaaS Product Architecture](./saas-product-architecture.md) - product model, service boundaries, user flows, and source-of-truth decisions.
- [SaaS UX v0.1](./saas-ux-v0.1.md) - dashboard UX map, first wireframe list, legal UX points, UX states, and Telegram-versus-website scope.
- [UX Production Readiness Review](./ux-production-readiness-review.md) - Glasha's production UX gate for subscription, checkout, read-only channels, private analysis, disclaimers, and mobile Telegram WebApp.
- [Version Roadmap](./version-roadmap.md) - proposed version plan, weekly review rhythm, and launch deadline.
- [Version Task Process](./version-task-process.md) - how each version gets one task/report file for all specialists.
- [v0.1 Task Board](./versions/v0.1-task-board.md) - current version tasks and specialist reports.
- [v0.1 Current Report And Assignments](./versions/v0.1-current-report-and-assignments.md) - current management report, open blockers, decisions, and specialist assignments.
- [v0.1 Next Steps Blockers Assignments](./versions/v0.1-next-steps-blockers-assignments.md) - current blocker list, owners, explanations, and next assignments.
- [Integration Contract](./integration-contract.md) - service-to-service contract between `telegram_company_matcher_app` and `stock-signal-scanner`, plus access checks against `market-signal-ai-bot`.
- [Service Manager Coordination Regulation](./service-manager-coordination-regulation.md) - mandatory contract, security, reporting, escalation, and production coordination rules for service managers.
- [Stock Scanner Contract 1.1 Tasks](./handoffs/stock-signal-scanner-v1.1-tasks.md) - production access, HMAC, cache, quota, and test assignment for `stock-signal-scanner`.
- [Telegram Matcher Contract 1.1 Tasks](./handoffs/telegram-company-matcher-v1.1-tasks.md) - HMAC and synchronized rollout assignment for `telegram_company_matcher_app`.

## Team Operations

- [Team Roles](./team-roles.md) - responsibilities for product management, development, design, QA, DevOps, and service managers.
- [QA Plan](./qa-plan.md) - responsibilities and release checklist for Lena, the QA engineer.
- [DevOps Cloudflare Plan](./devops-cloudflare-plan.md) - responsibilities and infrastructure checklist for Max, the DevOps / Cloudflare engineer.
- [SaaS Merchant of Record Accounting Setup](./accounting-mor-setup.md) - Sergey's Paddle MoR accounting setup, chart of accounts, monthly close process, CPA/bookkeeper requirements, and payout reconciliation checklist.
- [Paddle MoR Accounting Readiness](./accounting-paddle-mor-readiness.md) - production readiness package for Paddle payouts, refunds, chargebacks, taxes, monthly close, and CPA handoff.
- [Legal And Compliance Plan](./legal-compliance-plan.md) - responsibilities and launch requirements for Oleg, the legal/compliance advisor.
- [Security Manager Report v1.0](./security-manager-report-v1.0.md) - Roman's security status report and blocking requirements before public v1.0 launch.

## Release Readiness

- [Production Checklist](./production-checklist.md) - go/no-go checklist before a production launch or major release.
- [Production Readiness Checklist v1.0](./production-readiness-checklist-v1.0.md) - current production gate checklist with specialist assignments for migrations, backup, HMAC keys, Paddle, Telegram production routes, domain, rollback, security, and QA approval.
- [Main Manager Production Decision Tasks](./main-manager-production-decision-tasks.md) - staged production decisions required from the main manager, with explanations and blockers for inactive production and paid launch.
- [Service Status Report 2026-07-17](./service-status-report-2026-07-17.md) - detailed current report for `market-signal-ai-bot`, including service purpose, team, completed work, status, blockers, next steps, and file inventory.
- [Cloudflare Release And Rollback Runbook](./runbooks/cloudflare-release-and-rollback.md) - environment split, production 404 finding, HMAC rotation, D1 backup, deployment order, and rollback procedure.

## Legal And Compliance

- [Risk Disclaimer](./legal/risk-disclaimer.md) - ticker analysis, Telegram, API, and report risk disclaimer.
- [Terms Of Service](./legal/terms-of-service.md) - SaaS product terms for account, reports, Telegram delivery, and service use.
- [Privacy Policy](./legal/privacy-policy.md) - privacy draft covering accounts, Telegram data, payments, API usage, logs, and deletion.
- [Subscription Terms And Refund Policy](./legal/subscription-and-refund-policy.md) - billing, renewal, cancellation, refunds, disputes, and taxes.
- [API Terms Of Use](./legal/api-terms-of-use.md) - API keys, permitted use, restrictions, rate limits, resale, and caching.
- [Required Disclaimer Points](./legal/disclaimer-ui-points.md) - where disclaimers must appear in UI, Telegram, API docs, and reports.
- [Investment Recommendation Risk Review](./legal/investment-recommendation-risk-review.md) - product copy and feature-risk review for avoiding personal investment advice positioning.
- [Legal Research Notes](./legal/legal-research-notes.md) - source notes behind the first legal/compliance draft package.
- [Production-Ready Legal UI Texts](./legal/ui-legal-microcopy.md) - short legal UI copy for Yasha and Glasha.
- [Forbidden Product Phrase List](./legal/forbidden-product-phrases.md) - banned and high-risk phrases for product, marketing, Telegram, reports, and API docs.
- [API Commercial Use MVP Wording](./legal/api-commercial-use-mvp-wording.md) - final MVP wording for commercial display, attribution, disclaimers, and resale restrictions.
- [Payment And Subscription Flow Legal Checklist](./legal/payment-subscription-flow-legal-checklist.md) - provider-dependent legal checklist for Paddle/Lemon Squeezy paid launch.
- [Local Legal And Tax Readiness](./legal/local-legal-tax-readiness.md) - Delaware C-Corp, Paddle MoR, CPA/bookkeeper, founder/local tax residency, and first paid customer readiness gates.
- [Business Jurisdiction And Payments Report](./legal/reports/task-08-business-jurisdiction-payment-report.md) - Marina's jurisdiction, payment provider, and Merchant of Record recommendation.
- [Local Counsel And Accountant Questions](./legal/reports/task-09-local-counsel-accountant-questions.md) - questionnaire with `Answer:` fields for Natalia or an external lawyer/accountant.
- [Legal Readiness Review 2026-07-15](./legal/reports/legal-readiness-review-2026-07-15.md) - Oleg's readiness pass for legal documents, product copy, disclaimers, forbidden phrases, and internal auth examples.
