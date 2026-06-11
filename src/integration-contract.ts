export const INTEGRATION_CONTRACT_VERSION = "1.0" as const;

export type ContractVersion = typeof INTEGRATION_CONTRACT_VERSION;

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
