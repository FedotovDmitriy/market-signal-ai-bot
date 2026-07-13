export const INTEGRATION_CONTRACT_VERSION = "1.0" as const;
export const SCANNER_ACCESS_CONTRACT_VERSION = "1.1" as const;

export type ContractVersion = typeof INTEGRATION_CONTRACT_VERSION;
export type ScannerAccessContractVersion = typeof SCANNER_ACCESS_CONTRACT_VERSION;

export type IntegrationSource = "telegram_company_matcher_app";

export type MarketCountry = {
  id: string;
  iso2: string;
  name: string;
  marketCode: string;
  timezone: string;
  language: string;
};

export type TelegramBotTarget = {
  id: string;
  username: string;
  displayName: string;
  tokenSecretName: string;
};

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  language: string;
};

export type MatchedTicker = {
  symbol: string;
  companyName: string;
  countryIso2: string;
  confidence: number;
  reason: string;
};

export type AnalysisRequest = {
  timeframe: string;
  risk: "low" | "medium" | "high";
  anchorBars: string[];
  strategies: string[];
};

export type DeliveryOptions = {
  sendToTelegram: boolean;
  returnReport: boolean;
  messageOrder: "news_first" | "analysis_first" | "ticker_first";
};

export type StockSignalScannerRequest = {
  contractVersion: ContractVersion;
  requestId: string;
  source: IntegrationSource;
  country: MarketCountry;
  bot: TelegramBotTarget;
  news: NewsItem;
  tickers: MatchedTicker[];
  analysis: AnalysisRequest;
  delivery: DeliveryOptions;
};

export type InternalAccessCheckRequest = {
  telegramUserId: string;
  country: string;
  language: string;
};

export type InternalAccessCheckResponse = {
  allowed: boolean;
  reason: string | null;
  userId: string;
  country: string;
  language: string;
  subscriptionStatus: string | null;
  botUrl: string | null;
};

export type InternalDeliveryRequest = {
  contractVersion: ContractVersion;
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

export type InternalDeliveryResponse = {
  contractVersion: ContractVersion;
  requestId: string;
  deliveryId: string;
  status: "sent" | "duplicate" | "access_denied" | "failed";
  telegramMessageId: string | null;
  reason: string | null;
  sentAt: string | null;
  retryable?: boolean;
};

export type ScannerAccessCheckRequest = {
  contractVersion: ScannerAccessContractVersion;
  requestId: string;
  userId: string;
  chatId: string | null;
  ticker: string;
  reportType: "regular" | "fundrep";
  generationVersion: string;
  cacheStatus: "hit" | "miss";
  cacheCreatedAt: string | null;
  cacheGenerationVersion: string | null;
  forceRefresh: boolean;
  language: "ru" | "en" | "he";
};

export type ScannerAccessCheckResponse = {
  contractVersion: ScannerAccessContractVersion;
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
  cacheEntryId: string | null;
};

export type ScannerCacheCommitRequest = {
  contractVersion: ScannerAccessContractVersion;
  cacheReceiptId: string;
  requestId: string;
  ticker: string;
  reportType: "regular" | "fundrep";
  generationVersion: string;
  language: "ru" | "en" | "he";
  resultDigest: string;
};

export type ScannerCacheCommitResponse = {
  contractVersion: ScannerAccessContractVersion;
  cacheEntryId: string;
  committed: boolean;
  expiresAt: string;
};

export type TickerAnalysisResult = {
  symbol: string;
  companyName: string;
  signal: "bullish" | "bearish" | "neutral";
  confidence: number;
  summary: string;
  riskNotes: string[];
  strategyNotes: string[];
};

export type TelegramDeliveryResult = {
  attempted: boolean;
  sent: boolean;
  botUsername: string;
  messageId?: string;
  error?: string;
};

export type StockSignalScannerResponse = {
  contractVersion: ContractVersion;
  requestId: string;
  status: "accepted" | "processed" | "rejected" | "failed";
  report?: {
    title: string;
    summary: string;
    tickers: TickerAnalysisResult[];
  };
  telegram?: TelegramDeliveryResult;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
};
