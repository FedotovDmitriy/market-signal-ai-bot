# Задание команде stock-signal-scanner - Access Contract 1.1

Task ID: `P0-SCANNER-ACCESS-1.1`

Приоритет: немедленный блокер production Scanner 1.1.

## Цель

Подключить scanner к `market-signal-ai-bot POST /api/internal/access/check` по контракту `1.1` до выполнения платного или пользовательского анализа.

## Задачи

1. Удалить требование Bearer token для scanner-to-core. Использовать только HMAC-SHA256 с `X-Key-Id`, уникальным `X-Request-Id`, `X-Timestamp` и `X-Signature`.
2. Подписывать timestamp, key id, request id, HTTP method, path, canonical query и SHA-256 исходного тела.
3. Отправлять `contractVersion: "1.1"`, `generationVersion`, диагностические cache hints, `forceRefresh` и остальные поля из `docs/integration-contract.md`.
4. Не использовать локальный cache hit как основание для скидки. Итоговые `cacheStatus`, `reportSource` и стоимость определяет только Core по собственному committed cache ledger.
5. Использовать стабильную пару `requestId + ticker`. Повтор собственного запроса должен возвращать сохранённый результат без нового списания.
6. При `allowed=false`, ошибке авторизации, `5xx`, timeout или некорректном ответе не запускать платный анализ: production работает fail-closed.
7. Поддержать все решения regular/FundRep, new/cached/refresh/own-repeat/no-quota/no-access.
8. Добавить тесты успешной подписи, неверной подписи, подмены тела, replay, cache TTL, force refresh, отсутствия квоты и отсутствия доступа.
9. Согласовать с Максом отдельные scanner key id/secret для dev и prod. Значения секретов не записывать в Git, документы, отчёты или чат.
10. Перед production выполнить dev-интеграцию с Core и передать отчёт Роману и Лене.
11. Для `new_*`/`refresh_*` сохранить выданный Core `cacheReceiptId`. После успешного анализа вызвать HMAC-only `POST /api/internal/access/cache/commit` с receipt и digest результата.
12. Не подтверждать receipt после ошибки анализа. Повтор commit должен быть безопасным и не создавать вторую cache entry.
13. Использовать scanner key только со scopes `scanner:access` и `scanner:cache`; ключ matcher или другой внутренний ключ не должен приниматься этими endpoint-ами.

## Критерии приёмки

- Scanner не использует Bearer для внутренних endpoint-ов.
- Контракт `1.1` проходит двусторонние контрактные тесты.
- Повтор `requestId + ticker` не списывает квоту повторно.
- Cache и refresh получают утверждённую стоимость.
- Cached discount невозможен без Core-issued receipt и committed Core cache entry.
- Недоступность Core блокирует анализ.
- Секреты не раскрыты.

## Формат отчёта

```text
Environment:
Contract version:
Core URL configured: yes/no
HMAC-only: PASS/FAIL
Cache status and TTL: PASS/FAIL
Idempotency requestId+ticker: PASS/FAIL
Quota scenarios: PASS/FAIL
Fail-closed: PASS/FAIL
Tests:
Security check:
Result: PASS/FAIL
Blockers:
Files changed:
```

## Финальные независимые проверки

Роман выдаёт отдельный security verdict `PASS`, `PASS WITH RISKS` или `FAIL` по canonical HMAC, replay/nonce, clock skew, key rotation, Web Crypto constant-time comparison, endpoint scopes и отсутствию Bearer downgrade.

Лена выдаёт отдельный integration release verdict `PASS`, `PASS WITH RISKS` или `FAIL` после живого dev сценария Core + Scanner, полного receipt/commit/cache flow, quota matrix и подтверждённого fail-closed при недоступности Core.

Production требует оба результата. Один verdict не заменяет другой.
