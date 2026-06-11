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

The endpoint is protected by `INTERNAL_API_SECRET`.

Preferred HMAC headers:

```http
X-Timestamp: <unix_timestamp_seconds>
X-Signature: sha256=<hex_hmac_sha256>
```

Signature payload:

```text
<timestamp>.<method>.<pathname>.<canonical_query>
```

Example payload:

```text
1781184000.GET./api/internal/access.country=IL&language=he&telegramUserId=123456789
```

For internal operations, the endpoint also accepts:

```http
Authorization: Bearer <INTERNAL_API_SECRET>
```

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

### Example Access Check Response: Allowed

```json
{
  "allowed": true,
  "reason": null,
  "userId": "usr_123",
  "country": "IL",
  "language": "he",
  "subscriptionStatus": "active",
  "botUrl": "https://t.me/Israel_News_Ticker_Scanner_bot"
}
```

### Example Access Check Response: Blocked

```json
{
  "allowed": false,
  "reason": "active_subscription_required",
  "userId": "usr_123",
  "country": "US",
  "language": "ru",
  "subscriptionStatus": "expired",
  "botUrl": null
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
