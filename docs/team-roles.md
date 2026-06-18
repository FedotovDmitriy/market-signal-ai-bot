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
- Coordinates Yasha, Glasha, Lena, Max, and service managers.
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
- Project manager confirms docs and checklist are updated.
- Main manager approves release.

