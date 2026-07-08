# Integration Contract: telegram_company_matcher_app -> stock-signal-scanner

## Purpose

This document defines the shared API payload used when `telegram_company_matcher_app` sends a matched news item and ticker candidates to `stock-signal-scanner`.

Both services must treat this contract as versioned and backward-compatible.

```json
{
  "contractVersion": "1.0"
}
```

## Request Payload

`telegram_company_matcher_app` sends one news item, one target country/market, one Telegram bot target, ticker matches, requested analysis settings, and delivery instructions.

```ts
type StockSignalScannerRequest = {
  contractVersion: "1.0";
  requestId: string;
  source: "telegram_company_matcher_app";
  country: {
    id: string;
    iso2: string;
    name: string;
    marketCode: string;
    timezone: string;
    language: string;
  };
  bot: {
    id: string;
    username: string;
    displayName: string;
    tokenSecretName: string;
  };
  news: {
    id: string;
    title: string;
    summary: string;
    url: string;
    publishedAt: string;
    source: string;
    language: string;
  };
  tickers: Array<{
    symbol: string;
    companyName: string;
    countryIso2: string;
    confidence: number;
    reason: string;
  }>;
  analysis: {
    timeframe: string;
    risk: "low" | "medium" | "high";
    anchorBars: string[];
    strategies: string[];
  };
  delivery: {
    sendToTelegram: boolean;
    returnReport: boolean;
    messageOrder: "news_first" | "analysis_first" | "ticker_first";
  };
};
```

## Field Rules

- `contractVersion` must be `"1.0"`.
- `requestId` must be globally unique and reused in logs, retries, and responses.
- `source` must be `"telegram_company_matcher_app"` for this integration.
- `country.iso2` must be an ISO-3166 alpha-2 code such as `IL` or `US`.
- `country.marketCode` should identify the market universe, for example `TASE`, `US`, `NASDAQ`, or `NYSE`.
- `country.timezone` must be an IANA timezone such as `Asia/Jerusalem` or `America/New_York`.
- `bot.tokenSecretName` is the secret name known by the receiving service, not the raw Telegram token.
- `news.publishedAt` must be ISO-8601.
- `tickers.confidence` must be between `0` and `1`.
- `analysis.anchorBars` defines the candle intervals needed for analysis, for example `1h`, `4h`, `1d`.
- `delivery.messageOrder` controls how the report is assembled when Telegram delivery is enabled.

## Required Access Check Before Delivery

Before `telegram_company_matcher_app` sends a user any chat link or signal, it must ask `market-signal-ai-bot` whether the Telegram user has access.

```http
GET /api/internal/access?telegramUserId=<telegram_id>&country=<iso2>&language=<language>
```

### Access Check Authentication

The endpoint is protected by an identified HMAC signing key. Bearer authentication is not accepted.

Preferred HMAC headers:

```http
X-Timestamp: <unix_timestamp_seconds>
X-Key-Id: <active_key_id>
X-Request-Id: <unique_request_id>
X-Signature: sha256=<hex_hmac_sha256>
```

Signature payload:

```text
<timestamp>.<key_id>.<request_id>.<method>.<pathname>.<canonical_query>.<sha256_raw_body>
```

Example payload:

```text
1781184000.matcher-v1.req_123.GET./api/internal/access.country=IL&language=he&telegramUserId=123456789.<sha256_empty_body>
```

The pair `X-Key-Id + X-Request-Id` is single-use. A replay returns HTTP `409`.

HMAC authentication does not grant access to every internal endpoint. Core must enforce an explicit scope allowlist for each active key ID:

- matcher: `matcher:access`, `matcher:deliver`;
- scanner: `scanner:access`, `scanner:cache`, `scanner:history`.
- website: `website:subscriptions`.

A correctly signed request with a key that lacks the endpoint scope returns HTTP `403 internal_scope_required` before Core consumes the transport nonce or executes business logic. Key scopes come from the managed `INTERNAL_API_SCOPES_JSON` allowlist and are never inferred from a key ID prefix.

## Website-To-Core Subscription Events

