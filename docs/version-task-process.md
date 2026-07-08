# Version Task Process

This document defines how Market Signal AI manages tasks and reports for each product version.

## Rule

For every version, the project manager creates one version task file in:

```text
docs/versions/
```

File name format:

```text
vX.Y-task-board.md
```

Example:

```text
docs/versions/v0.1-task-board.md
```

## Version File Structure

Each version task file must include:

- Version goal.
- Version target date.
- Release status.
- Tasks by specialist.
- Report section for each specialist.
- Blockers.
- Decisions needed from the main manager.
- Final project-manager summary.

## Team Reporting Flow

1. Project manager creates the version task file.
2. Each specialist works on their assigned tasks.
3. Each specialist writes their report directly in the same file under their report section.
4. When the main manager says tasks are complete, the project manager reviews all reports.
5. Project manager creates a final management report for the main manager.

## Final Management Report Must Answer

- What was completed.
- What was not completed.
- What is blocked.
- What decisions are needed from the main manager.
- Which specialist needs a separate follow-up discussion.
- Whether the version can move forward.

## Status Values

Use these statuses:

- `Not started`
- `In progress`
- `Ready for review`
- `Blocked`
- `Done`
- `Deferred`

## Specialist Report Format

Each specialist report should include:

```text
Status:
Completed:
Not completed:
Blockers:
Risks:
Needs from manager:
Links/files:
```

## Specialists

The standard version file includes sections for:

- Yasha - Developer.
- Glasha - Designer.
- Lena - QA Engineer.
- Max - DevOps / Cloudflare Engineer.
- Oleg - Legal / Compliance Advisor.
- telegram_company_matcher_app Manager.
- stock-signal-scanner Manager.
- Project Manager / Documentation Owner.

## Main Manager Signal

The project manager does not close a version based only on specialist reports.

The version is closed only after the main manager explicitly asks for a final review or gives a signal such as:

```text
Задачи версии выполнены, подготовь итоговый отчёт.
```

