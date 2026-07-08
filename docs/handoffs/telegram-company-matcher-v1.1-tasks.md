# Задание команде telegram_company_matcher_app - HMAC And Contract 1.1

Task ID: `P0-MATCHER-INTERNAL-HMAC-1.1`

Приоритет: блокер синхронного обновления Core и межсервисных вызовов.

## Цель

Перевести внутренние вызовы matcher к `market-signal-ai-bot` на утверждённую HMAC-only схему и исключить несовместимость после обновления Core.

## Задачи

Подтверждённый matcher key ID:

- dev: `matcher-dev-v1`;
- production: `matcher-prod-v1` зарезервирован, но ещё не активирован.

1. Удалить Bearer-вызовы внутренних endpoint-ов Core.
2. Для каждого запроса отправлять `X-Key-Id`, уникальный `X-Request-Id`, `X-Timestamp` и `X-Signature`.
3. Использовать каноническую строку из `docs/integration-contract.md`, включая digest исходного POST body.
4. Использовать отдельный matcher key id/secret, не совпадающий со scanner secret.
5. Не смешивать версии контрактов: `1.1` относится к scanner-to-core access check. Matcher-to-scanner analysis payload остаётся на согласованной версии `1.0`, пока главный менеджер отдельно не утвердит её изменение.
6. Не помечать доставку или событие успешным при `401`, `403`, `409`, `5xx`, timeout или некорректном ответе Core.
7. Добавить тесты успешной подписи, неверного key id, изменённого query/body, повторного request id и безопасного retry с новым transport request id.
8. Согласовать с Максом dev-секрет и порядок синхронного включения Core/matcher/scanner.
9. Перед production передать результаты Роману и Лене.
10. Для доставки использовать подтверждённый `POST /api/internal/deliver` contract `1.0`: стабильный `deliveryId`, recipient через `userId` или `routeId`, финальный plain-text content без raw chat ID и Telegram token.
11. При retry сохранять business `deliveryId`, но создавать новый transport `X-Request-Id` и новую HMAC-подпись.
12. Считать `sent` и `duplicate` успешным завершением; `access_denied` не отправлять повторно; `502/503` повторять по retry policy.
13. Использовать matcher key только со scopes `matcher:access` и `matcher:deliver`; matcher key не должен получать доступ к scanner quota/cache endpoint-ам.

## Критерии приёмки

- Все внутренние вызовы matcher используют HMAC-only.
- Replay отклоняется, а корректный retry получает новый transport request id без изменения бизнес-idempotency key.
- Ошибка Core не превращается в успешную доставку.
- Секреты отсутствуют в Git, документах, логах и отчёте.

## Формат отчёта

```text
Environment:
Core endpoints updated:
HMAC-only: PASS/FAIL
Replay and retry: PASS/FAIL
Delivery fail-closed: PASS/FAIL
Contract tests:
Security check:
Result: PASS/FAIL
Blockers:
Files changed:
```