Contract status: `Implemented in market-signal-ai-bot dev`.

```http
POST /api/internal/subscriptions
```

Owner: `market-signal-ai-bot`.

Caller: public website / checkout backend.

Key IDs:

- dev: `website-dev-v1` - active in Core dev through split Cloudflare secret `INTERNAL_API_SECRET_WEBSITE_DEV_V1` or the managed keyring;
- production: `website-prod-v1` - reserved name, secret is not created or enabled until production approval.

Required scope: `website:subscriptions`.

Authentication is HMAC-SHA256 only. Bearer is not accepted. The request uses `X-Key-Id`, unique transport `X-Request-Id`, `X-Timestamp`, and `X-Signature` with the canonical format defined above.

The request body matches the existing subscription event payload accepted by `/api/subscriptions`, but this internal route is preferred for trusted website-to-Core integration because it supports service key rotation, per-route scopes, and replay protection.

### Access Check Response

```ts
type InternalAccessCheckResponse = {
  allowed: boolean;
  reason: string | null;
  userId: string;
  country: string;
  language: string;
  subscriptionStatus: string | null;
  botUrl: string | null;
};
```

`botUrl` is returned only when `allowed` is `true`.

Known `reason` values:

- `user_not_found`
- `unsupported_country_language`
- `country_not_linked`
- `country_bot_not_configured`
- `active_subscription_required`
- `subscription_period_expired`

## Matcher-To-Core Telegram Delivery

Contract status: `Implemented in market-signal-ai-bot; live dev integration pending`.

```http
POST /api/internal/deliver
```

Owner: `market-signal-ai-bot`.

Caller: `telegram_company_matcher_app`.

Key IDs:

- dev: `matcher-dev-v1` - active in Core dev through the split Cloudflare secret `INTERNAL_API_SECRET_MATCHER_DEV_V1` or the managed keyring;
- production: `matcher-prod-v1` - reserved name, secret is not created or enabled until production approval.

Authentication is HMAC-SHA256 only. Bearer is not accepted. The request uses `X-Key-Id`, unique transport `X-Request-Id`, `X-Timestamp`, and `X-Signature` with the canonical format defined above. A retry keeps the same business `deliveryId` but uses a new transport `X-Request-Id` and signature.

### Delivery Request

```ts
type InternalDeliveryRequest = {
  contractVersion: "1.0";
  requestId: string;
  deliveryId: string;
  recipient:
    | { type: "user"; userId: string; country: string; language: string }
    | { type: "channel"; routeId: string; country: string; language: string };
  content: {
    kind: "news_signal" | "ticker_analysis" | "service_notice";
    text: string;
    ticker: string | null;
    reportType: "regular" | "fundrep" | null;
  };
};
```

Rules:

- Matcher prepares the final plain-text user message. Core does not generate editorial text in v1.0.
- Core resolves the Telegram destination from `userId` or `routeId`; matcher cannot provide a raw Telegram chat ID or bot token.
- Core rechecks user access immediately before user delivery. A previous `/api/internal/access` response is not sufficient by itself.
- Core validates content length and rejects raw monitored-source identifiers, raw secrets, and unsupported formatting.
- `deliveryId` is the business idempotency key. The same valid delivery returns the stored result without sending a second Telegram message.
- A changed immutable payload with the same `deliveryId` is rejected.

### Delivery Response

```ts
type InternalDeliveryResponse = {
  contractVersion: "1.0";
  requestId: string;
  deliveryId: string;
  status: "sent" | "duplicate" | "access_denied" | "failed";
  telegramMessageId: string | null;
  reason: string | null;
  sentAt: string | null;
  retryable?: boolean;
};
```

HTTP policy:

- `200`: `sent`, `duplicate`, or business `access_denied`;
- `400`: invalid payload or changed payload for an existing `deliveryId`;
- `401/403`: missing or invalid HMAC authorization;
- `409`: replayed transport `X-Request-Id`, concurrent delivery, or an indeterminate Telegram outcome that must not be retried automatically;
- `503`: Telegram or internal dependency failure. Retry only when `retryable: true`, keeping the same `deliveryId` and using a new transport request ID.

