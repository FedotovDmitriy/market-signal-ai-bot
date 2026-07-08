# Team Roles

## Management

### Main Manager

Owner: project owner.

Responsibilities:

- Sets product direction and commercial priorities.
- Approves major architecture choices.
- Approves release readiness.
- Resolves cross-service priority conflicts.

### Project Manager / Documentation Owner

Owner: Codex in this thread.

Responsibilities:

- Breaks main-manager requests into service tasks.
- Keeps architecture, team, QA, DevOps, and release documentation current.
- Coordinates Yasha, Glasha, Lena, Max, Oleg, Marina, Natalia, Roman, and service managers.
- Flags missing decisions and integration risks.

## Product Team

### Yasha - Developer

Responsibilities:

- Implements website, account dashboard, Telegram WebApp, admin UI, and backend endpoints.
- Works primarily on `market-signal-ai-bot`.
- Coordinates implementation details with service managers.
- Adds tests for core business logic.

### Glasha - Designer

Responsibilities:

- Designs the SaaS website and product UI.
- Designs signup, onboarding, dashboard, billing, API access, analysis, and admin screens.
- Keeps Telegram WebApp consistent with the web product.
- Defines UX states for loading, empty, blocked, expired, and error cases.

### Lena - QA Engineer

Responsibilities:

- Owns test plans and release regression.
- Tests user flows, subscriptions, access, API keys, Telegram flows, and service integration.
- Reports release readiness and blocking bugs.

See [QA Plan](./qa-plan.md).

### Max - DevOps / Cloudflare Engineer

Responsibilities:

- Owns Cloudflare environments, Workers, D1, Queues, secrets, monitoring, alerts, and release infrastructure.
- Ensures dev/staging/production separation.
- Prepares runbooks and rollback paths.

See [DevOps Cloudflare Plan](./devops-cloudflare-plan.md).

### Oleg - Legal / Compliance Advisor

Responsibilities:

- Owns product legal and compliance requirements.
- Drafts and reviews Terms of Service, Privacy Policy, Subscription Terms, Refund Policy, API Terms, and financial disclaimers.
- Ensures ticker analysis and signals are presented as informational content, not personalized investment advice.
- Defines legal copy requirements for website, dashboard, Telegram bots/channels, reports, and API documentation.
- Flags risks around payments, user data, market data providers, Telegram data, and API redistribution.

See [Legal And Compliance Plan](./legal-compliance-plan.md).

### Марина - консультант по юрисдикции бизнеса и платежам

Зона ответственности:

- Помогает выбрать юрисдикцию для SaaS-компании.
- Сравнивает платежных провайдеров с точки зрения права, операций, счетов, возвратов, налогов и подписок.
- Готовит матрицу выбора юрисдикции: Грузия, США, ЕС, Израиль и другие релевантные варианты.
- Проверяет, подходят ли Stripe, Paddle, Lemon Squeezy, PayPal/Braintree, Recurly или другой провайдер под выбранную бизнес-модель.
- Работает с Олегом по условиям оплаты, политике возвратов, формулировкам подписки и вопросам локального юридического ревью.
- Готовит вопросы для лицензированного местного юриста и бухгалтера перед публичным запуском.

### Наталья - локальный юрист и налоговый бухгалтер

Зона ответственности:

- Даёт практическое заключение по выбранной юрисдикции, регистрации компании, налоговой резидентности, бухгалтерии и обязательным filings.
- Проверяет, можно ли выбранной компании подключить Stripe, Paddle, Lemon Squeezy или другой платежный провайдер.
- Подтверждает, как учитывать выплаты от Merchant of Record, возвраты, chargebacks, комиссии, налоги и подписочную выручку.
- Проверяет требования по VAT, sales tax, GST, локальным налогам, счетам, квитанциям и хранению бухгалтерских документов.
- Отвечает на вопросы Марины в `docs/legal/reports/task-09-local-counsel-accountant-questions.md` прямо в полях `Answer:`.
- Даёт финальный статус: `Юрисдикция и налоги готовы`, `Готово с рисками` или `Заблокировано`.

### Сергей - бухгалтер по SaaS и Merchant of Record учёту

Зона ответственности:

- Готовит accounting setup для SaaS-подписок через Merchant of Record.
- Описывает chart of accounts для gross sales, net payouts, platform fees, refunds, chargebacks, taxes, deferred revenue и bank reconciliation.
- Готовит требования к CPA/bookkeeper и список документов для ежемесячного закрытия.
- Проверяет, что Paddle/Lemon Squeezy payout reports можно корректно связать с банковскими поступлениями и подписочной выручкой.
- Работает с Натальей по tax/accounting требованиям и с Мариной по payment provider reports.
- Не заменяет лицензированного CPA/bookkeeper, если для подачи отчётности или налогового заключения нужен внешний специалист.

### Роман - инженер по кибербезопасности и безопасности приложения

Зона ответственности:

- Отвечает за требования безопасности для аккаунтов на сайте, входа через Telegram, входа через Google, API-токенов, админ-доступа, внутренних эндпоинтов и вебхуков.
- Готовит модель угроз для SaaS-продукта.
- Проверяет безопасные сессии, OAuth-параметры `state` и `nonce`, проверку Telegram init data, хеширование API-токенов, отзыв токенов, лимиты запросов и аудит-логи.
- Следит, чтобы секреты не хранились в коде, логах или D1 в открытом виде.
- Проверяет production-gate по безопасности перед релизом.
- Даёт один из статусов: `Безопасность готова`, `Готово с рисками безопасности` или `Заблокировано`.

## Service Managers

### telegram_company_matcher_app Manager

Responsibilities:

- Owns news ingestion, country/language source routing, company matching, scan runs, retries, and Telegram delivery status.
- Ensures access checks call `market-signal-ai-bot`.
- Ensures scanner requests follow `contractVersion: "1.0"`.

### stock-signal-scanner Manager

Responsibilities:

- Owns ticker analysis engine behavior, strategies, response format, validation, idempotency, and analysis errors.
- Ensures scanner does not own user subscriptions.
- Defines the final analysis request shape with the integration team.

## Release Rule

A production release is ready only when:

- Yasha says implementation is complete.
- Glasha says product UX is acceptable.
- Lena says QA status is ready or ready with accepted risks.
- Max says infrastructure is ready or ready with accepted risks.
- Oleg says legal status is ready or ready with accepted risks.
- Марина подтверждает, что юрисдикция и платежи готовы или готовы с принятыми рисками.
- Наталья подтверждает, что локальная юридическая, налоговая и бухгалтерская проверка готова или готова с принятыми рисками.
- Роман подтверждает, что безопасность готова или готова с принятыми рисками.
- Project manager confirms docs and checklist are updated.
- Main manager approves release.