Core owns Telegram credentials, route resolution, final access enforcement, delivery idempotency ledger, Telegram response metadata, and audit events. User delivery resolves `users.telegram_user_id`; channel delivery resolves the admin-managed `bot_routes.route_id` and `telegram_chat_id`. An ambiguous network outcome is stored as `indeterminate` to prevent duplicate automatic sends. Matcher owns news/analysis orchestration and final plain-text content.

## Scanner-To-Core Access And Quota Check

`stock-signal-scanner` must not accept billing, ownership, subscription, or quota ledger data from a public scanner payload.

Before scanner performs paid or user-targeted analysis, scanner must ask `market-signal-ai-bot` for the final access and quota decision.

```http
POST /api/internal/access/check
```

Owner: `market-signal-ai-bot`.

Caller: `stock-signal-scanner`.

Authentication: HMAC-SHA256 only. Send `X-Key-Id`, unique `X-Request-Id`, `X-Timestamp`, and `X-Signature: sha256=<hex>` and sign:

```text
<timestamp>.<key_id>.<request_id>.<method>.<path>.<canonical_query>.<sha256_raw_body>
```

For this endpoint, the canonical query is empty. The timestamp is Unix seconds and expires after five minutes. Reuse of the same key ID and request ID returns HTTP `409`.

### Request

Production target: `contractVersion: "1.1"`. Version `1.0` is the previous development contract and must not be used for the new cache-aware production integration.

```ts
type ScannerAccessCheckRequest = {
  contractVersion: "1.1";
  requestId: string;
  userId: string;
  chatId: string | null;
  ticker: string;
  reportType: "regular" | "fundrep";
  generationVersion: string;
  cacheStatus: "hit" | "miss"; // diagnostic hint only
  cacheCreatedAt: string | null; // diagnostic hint only
  cacheGenerationVersion: string | null; // diagnostic hint only
  forceRefresh: boolean;
  language: "ru" | "en" | "he";
};
```

`cacheStatus`, `cacheCreatedAt`, and `cacheGenerationVersion` are signed diagnostic hints. They never authorize a discounted charge. Core decides cache hit/miss only from its own committed cache ledger. `forceRefresh: true` always bypasses cache.

### Response

```ts
type ScannerAccessCheckResponse = {
  contractVersion: "1.1";
  requestId: string;
  allowed: boolean;
  chargeUnits: number;
  quotaDecision:
    | "new_regular"
    | "own_repeat"
    | "cached_regular"
    | "refresh_regular"
    | "new_fundrep"
    | "own_repeat_fundrep"
    | "cached_fundrep"
    | "refresh_fundrep"
    | "rejected_no_quota"
    | "rejected_no_access";
  cacheStatus: "hit" | "miss" | "bypass";
  reportSource: "new_analysis" | "cache" | "own_repeat" | "none";
  remainingUnits: number | null;
  reason: string | null;
  cacheReceiptId: string | null;
};
```

For an allowed `new_*` or `refresh_*` decision, Core creates and returns a one-time `cacheReceiptId`. The receipt must be committed within 15 minutes of issuance. Replaying the same `requestId + ticker` returns the same receipt without another charge. Cached and rejected decisions return `null`.

### Quota Cost And TTL

| Scenario | `chargeUnits` |
| --- | ---: |
| regular new or refresh | 1 |
| regular cached | 0.5 |
| regular own repeat | 0 |
| FundRep new or refresh | 3 |
| FundRep cached | 1.5 |
| FundRep own repeat | 0 |

Cache TTL is 60 minutes. Core stores quota in integer half-unit credits (`0.5 unit = 1 credit`) and converts back to units in the API response.

### Core-Owned Cache Commit

After a successful new or refreshed analysis, scanner commits the Core-issued receipt:

```http
POST /api/internal/access/cache/commit
```

The endpoint uses the same HMAC-only transport and replay protection.

```ts
type ScannerCacheCommitRequest = {
  contractVersion: "1.1";
  cacheReceiptId: string;
  requestId: string;
  ticker: string;
  reportType: "regular" | "fundrep";
  generationVersion: string;
  language: "ru" | "en" | "he";
  resultDigest: string;
};

type ScannerCacheCommitResponse = {
  contractVersion: "1.1";
  cacheEntryId: string;
  committed: boolean;
  expiresAt: string;
};
```

Core accepts commit only for an existing, unused receipt issued by an allowed full-price new/refresh decision with matching immutable fields. Core sets `createdAt` and `expiresAt` using server time. Future cache discounts are based only on this committed ledger entry, never on scanner-provided cache metadata.

### HTTP And Idempotency Policy

- Allowed and rejected business decisions return HTTP `200`.
- Invalid payload, unsupported contract version, or reuse of `requestId + ticker` with different immutable payload fields returns HTTP `400`.
- Missing or invalid HMAC authentication returns HTTP `401` or `403`.
- Internal database or service unavailability returns `5xx`.
- Repeating the same valid business payload for `requestId + ticker` returns the stored own-repeat decision with zero additional charge.

Known `reason` values should include:

- `active_subscription_required`
- `subscription_period_expired`
- `quota_exceeded`
- `user_not_found`
- `unsupported_report_type`
- `invalid_contract_version`
- `invalid_request`
- `internal_access_unavailable`

Ownership rule:

- `market-signal-ai-bot` owns billing state, subscription ownership, quota ledger, cache receipts, committed cache ledger, charge decision, remaining units, and idempotent quota decisions by `requestId + ticker`.
- `stock-signal-scanner` owns analysis execution and physical result cache. It may send cache hints, but it cannot create a discounted billing cache entry without a Core-issued receipt.
- Scanner must fail closed in production if `/api/internal/access/check` is unavailable or returns an invalid response.

### Example Access Check Response: Allowed

```json
{
  "contractVersion": "1.1",
  "requestId": "req_20260628_001",
  "allowed": true,
  "chargeUnits": 1,
  "quotaDecision": "new_regular",
  "cacheStatus": "miss",
  "reportSource": "new_analysis",
  "remainingUnits": 99,
  "reason": null
}
```

### Example Access Check Response: Blocked

```json
{
  "contractVersion": "1.1",
  "requestId": "req_20260628_002",
  "allowed": false,
  "chargeUnits": 0,
  "quotaDecision": "rejected_no_quota",
  "cacheStatus": "miss",
  "reportSource": "none",
  "remainingUnits": 0,
  "reason": "quota_exceeded"
}
```

## Example Request: Israel News In Hebrew

```json
{
  "contractVersion": "1.0",
  "requestId": "req_20260611_il_001",
  "source": "telegram_company_matcher_app",
  "country": {
    "id": "israel",
    "iso2": "IL",
    "name": "Israel",
    "marketCode": "TASE",
    "timezone": "Asia/Jerusalem",
    "language": "he"
  },
  "bot": {
    "id": "israel-news-ticker-scanner",
    "username": "Israel_News_Ticker_Scanner_bot",
    "displayName": "Israel News Ticker Scanner",
    "tokenSecretName": "TELEGRAM_BOT_TOKEN_IL"
  },
  "news": {
    "id": "news_il_20260611_001",
    "title": "Banking sector rallies after rate outlook update",
    "summary": "Israeli banking shares rose after investors repriced interest-rate expectations.",
    "url": "https://example.com/israel/banking-rate-outlook",
    "publishedAt": "2026-06-11T08:15:00Z",
    "source": "Example Finance IL",
    "language": "he"
  },
  "tickers": [
    {
      "symbol": "LUMI.TA",
      "companyName": "Bank Leumi",
      "countryIso2": "IL",
      "confidence": 0.92,
      "reason": "The article directly references Bank Leumi and Israeli banking shares."
    }
  ],
  "analysis": {
    "timeframe": "swing",
    "risk": "medium",
    "anchorBars": ["1h", "4h", "1d"],
    "strategies": ["trend_following", "news_momentum"]
  },
  "delivery": {
    "sendToTelegram": true,
    "returnReport": true,
    "messageOrder": "news_first"
  }
}
```

## Example Request: US News In Russian

```json
{
  "contractVersion": "1.0",
  "requestId": "req_20260611_us_001",
  "source": "telegram_company_matcher_app",
  "country": {
    "id": "united-states",
    "iso2": "US",
    "name": "United States",
    "marketCode": "US",
    "timezone": "America/New_York",
    "language": "ru"
  },
  "bot": {
    "id": "us-news-ticker-scanner-ru",
    "username": "US_News_Ticker_Scanner_RU_bot",
    "displayName": "US News Ticker Scanner RU",
    "tokenSecretName": "TELEGRAM_BOT_TOKEN_US_RU"
  },
  "news": {
    "id": "news_us_20260611_001",
    "title": "Chip stocks rise after new data-center demand forecast",
    "summary": "Several US semiconductor companies moved higher after analysts raised data-center demand estimates.",
    "url": "https://example.com/us/chip-stocks-data-center-demand",
    "publishedAt": "2026-06-11T13:30:00Z",
    "source": "Example Markets US",
    "language": "ru"
  },
  "tickers": [
    {
      "symbol": "NVDA",
      "companyName": "NVIDIA Corporation",
      "countryIso2": "US",
      "confidence": 0.95,
      "reason": "The article discusses NVIDIA as a primary beneficiary of data-center demand."
    }
  ],
  "analysis": {
    "timeframe": "intraday",
    "risk": "high",
    "anchorBars": ["15m", "1h", "1d"],
    "strategies": ["breakout", "news_momentum"]
  },
  "delivery": {
    "sendToTelegram": true,
    "returnReport": true,
    "messageOrder": "analysis_first"
  }
}
```

## Response Payload

`stock-signal-scanner` must return the same `contractVersion` and `requestId`.

```ts
type StockSignalScannerResponse = {
  contractVersion: "1.0";
  requestId: string;
  status: "accepted" | "processed" | "rejected" | "failed";
  report?: {
    title: string;
    summary: string;
    tickers: Array<{
      symbol: string;
      companyName: string;
      signal: "bullish" | "bearish" | "neutral";
      confidence: number;
      summary: string;
      riskNotes: string[];
      strategyNotes: string[];
    }>;
  };
  telegram?: {
    attempted: boolean;
    sent: boolean;
    botUsername: string;
    messageId?: string;
    error?: string;
  };
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
};
```

## Example Response: Processed

```json
{
  "contractVersion": "1.0",
  "requestId": "req_20260611_us_001",
  "status": "processed",
  "report": {
    "title": "NVDA reacts to data-center demand forecast",
    "summary": "The news supports positive momentum, but risk remains high because the stock is sensitive to valuation and sector rotation.",
    "tickers": [
      {
        "symbol": "NVDA",
        "companyName": "NVIDIA Corporation",
        "signal": "bullish",
        "confidence": 0.81,
        "summary": "Momentum remains constructive while price holds above the selected anchor bars.",
        "riskNotes": ["High valuation sensitivity", "Sector-wide volatility"],
        "strategyNotes": ["Watch breakout continuation", "Use intraday confirmation before entry"]
      }
    ]
  },
  "telegram": {
    "attempted": true,
    "sent": true,
    "botUsername": "US_News_Ticker_Scanner_RU_bot",
    "messageId": "tg_987654"
  }
}
```

## Example Response: Rejected

```json
{
  "contractVersion": "1.0",
  "requestId": "req_20260611_us_002",
  "status": "rejected",
  "errors": [
    {
      "code": "unsupported_contract_version",
      "message": "Only contractVersion 1.0 is supported.",
      "field": "contractVersion"
    }
  ]
}
```

## Retry And Idempotency

- The sender may retry with the same `requestId`.
- The receiver should treat `requestId` as an idempotency key.
- If the receiver already processed the request, it should return the previous result when possible.

## Security

- Do not send raw Telegram bot tokens in this payload.
- Use `bot.tokenSecretName` to reference the secret on the receiving service.
- Transport should use HTTPS.
- Service-to-service calls should use a signed request or shared service token outside this payload.
