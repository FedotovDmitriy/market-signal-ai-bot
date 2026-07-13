import { describe, expect, it, vi } from "vitest";
import worker from "./index";
import {
  allowedCorsOrigin,
  buildCountryLinks,
  cleanCountries,
  commitScannerCache,
  health,
  internalAccess,
  internalDeliver,
  isSubscriptionCurrentlyAllowed,
  parseFutureIsoTimestamp,
  requestEmailVerification,
  requireWebhookSignature,
  requireApiKey,
  scannerAccessCheck,
  verifyEmailToken,
  verifyTelegramInitData,
  type Env
} from "./index";

type DbResolvers = {
  first?: (query: string, args: unknown[]) => unknown;
  all?: (query: string, args: unknown[]) => unknown[];
  run?: (query: string, args: unknown[]) => number | void;
};

function createEnv(resolvers: DbResolvers, overrides: Partial<Env> = {}): Env {
  const db = {
    prepare(query: string) {
      return {
        bind(...args: unknown[]) {
          return {
            first: async <T>() => resolvers.first?.(query, args) as T,
            all: async <T>() => ({ results: (resolvers.all?.(query, args) ?? []) as T[] }),
            run: async () => {
              const changes = resolvers.run?.(query, args);
              return { success: true, meta: { changes: typeof changes === "number" ? changes : 1 } };
            }
          };
        },
        first: async <T>() => resolvers.first?.(query, []) as T,
        all: async <T>() => ({ results: (resolvers.all?.(query, []) ?? []) as T[] }),
        run: async () => {
          const changes = resolvers.run?.(query, []);
          return { success: true, meta: { changes: typeof changes === "number" ? changes : 1 } };
        }
      };
    }
  } as unknown as D1Database;

  return {
    DB: db,
    ENVIRONMENT: "test",
    PUBLIC_APP_NAME: "Market Signal AI",
    DEFAULT_LOCALE: "en",
    DEFAULT_COUNTRY: "IL",
    ...overrides
  };
}

async function testHmacHex(secret: string | ArrayBuffer, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBytes = typeof secret === "string" ? encoder.encode(secret) : secret;
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function testSha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signedTelegramInitData(botToken: string, user: Record<string, unknown>): Promise<string> {
  const params = new URLSearchParams({
    auth_date: Math.floor(Date.now() / 1000).toString(),
    query_id: "q1",
    user: JSON.stringify(user)
  });
  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", new TextEncoder().encode("WebAppData"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    new TextEncoder().encode(botToken)
  );
  params.set("hash", await testHmacHex(secretKey, dataCheckString));
  return params.toString();
}

function testExecutionContext(): ExecutionContext {
  return {
    waitUntil() {},
    passThroughOnException() {}
  } as unknown as ExecutionContext;
}

function createQuotaEnv(options: {
  usedCredits?: number;
  quotaLimitCredits?: number;
  subscriptionStatus?: string;
  currentPeriodEnd?: string | null;
  plan?: string;
  policyExists?: boolean;
  cacheEntryExpiresAt?: string;
  users?: Record<string, { status?: string; subscriptionId?: string; plan?: string }>;
  cacheEntries?: Array<{
    id: string;
    userId: string;
    ticker?: string;
    reportType?: "regular" | "fundrep";
    generationVersion?: string;
    language?: "ru" | "en" | "he";
    expiresAt: string;
  }>;
} = {}): { env: Env; state: { usedCredits: number; batchCalls: number; decisions: Map<string, Record<string, unknown>> } } {
  const state = {
    usedCredits: options.usedCredits ?? 0,
    batchCalls: 0,
    decisions: new Map<string, Record<string, unknown>>()
  };
  const quotaLimitCredits = options.quotaLimitCredits ?? 200;

  const db = {
    prepare(query: string) {
      const statement = {
        query,
        args: [] as unknown[],
        bind(...args: unknown[]) {
          statement.args = args;
          return statement;
        },
        async first<T>() {
          if (query.includes("FROM quota_decisions_v11")) return state.decisions.get(`${statement.args[0]}:${statement.args[1]}`) as T;
          if (query.includes("FROM core_cache_entries")) {
            const fallbackEntry = options.cacheEntryExpiresAt ? [{
              id: "cache_entry_1",
              userId: "user_1",
              ticker: "NVDA",
              reportType: "regular" as const,
              generationVersion: "gen-v1",
              language: "ru" as const,
              expiresAt: options.cacheEntryExpiresAt
            }] : [];
            const entries = options.cacheEntries ?? fallbackEntry;
            const hasUserFilter = query.includes("WHERE user_id");
            const [userArg, tickerArg, reportTypeArg, generationVersionArg, languageArg, nowArg] = hasUserFilter
              ? statement.args
              : [undefined, ...statement.args];
            const entry = entries.find((candidate) =>
              (!hasUserFilter || candidate.userId === userArg) &&
              (candidate.ticker ?? "NVDA") === tickerArg &&
              (candidate.reportType ?? "regular") === reportTypeArg &&
              (candidate.generationVersion ?? "gen-v1") === generationVersionArg &&
              (candidate.language ?? "ru") === languageArg &&
              Date.parse(candidate.expiresAt) >= Date.parse(String(nowArg))
            );
            return entry ? { id: entry.id } as T : null as T;
          }
          if (query.includes("FROM users WHERE id")) {
            const userId = String(statement.args[0]);
            const user = options.users?.[userId] ?? { status: userId === "user_1" ? "active" : undefined };
            return user.status ? { id: userId, status: user.status } as T : null as T;
          }
          if (query.includes("FROM subscriptions")) return {
            id: options.users?.[String(statement.args[0])]?.subscriptionId ?? "sub_1",
            plan: options.users?.[String(statement.args[0])]?.plan ?? options.plan ?? "starter",
            status: options.subscriptionStatus ?? "active",
            current_period_end: options.currentPeriodEnd === undefined ? "2999-01-01T00:00:00Z" : options.currentPeriodEnd
          } as T;
          if (query.includes("FROM quota_plan_policies")) return (options.policyExists ?? true) ? {
            period_units: quotaLimitCredits / 2,
            period_credits: quotaLimitCredits,
            regular_new_credits: 2,
            regular_cached_credits: 1,
            fundrep_new_credits: 6,
            fundrep_cached_credits: 3,
            cache_ttl_minutes: 60
          } as T : null as T;
          return null as T;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() {
          if (query.includes("INSERT OR IGNORE INTO quota_decisions_v11") && query.includes("'rejected_no_access'")) {
            state.decisions.set(`${statement.args[0]}:${statement.args[1]}`, {
              request_id: statement.args[0],
              ticker: statement.args[1],
              payload_hash: statement.args[2],
              user_id: statement.args[3],
              subscription_id: statement.args[4],
              chat_id: statement.args[5],
              report_type: statement.args[6],
              generation_version: statement.args[7],
              allowed: 0,
              charge_credits: 0,
              quota_decision: "rejected_no_access",
              effective_cache_status: statement.args[13],
              report_source: "none",
              remaining_credits: null,
              cache_receipt_id: null,
              cache_entry_id: null,
              reason: statement.args[14]
            });
          }
          return { success: true, meta: { changes: 1 } };
        }
      };
      return statement;
    },
    async batch(statements: Array<{ query: string; args: unknown[] }>) {
      state.batchCalls += 1;
      const insert = statements.find((statement) => statement.query.includes("INSERT OR IGNORE INTO quota_decisions_v11"));
      if (insert) {
        const decisionKey = `${insert.args[0]}:${insert.args[1]}`;
        if (state.decisions.has(decisionKey)) return [];
        const chargeStatement = statements.find((statement) => statement.query.includes("approved_unsettled") && statement.query.includes("used_credits +"));
        const chargeCredits = Number(chargeStatement?.args[4] ?? 0);
        const allowed = state.usedCredits + chargeCredits <= quotaLimitCredits;
        if (allowed) state.usedCredits += chargeCredits;
        const decisionStatement = statements.find((statement) => statement.query.includes("SET allowed = 1"));
        const decision = {
          request_id: insert.args[0],
          ticker: insert.args[1],
          payload_hash: insert.args[2],
          user_id: insert.args[3],
          subscription_id: insert.args[4],
          chat_id: insert.args[5],
          report_type: insert.args[6],
          generation_version: insert.args[7],
          allowed: allowed ? 1 : 0,
          charge_credits: allowed ? chargeCredits : 0,
          quota_decision: allowed ? decisionStatement?.args[1] : "rejected_no_quota",
          effective_cache_status: insert.args[13],
          report_source: allowed ? decisionStatement?.args[2] : "none",
          remaining_credits: quotaLimitCredits - state.usedCredits,
          cache_receipt_id: null as string | null,
          cache_entry_id: insert.args[14] as string | null,
          reason: allowed ? null : "quota_exceeded"
        };
        const receiptStatement = statements.find((statement) => statement.query.includes("INSERT OR IGNORE INTO cache_receipts"));
        if (allowed && receiptStatement) decision.cache_receipt_id = String(receiptStatement.args[0]);
        state.decisions.set(decisionKey, decision);
      }
      return [];
    }
  } as unknown as D1Database;

  return { env: createEnv({}, { DB: db }), state };
}

function scannerPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contractVersion: "1.1",
    requestId: "req_1",
    userId: "user_1",
    chatId: "42",
    ticker: "NVDA",
    reportType: "regular",
    generationVersion: "gen-v1",
    cacheStatus: "miss",
    cacheCreatedAt: null,
    cacheGenerationVersion: null,
    forceRefresh: false,
    language: "ru",
    ...overrides
  };
}

function createCacheCommitEnv(options: { expired?: boolean } = {}) {
  const state = {
    status: "pending",
    resultDigest: null as string | null,
    cacheEntry: null as { id: string; user_id: string; expires_at: string; result_digest: string } | null
  };
  const db = {
    prepare(query: string) {
      const statement = {
        query,
        args: [] as unknown[],
        bind(...args: unknown[]) { statement.args = args; return statement; },
        async first<T>() {
          if (query.includes("FROM cache_receipts r")) return {
            id: "receipt_1",
            request_id: "req_1",
            ticker: "NVDA",
            user_id: "user_1",
            report_type: "regular",
            generation_version: "gen-v1",
            language: "ru",
            cache_ttl_minutes: 60,
            status: state.status,
            result_digest: state.resultDigest,
            commit_expires_at: options.expired ? "2000-01-01T00:00:00.000Z" : "2999-01-01T00:00:00.000Z",
            cache_entry_id: state.cacheEntry?.id ?? null,
            cache_entry_expires_at: state.cacheEntry?.expires_at ?? null
          } as T;
          if (query.includes("FROM core_cache_entries WHERE receipt_id")) return state.cacheEntry as T;
          return null as T;
        },
        async run() {
          if (query.includes("SET status = 'expired'")) state.status = "expired";
          return { success: true, meta: { changes: 1 } };
        }
      };
      return statement;
    },
    async batch(statements: Array<{ query?: string; args?: unknown[] }>) {
      const update = statements.find((statement) => statement.query?.includes("status = 'committing'"));
      const insert = statements.find((statement) => statement.query?.includes("INSERT OR IGNORE INTO core_cache_entries"));
      if (state.status === "pending" && update && insert) {
        state.status = "committed";
        state.resultDigest = String(update.args?.[0]);
        state.cacheEntry = { id: String(insert.args?.[0]), user_id: "user_1", expires_at: String(insert.args?.[2]), result_digest: state.resultDigest };
      }
      return [];
    }
  } as unknown as D1Database;
  return { env: createEnv({}, { DB: db }), state };
}

function cacheCommitPayload(overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: "1.1",
    cacheReceiptId: "receipt_1",
    requestId: "req_1",
    ticker: "NVDA",
    reportType: "regular",
    generationVersion: "gen-v1",
    language: "ru",
    resultDigest: "a".repeat(64),
    ...overrides
  };
}

describe("internal access", () => {
  it("allows active linked users before current_period_end", async () => {
    const env = createEnv({
      first(query) {
        if (query.includes("FROM users WHERE telegram_user_id")) return { id: "user_1", telegram_user_id: "42" };
        if (query.includes("FROM subscriptions")) return { status: "active", current_period_end: "2999-01-01T00:00:00Z" };
        if (query.includes("FROM user_country_links")) return { country: "IL", bot_url: "https://t.me/Israel_News_Ticker_Scanner_bot", is_active: 1 };
        if (query.includes("FROM bot_routes")) return { bot_url: "https://t.me/Israel_News_Ticker_Scanner_bot" };
        return null;
      }
    });

    const response = await internalAccess(new URL("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he"), env);
    await expect(response.json()).resolves.toMatchObject({
      allowed: true,
      reason: null,
      userId: "user_1",
      subscriptionStatus: "active",
      botUrl: "https://t.me/Israel_News_Ticker_Scanner_bot"
    });
  });

  it("blocks active users after current_period_end", async () => {
    const env = createEnv({
      first(query) {
        if (query.includes("FROM users WHERE telegram_user_id")) return { id: "user_1", telegram_user_id: "42" };
        if (query.includes("FROM subscriptions")) return { status: "active", current_period_end: "2000-01-01T00:00:00Z" };
        if (query.includes("FROM user_country_links")) return { country: "IL", bot_url: "https://t.me/Israel_News_Ticker_Scanner_bot", is_active: 1 };
        return null;
      }
    });

    const payload = await (await internalAccess(new URL("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he"), env)).json();
    expect(payload).toMatchObject({ allowed: false, reason: "subscription_period_expired", botUrl: null });
  });

  it("blocks linked users without a subscription", async () => {
    const env = createEnv({
      first(query) {
        if (query.includes("FROM users WHERE telegram_user_id")) return { id: "user_1", telegram_user_id: "42" };
        if (query.includes("FROM user_country_links")) return { country: "IL", bot_url: "https://t.me/Israel_News_Ticker_Scanner_bot", is_active: 1 };
        return null;
      }
    });

    const payload = await (await internalAccess(new URL("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he"), env)).json();
    expect(payload).toMatchObject({
      allowed: false,
      reason: "active_subscription_required",
      subscriptionStatus: null,
      botUrl: null
    });
  });
});

describe("subscription access helper", () => {
  it("uses currentPeriodEnd in addition to status", () => {
    expect(isSubscriptionCurrentlyAllowed({ status: "active", currentPeriodEnd: "2999-01-01T00:00:00Z" })).toBe(true);
    expect(isSubscriptionCurrentlyAllowed({ status: "active", currentPeriodEnd: "2000-01-01T00:00:00Z" })).toBe(false);
    expect(isSubscriptionCurrentlyAllowed({ status: "canceled", currentPeriodEnd: "2999-01-01T00:00:00Z" })).toBe(false);
  });
});

describe("scanner access quota", () => {
  it("allows an active subscriber and charges the server-owned quota cost", async () => {
    const { env, state } = createQuotaEnv({ usedCredits: 20, quotaLimitCredits: 200 });
    const response = await scannerAccessCheck(JSON.stringify(scannerPayload()), env);

    await expect(response.json()).resolves.toMatchObject({
      contractVersion: "1.1",
      requestId: "req_1",
      allowed: true,
      chargeUnits: 1,
      quotaDecision: "new_regular",
      cacheStatus: "miss",
      remainingUnits: 89,
      reason: null
    });
    expect(state.decisions.get("req_1:NVDA")).toMatchObject({
      request_id: "req_1",
      ticker: "NVDA",
      user_id: "user_1",
      subscription_id: "sub_1",
      report_type: "regular",
      generation_version: "gen-v1",
      quota_decision: "new_regular",
      cache_entry_id: null,
      cache_receipt_id: expect.any(String)
    });
    expect(state.usedCredits).toBe(22);
  });

  it("does not accept forged cache fields to reduce the server-owned cost", async () => {
    const { env, state } = createQuotaEnv({ usedCredits: 20, quotaLimitCredits: 200 });
    const response = await scannerAccessCheck(JSON.stringify(scannerPayload({
      cacheStatus: "hit",
      cacheCreatedAt: new Date().toISOString(),
      cacheGenerationVersion: "forged-old-generation",
      generationVersion: "current-generation"
    })), env);

    await expect(response.json()).resolves.toMatchObject({
      contractVersion: "1.1",
      allowed: true,
      chargeUnits: 1,
      quotaDecision: "new_regular",
      cacheStatus: "miss",
      reportSource: "new_analysis",
      remainingUnits: 89
    });
    expect(state.usedCredits).toBe(22);
  });

  it("enforces the core-owned cache expiry boundary", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T12:00:00.000Z"));
    try {
      for (const [offsetMinutes, expectedStatus, expectedCharge] of [
        [1, "hit", 0.5],
        [0, "hit", 0.5],
        [-1, "miss", 1]
      ] as const) {
        const expiresAt = new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString();
        const { env, state } = createQuotaEnv({
          cacheEntries: [{
            id: `cache-expiry-${offsetMinutes}`,
            userId: "cache_owner",
            ticker: "NVDA",
            reportType: "regular",
            generationVersion: "gen-v1",
            language: "ru",
            expiresAt
          }]
        });
        const response = await scannerAccessCheck(JSON.stringify(scannerPayload({
          requestId: `req-cache-expiry-${offsetMinutes}`,
          cacheStatus: "miss"
        })), env);

        await expect(response.json()).resolves.toMatchObject({
          allowed: true,
          chargeUnits: expectedCharge,
          quotaDecision: expectedStatus === "hit" ? "cached_regular" : "new_regular",
          cacheStatus: expectedStatus
        });
        expect(state.usedCredits).toBe(expectedCharge * 2);
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("charges refresh at the full server-owned price even with valid cache metadata", async () => {
    const { env, state } = createQuotaEnv();
    const response = await scannerAccessCheck(JSON.stringify(scannerPayload({
      cacheStatus: "hit",
      cacheCreatedAt: new Date().toISOString(),
      cacheGenerationVersion: "gen-v1",
      forceRefresh: true
    })), env);

    await expect(response.json()).resolves.toMatchObject({
      allowed: true,
      chargeUnits: 1,
      quotaDecision: "refresh_regular",
      cacheStatus: "bypass",
      reportSource: "new_analysis"
    });
    expect(state.usedCredits).toBe(2);
  });

  it("replays exact duplicate regular requestId+ticker decisions as the stored response", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T12:00:00.000Z"));
    try {
      const scenarios = [
        { id: "new", extra: {}, decision: "new_regular", chargeUnits: 1, credits: 2, cache: false },
        {
          id: "cached",
          extra: { cacheStatus: "miss" },
          decision: "cached_regular",
          chargeUnits: 0.5,
          credits: 1,
          cache: true
        },
        { id: "refresh", extra: { forceRefresh: true }, decision: "refresh_regular", chargeUnits: 1, credits: 2, cache: true }
      ];
      for (const scenario of scenarios) {
        const { env, state } = createQuotaEnv({
          cacheEntries: scenario.cache ? [{
            id: `cache-regular-${scenario.id}`,
            userId: "cache_owner",
            ticker: "NVDA",
            reportType: "regular",
            generationVersion: "gen-v1",
            language: "ru",
            expiresAt: "2026-06-30T13:00:00.000Z"
          }] : undefined
        });
        const body = JSON.stringify(scannerPayload({ requestId: `regular-${scenario.id}`, ...scenario.extra }));
        const firstResponse = await scannerAccessCheck(body, env);
        const first = await firstResponse.json() as Record<string, unknown>;
        const repeatResponse = await scannerAccessCheck(body, env);
        const repeat = await repeatResponse.json();

        expect(firstResponse.status).toBe(200);
        expect(first).toMatchObject({ allowed: true, quotaDecision: scenario.decision, chargeUnits: scenario.chargeUnits });
        expect(typeof first.cacheReceiptId === "string").toBe(scenario.decision !== "cached_regular");
        expect(repeatResponse.status).toBe(200);
        expect(repeat).toMatchObject({ allowed: true, quotaDecision: scenario.decision, chargeUnits: scenario.chargeUnits });
        expect((repeat as Record<string, unknown>).cacheReceiptId).toBe(first.cacheReceiptId);
        expect(state.usedCredits).toBe(scenario.credits);
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("replays exact duplicate FundRep requestId+ticker decisions as the stored response", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T12:00:00.000Z"));
    try {
      const scenarios = [
        { id: "new", extra: {}, decision: "new_fundrep", chargeUnits: 3, credits: 6, cache: false },
        {
          id: "cached",
          extra: { cacheStatus: "miss" },
          decision: "cached_fundrep",
          chargeUnits: 1.5,
          credits: 3,
          cache: true
        },
        { id: "refresh", extra: { forceRefresh: true }, decision: "refresh_fundrep", chargeUnits: 3, credits: 6, cache: true }
      ];
      for (const scenario of scenarios) {
        const { env, state } = createQuotaEnv({
          cacheEntries: scenario.cache ? [{
            id: `cache-fundrep-${scenario.id}`,
            userId: "cache_owner",
            ticker: "NVDA",
            reportType: "fundrep",
            generationVersion: "gen-v1",
            language: "ru",
            expiresAt: "2026-06-30T13:00:00.000Z"
          }] : undefined
        });
        const body = JSON.stringify(scannerPayload({ requestId: `fundrep-${scenario.id}`, reportType: "fundrep", ...scenario.extra }));
        const firstResponse = await scannerAccessCheck(body, env);
        const first = await firstResponse.json() as Record<string, unknown>;
        const repeatResponse = await scannerAccessCheck(body, env);
        const repeat = await repeatResponse.json();
        expect(firstResponse.status).toBe(200);
        expect(first).toMatchObject({ allowed: true, quotaDecision: scenario.decision, chargeUnits: scenario.chargeUnits });
        expect(typeof first.cacheReceiptId === "string").toBe(scenario.decision !== "cached_fundrep");
        expect(repeatResponse.status).toBe(200);
        expect(repeat).toMatchObject({ allowed: true, quotaDecision: scenario.decision, chargeUnits: scenario.chargeUnits });
        expect((repeat as Record<string, unknown>).cacheReceiptId).toBe(first.cacheReceiptId);
        expect(state.usedCredits).toBe(scenario.credits);
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("blocks when the report cost exceeds remaining quota", async () => {
    const { env, state } = createQuotaEnv({ usedCredits: 196, quotaLimitCredits: 200 });
    const response = await scannerAccessCheck(JSON.stringify(scannerPayload({ reportType: "fundrep" })), env);

    await expect(response.json()).resolves.toMatchObject({
      allowed: false,
      chargeUnits: 0,
      quotaDecision: "rejected_no_quota",
      remainingUnits: 2,
      reason: "quota_exceeded"
    });
    expect(state.usedCredits).toBe(196);
  });

  it("fails closed with 503 when the server quota policy is unavailable", async () => {
    const { env, state } = createQuotaEnv({ policyExists: false });
    const response = await scannerAccessCheck(JSON.stringify(scannerPayload()), env);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      allowed: false,
      chargeUnits: 0,
      quotaDecision: "rejected_no_access",
      reason: "internal_access_unavailable"
    });
    expect(state.usedCredits).toBe(0);
    expect(state.batchCalls).toBe(0);
  });

  it("replays a no-quota rejection without charging or converting it to own-repeat", async () => {
    const { env, state } = createQuotaEnv({ usedCredits: 200, quotaLimitCredits: 200 });
    const body = JSON.stringify(scannerPayload({ requestId: "req-no-quota-repeat" }));
    const first = await (await scannerAccessCheck(body, env)).json();
    const repeat = await (await scannerAccessCheck(body, env)).json();

    expect(first).toMatchObject({ allowed: false, quotaDecision: "rejected_no_quota", chargeUnits: 0 });
    expect(repeat).toMatchObject({ allowed: false, quotaDecision: "rejected_no_quota", chargeUnits: 0 });
    expect(state.usedCredits).toBe(200);
    expect(state.batchCalls).toBe(1);
  });

  it("fails closed when the subscription period has expired", async () => {
    const { env, state } = createQuotaEnv({ currentPeriodEnd: "2000-01-01T00:00:00Z" });
    const response = await scannerAccessCheck(JSON.stringify(scannerPayload()), env);

    await expect(response.json()).resolves.toMatchObject({
      allowed: false,
      quotaDecision: "rejected_no_access",
      reason: "subscription_period_expired"
    });
    expect(state.usedCredits).toBe(0);
    expect(state.batchCalls).toBe(0);
  });

  it("replays the stored requestId decision without charging twice", async () => {
    const { env, state } = createQuotaEnv();
    const body = JSON.stringify(scannerPayload());
    const first = await (await scannerAccessCheck(body, env)).json();
    const replay = await (await scannerAccessCheck(body, env)).json();

    expect(first).toMatchObject({ chargeUnits: 1, quotaDecision: "new_regular" });
    expect(replay).toMatchObject({ chargeUnits: 1, quotaDecision: "new_regular", reportSource: "new_analysis" });
    expect((replay as Record<string, unknown>).cacheReceiptId).toBe((first as Record<string, unknown>).cacheReceiptId);
    expect(state.usedCredits).toBe(2);
    expect(state.batchCalls).toBe(1);
  });

  it("returns own_repeat for a new requestId from the owner of a fresh committed regular cache entry", async () => {
    const { env, state } = createQuotaEnv({
      usedCredits: 20,
      cacheEntries: [{
        id: "cache_owned_regular",
        userId: "user_1",
        ticker: "NVDA",
        reportType: "regular",
        generationVersion: "gen-v1",
        language: "ru",
        expiresAt: "2999-01-01T00:00:00.000Z"
      }]
    });

    const response = await scannerAccessCheck(JSON.stringify(scannerPayload({ requestId: "req-owner-repeat" })), env);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      allowed: true,
      chargeUnits: 0,
      quotaDecision: "own_repeat",
      cacheStatus: "hit",
      reportSource: "own_repeat",
      cacheReceiptId: null,
      cacheEntryId: "cache_owned_regular"
    });
    expect(state.usedCredits).toBe(20);
    expect(state.decisions.get("req-owner-repeat:NVDA")).toMatchObject({
      quota_decision: "own_repeat",
      cache_entry_id: "cache_owned_regular"
    });
  });

  it("returns cached_regular at cached price for a new requestId from another user", async () => {
    const { env, state } = createQuotaEnv({
      usedCredits: 20,
      users: {
        user_2: { status: "active", subscriptionId: "sub_2", plan: "starter" }
      },
      cacheEntries: [{
        id: "cache_other_regular",
        userId: "user_1",
        ticker: "NVDA",
        reportType: "regular",
        generationVersion: "gen-v1",
        language: "ru",
        expiresAt: "2999-01-01T00:00:00.000Z"
      }]
    });

    const response = await scannerAccessCheck(JSON.stringify(scannerPayload({
      requestId: "req-other-user-cache",
      userId: "user_2"
    })), env);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      allowed: true,
      chargeUnits: 0.5,
      quotaDecision: "cached_regular",
      cacheStatus: "hit",
      reportSource: "cache",
      cacheReceiptId: null,
      cacheEntryId: "cache_other_regular"
    });
    expect(state.usedCredits).toBe(21);
    expect(state.decisions.get("req-other-user-cache:NVDA")).toMatchObject({
      quota_decision: "cached_regular",
      cache_entry_id: "cache_other_regular"
    });
  });

  it("allows one requestId to contain multiple tickers with independent charges", async () => {
    const { env, state } = createQuotaEnv();
    await scannerAccessCheck(JSON.stringify(scannerPayload()), env);
    const response = await scannerAccessCheck(JSON.stringify(scannerPayload({ ticker: "AAPL" })), env);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ allowed: true, quotaDecision: "new_regular" });
    expect(state.usedCredits).toBe(4);
    expect(state.decisions.size).toBe(2);
  });

  it("rejects changed immutable fields for the same requestId and ticker", async () => {
    const { env, state } = createQuotaEnv();
    await scannerAccessCheck(JSON.stringify(scannerPayload()), env);
    const response = await scannerAccessCheck(JSON.stringify(scannerPayload({ generationVersion: "gen-v2" })), env);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ allowed: false, reason: "invalid_request" });
    expect(state.usedCredits).toBe(2);
  });

  it("rejects invalid payloads and unsupported contract versions", async () => {
    const { env } = createQuotaEnv();
    const invalidVersion = await scannerAccessCheck(JSON.stringify(scannerPayload({ contractVersion: "2.0" })), env);
    const oldVersion = await scannerAccessCheck(JSON.stringify(scannerPayload({ contractVersion: "1.0" })), env);
    const invalidReport = await scannerAccessCheck(JSON.stringify(scannerPayload({ reportType: "premium" })), env);

    expect(invalidVersion.status).toBe(400);
    await expect(invalidVersion.json()).resolves.toMatchObject({ reason: "invalid_contract_version" });
    expect(oldVersion.status).toBe(400);
    await expect(oldVersion.json()).resolves.toMatchObject({ contractVersion: "1.1", reason: "invalid_contract_version" });
    expect(invalidReport.status).toBe(400);
    await expect(invalidReport.json()).resolves.toMatchObject({ reason: "unsupported_report_type" });
  });
});

describe("core-owned cache receipt commit", () => {
  it("commits once with server-owned expiry and safely replays the same digest", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-01T12:00:00.000Z"));
    try {
      const { env, state } = createCacheCommitEnv();
      const body = JSON.stringify(cacheCommitPayload());
      const first = await commitScannerCache(body, env);
      const replay = await commitScannerCache(body, env);

      expect(first.status).toBe(200);
      const firstPayload = await first.json();
      await expect(replay.json()).resolves.toEqual(firstPayload);
      expect(firstPayload).toMatchObject({ contractVersion: "1.1", committed: true, expiresAt: "2026-07-01T13:00:00.000Z" });
      expect(state.status).toBe("committed");
      expect(state.cacheEntry).toMatchObject({
        user_id: "user_1",
        result_digest: "a".repeat(64)
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects immutable field mismatch and a second digest", async () => {
    const { env } = createCacheCommitEnv();
    const mismatch = await commitScannerCache(JSON.stringify(cacheCommitPayload({ ticker: "AAPL" })), env);
    expect(mismatch.status).toBe(400);
    await expect(mismatch.json()).resolves.toMatchObject({ error: "cache_receipt_mismatch" });

    await commitScannerCache(JSON.stringify(cacheCommitPayload()), env);
    const reused = await commitScannerCache(JSON.stringify(cacheCommitPayload({ resultDigest: "b".repeat(64) })), env);
    expect(reused.status).toBe(409);
    await expect(reused.json()).resolves.toMatchObject({ error: "cache_receipt_already_used" });
  });

  it("expires an uncommitted receipt without creating a cache entry", async () => {
    const { env, state } = createCacheCommitEnv({ expired: true });
    const response = await commitScannerCache(JSON.stringify(cacheCommitPayload()), env);

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({ error: "cache_receipt_expired" });
    expect(state.status).toBe("expired");
    expect(state.cacheEntry).toBeNull();
  });
});

describe("internal Telegram delivery", () => {
  const payload = (overrides: Record<string, unknown> = {}) => ({
    contractVersion: "1.0",
    requestId: "request_1",
    deliveryId: "delivery_1",
    recipient: { type: "user", userId: "user_1", country: "IL", language: "he" },
    content: { kind: "news_signal", text: "Market update", ticker: "LUMI.TA", reportType: "regular" },
    ...overrides
  });

  function deliveryEnv(options: { linked?: boolean } = {}) {
    let ledger: Record<string, unknown> | null = null;
    const env = createEnv({
      first(query) {
        if (query.includes("FROM internal_deliveries")) return ledger;
        if (query.includes("SELECT id, telegram_user_id")) return { id: "user_1", telegram_user_id: "42", status: "active" };
        if (query.includes("FROM user_country_links")) return options.linked === false ? null : { country: "IL", bot_url: "https://t.me/Israel_News_Ticker_Scanner_bot", is_active: 1 };
        if (query.includes("FROM subscriptions")) return { status: "active", current_period_end: "2999-01-01T00:00:00Z" };
        return null;
      },
      run(query, args) {
        if (query.includes("INSERT OR IGNORE INTO internal_deliveries") && !ledger) {
          ledger = {
            delivery_id: args[0], request_id: args[1], payload_hash: args[2], status: "pending",
            telegram_message_id: null, failure_reason: null, sent_at: null
          };
        } else if (query.includes("status = 'sending'") && ledger && ["pending", "failed"].includes(String(ledger.status))) {
          ledger.status = "sending";
          return 1;
        } else if (query.includes("status = 'sent'") && ledger) {
          ledger.status = "sent";
          ledger.telegram_message_id = args[0];
          ledger.sent_at = "2026-07-02T00:00:00Z";
        } else if (query.includes("status = 'access_denied'") && ledger) {
          ledger.status = "access_denied";
          ledger.failure_reason = args[0];
        } else if (query.includes("SET status = ?") && ledger) {
          ledger.status = args[0];
          ledger.failure_reason = args[1];
        }
        return 1;
      }
    }, { TELEGRAM_BOT_TOKEN: "telegram-token" });
    return { env, getLedger: () => ledger };
  }

  it("sends once and returns duplicate without a second Telegram call", async () => {
    const fixture = deliveryEnv();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 99 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const body = JSON.stringify(payload());
    const request = new Request("https://example.test/api/internal/deliver", { method: "POST", body });

    const first = await internalDeliver(request, body, fixture.env, testExecutionContext());
    const duplicate = await internalDeliver(request, body, fixture.env, testExecutionContext());

    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({ status: "sent", telegramMessageId: "99" });
    await expect(duplicate.json()).resolves.toMatchObject({ status: "duplicate", telegramMessageId: "99" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("rechecks access and rejects raw destination fields", async () => {
    const fixture = deliveryEnv({ linked: false });
    const deniedBody = JSON.stringify(payload());
    const denied = await internalDeliver(new Request("https://example.test/api/internal/deliver", { method: "POST", body: deniedBody }), deniedBody, fixture.env, testExecutionContext());
    await expect(denied.json()).resolves.toMatchObject({ status: "access_denied", reason: "country_not_linked" });

    const injected = payload({ recipient: { type: "user", userId: "user_1", country: "IL", language: "he", chatId: "attacker" } });
    const invalid = await internalDeliver(new Request("https://example.test/api/internal/deliver", { method: "POST" }), JSON.stringify(injected), fixture.env, testExecutionContext());
    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toMatchObject({ error: "invalid_delivery_recipient" });

    const unsupportedKind = payload({ content: { kind: "raw_html", text: "message", ticker: null, reportType: null } });
    const invalidKind = await internalDeliver(new Request("https://example.test/api/internal/deliver", { method: "POST" }), JSON.stringify(unsupportedKind), fixture.env, testExecutionContext());
    expect(invalidKind.status).toBe(400);
    await expect(invalidKind.json()).resolves.toMatchObject({ error: "invalid_delivery_content" });
  });

  it("retries an explicit Telegram rejection but blocks an indeterminate outcome", async () => {
    const retryFixture = deliveryEnv();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error_code: 400, description: "Bad Request: chat not found @secret_channel" }), { status: 400 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, result: { message_id: 100 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const body = JSON.stringify(payload());
    const request = new Request("https://example.test/api/internal/deliver", { method: "POST", body });

    const failed = await internalDeliver(request, body, retryFixture.env, testExecutionContext());
    expect(failed.status).toBe(503);
    await expect(failed.json()).resolves.toMatchObject({ reason: "telegram_delivery_rejected:400:Bad Request: chat not found @[redacted]", retryable: true });
    const retried = await internalDeliver(request, body, retryFixture.env, testExecutionContext());
    await expect(retried.json()).resolves.toMatchObject({ status: "sent", telegramMessageId: "100" });

    const uncertainFixture = deliveryEnv();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network lost")));
    const uncertain = await internalDeliver(request, body, uncertainFixture.env, testExecutionContext());
    await expect(uncertain.json()).resolves.toMatchObject({ reason: "telegram_delivery_indeterminate", retryable: false });
    const blocked = await internalDeliver(request, body, uncertainFixture.env, testExecutionContext());
    expect(blocked.status).toBe(409);
    await expect(blocked.json()).resolves.toMatchObject({ error: "delivery_state_indeterminate", retryable: false });
    vi.unstubAllGlobals();
  });
});

describe("subscription signature", () => {
  it("accepts valid signed webhook payloads", async () => {
    const rawBody = JSON.stringify({ userId: "user_1", status: "active" });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = "webhook-secret";
    const signature = await testHmacHex(secret, `${timestamp}.${rawBody}`);
    const request = new Request("https://example.test/api/subscriptions", {
      method: "POST",
      headers: { "X-Timestamp": timestamp, "X-Signature": `sha256=${signature}` },
      body: rawBody
    });

    await expect(requireWebhookSignature(request, createEnv({}, { SUBSCRIPTION_WEBHOOK_SECRET: secret }), rawBody)).resolves.toBeNull();
  });

  it("accepts website subscription events through scoped internal HMAC", async () => {
    const rawBody = JSON.stringify({ userId: "user_1", status: "active", plan: "beta", provider: "website" });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const keyId = "website-dev-v1";
    const requestId = "site-subscription-1";
    const secret = "website-secret-with-at-least-32-bytes";
    const bodyHash = await testSha256(rawBody);
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.POST./api/internal/subscriptions..${bodyHash}`);
    let subscriptionWritten = false;
    const env = createEnv({
      first(query) {
        if (query.includes("FROM users WHERE id")) return {
          id: "user_1",
          telegram_user_id: null,
          email: "site@example.com",
          email_verified_at: "2026-01-01T00:00:00Z",
          pending_email: null,
          display_name: null,
          language: "en",
          country: "IL",
          selected_bot_url: null,
          status: "active",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          last_seen_at: null
        };
        if (query.includes("FROM subscriptions")) return { status: "active", current_period_end: null };
        if (query.includes("FROM bot_routes")) return { bot_url: "https://t.me/site_bot" };
        return null;
      },
      all(query) {
        if (query.includes("FROM user_country_links")) return [];
        return [];
      },
      run(query) {
        if (query.includes("INSERT INTO subscriptions")) subscriptionWritten = true;
        if (query.includes("INSERT OR IGNORE INTO internal_request_nonces")) return 1;
      }
    }, {
      INTERNAL_API_SECRET_WEBSITE_DEV_V1: secret,
      INTERNAL_API_SCOPES_JSON: JSON.stringify({ [keyId]: ["website:subscriptions"] })
    });

    const response = await worker.fetch(new Request("https://example.test/api/internal/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Key-Id": keyId,
        "X-Request-Id": requestId,
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      },
      body: rawBody
    }), env, testExecutionContext());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ userId: "user_1", status: "active" });
    expect(subscriptionWritten).toBe(true);
  });

  it("replays provider subscription events without inserting a duplicate subscription", async () => {
    const rawBody = JSON.stringify({ userId: "user_1", status: "active", plan: "pro", provider: "website", externalId: "evt_1" });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = "webhook-secret";
    const signature = await testHmacHex(secret, `${timestamp}.${rawBody}`);
    let inserted = false;
    let updated = false;
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return null;
        if (query.includes("SELECT id FROM subscriptions WHERE provider")) return { id: "sub_existing" };
        if (query.includes("FROM users WHERE id")) return { id: "user_1", country: "IL" };
        if (query.includes("FROM subscriptions")) return { status: "active", current_period_end: "2999-01-01T00:00:00Z" };
        return null;
      },
      all(query) {
        if (query.includes("FROM user_country_links")) return [];
        return [];
      },
      run(query) {
        if (query.includes("INSERT INTO subscriptions")) inserted = true;
        if (query.includes("UPDATE subscriptions")) updated = true;
      }
    }, { SUBSCRIPTION_WEBHOOK_SECRET: secret });

    const response = await worker.fetch(new Request("https://example.test/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      },
      body: rawBody
    }), env, testExecutionContext());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ subscriptionId: "sub_existing", replayed: true });
    expect(inserted).toBe(false);
    expect(updated).toBe(true);
  });

  it("does not attach a subscription using an unverified email-only identity", async () => {
    const rawBody = JSON.stringify({ email: "victim@example.com", status: "active", plan: "pro" });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = "webhook-secret";
    const signature = await testHmacHex(secret, `${timestamp}.${rawBody}`);
    let subscriptionWritten = false;
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return null;
        return null;
      },
      run(query) {
        if (query.includes("INSERT INTO subscriptions")) subscriptionWritten = true;
      }
    }, { SUBSCRIPTION_WEBHOOK_SECRET: secret });

    const response = await worker.fetch(new Request("https://example.test/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      },
      body: rawBody
    }), env, testExecutionContext());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: "verified_user_required", emailVerificationRequired: true });
    expect(subscriptionWritten).toBe(false);
  });
});

describe("verified email identity", () => {
  it("does not find or issue a session for email-only registration", async () => {
    let emailLookup = false;
    let sessionCreated = false;
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return null;
        if (query.includes("FROM users WHERE email")) emailLookup = true;
        return null;
      },
      run(query) {
        if (query.includes("INSERT INTO user_sessions")) sessionCreated = true;
      }
    });

    const response = await worker.fetch(new Request("https://example.test/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "victim@example.com", countries: ["IL"], language: "he" })
    }), env, testExecutionContext());

    expect(response.status).toBe(403);
    expect(response.headers.get("Set-Cookie")).toBeNull();
    await expect(response.json()).resolves.toMatchObject({
      error: "email_verification_required",
      emailVerificationRequired: true,
      accountCreated: false
    });
    expect(emailLookup).toBe(false);
    expect(sessionCreated).toBe(false);
  });
});

describe("email verification and beta plan", () => {
  it("sends a one-time link and creates a verified beta account", async () => {
    let verification: Record<string, unknown> | null = null;
    let createdUserId: string | null = null;
    let betaCreated = false;
    let sessionCreated = false;
    let sentText = "";

    const db = {
      prepare(query: string) {
        const statement = {
          query,
          args: [] as unknown[],
          bind(...args: unknown[]) { statement.args = args; return statement; },
          async first<T>() {
            if (query.includes("FROM email_verifications WHERE token_hash")) return verification as T;
            if (query.includes("SELECT id FROM users WHERE email")) return null as T;
            if (query.includes("SELECT * FROM users WHERE id")) return null as T;
            if (query.includes("SELECT bot_url FROM bot_routes")) return { bot_url: "https://t.me/Israel_News_Ticker_Scanner_bot" } as T;
            if (query.includes("FROM subscriptions")) return null as T;
            return null as T;
          },
          async all<T>() { return { results: [] as T[] }; },
          async run() {
            if (query.includes("UPDATE email_verifications SET consumed_at")) {
              if (!verification || verification.consumed_at) return { success: true, meta: { changes: 0 } };
              verification.consumed_at = "2026-07-02T00:00:00Z";
              return { success: true, meta: { changes: 1 } };
            }
            if (query.includes("INSERT INTO users")) createdUserId = String(statement.args[0]);
            if (query.includes("INSERT INTO subscriptions")) betaCreated = true;
            if (query.includes("INSERT INTO user_sessions")) sessionCreated = true;
            return { success: true, meta: { changes: 1 } };
          }
        };
        return statement;
      },
      async batch(statements: Array<{ query: string; args: unknown[] }>) {
        const insert = statements.find((item) => item.query.includes("INSERT INTO email_verifications"));
        if (insert) {
          verification = {
            id: insert.args[0], user_id: insert.args[1], email: insert.args[2], token_hash: insert.args[3],
            payload_json: insert.args[4], expires_at: insert.args[5], consumed_at: null
          };
        }
        return [];
      }
    } as unknown as D1Database;
    const env = createEnv({}, {
      DB: db,
      EMAIL_VERIFICATION_SECRET: "email-verification-secret-at-least-32-bytes",
      EMAIL_FROM: "verify@example.test",
      EMAIL: {
        async send(message: { text?: string }) {
          sentText = message.text ?? "";
          return { messageId: "email_1" };
        }
      } as unknown as SendEmail
    });

    const requestResponse = await requestEmailVerification(new Request("https://app.example.test/api/auth/email/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new.user@example.com", countries: ["IL"], language: "he" })
    }), env, testExecutionContext());
    expect(requestResponse.status).toBe(202);
    const link = sentText.match(/https:\/\/\S+/)?.[0];
    expect(link).toBeTruthy();
    const token = new URL(link!).searchParams.get("token");

    const verifyResponse = await verifyEmailToken(new Request("https://app.example.test/api/auth/email/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    }), env, testExecutionContext());

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.headers.get("Set-Cookie")).toContain("ms_session=");
    await expect(verifyResponse.json()).resolves.toMatchObject({ verified: true, plan: "beta" });
    expect(createdUserId).toBeTruthy();
    expect(betaCreated).toBe(true);
    expect(sessionCreated).toBe(true);
  });

  it("accepts only future ISO API-key expirations", () => {
    expect(parseFutureIsoTimestamp(undefined)).toEqual({ ok: true, value: null });
    expect(parseFutureIsoTimestamp("not-a-date")).toEqual({ ok: false });
    expect(parseFutureIsoTimestamp("2000-01-01T00:00:00Z")).toEqual({ ok: false });
    expect(parseFutureIsoTimestamp("2999-01-01T00:00:00Z")).toEqual({ ok: true, value: "2999-01-01T00:00:00.000Z" });
  });
});

describe("Telegram init data", () => {
  it("verifies signed Telegram WebApp init data", async () => {
    const botToken = "123:test-token";
    const authDate = Math.floor(Date.now() / 1000).toString();
    const user = JSON.stringify({ id: 42, first_name: "Alex", language_code: "he" });
    const params = new URLSearchParams({ auth_date: authDate, query_id: "q1", user });
    const dataCheckString = [...params.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${value}`).join("\n");
    const secretKey = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", new TextEncoder().encode("WebAppData"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      new TextEncoder().encode(botToken)
    );
    params.set("hash", await testHmacHex(secretKey, dataCheckString));

    await expect(verifyTelegramInitData(params.toString(), createEnv({}, { TELEGRAM_BOT_TOKEN: botToken }))).resolves.toMatchObject({ id: 42 });
  });

  it("blocks Telegram registration without signed init data when strict mode is enabled", async () => {
    const env = createEnv({});
    const response = await worker.fetch(new Request("https://example.test/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramUserId: "42", country: "IL", language: "he" })
    }), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "telegram_init_data_required" });
  });

  it("registers a Telegram WebApp user with valid signed init data", async () => {
    const botToken = "123:test-token";
    const authDate = Math.floor(Date.now() / 1000).toString();
    const user = JSON.stringify({ id: 42, first_name: "Alex", language_code: "he" });
    const params = new URLSearchParams({ auth_date: authDate, query_id: "q1", user });
    const dataCheckString = [...params.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${value}`).join("\n");
    const secretKey = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey("raw", new TextEncoder().encode("WebAppData"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
      new TextEncoder().encode(botToken)
    );
    params.set("hash", await testHmacHex(secretKey, dataCheckString));

    let insertedUserArgs: unknown[] = [];
    let insertedUserQuery = "";
    const env = createEnv({
      first(query, args) {
        if (query.includes("FROM rate_limits")) return null;
        if (query.includes("FROM users WHERE telegram_user_id")) return null;
        if (query.includes("FROM users WHERE email")) return null;
        if (query.includes("FROM bot_routes") && args[0] === "IL") return { bot_url: "https://t.me/Israel_News_Ticker_Scanner_bot" };
        if (query.includes("FROM subscriptions")) return null;
        return null;
      },
      run(query, args) {
        if (query.includes("INSERT INTO users")) {
          insertedUserQuery = query;
          insertedUserArgs = args;
        }
      }
    }, { TELEGRAM_BOT_TOKEN: botToken });

    const response = await worker.fetch(new Request("https://example.test/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: params.toString(), email: "alex@example.com", countries: ["IL"], language: "he" })
    }), env, testExecutionContext());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      botUrl: "https://t.me/Israel_News_Ticker_Scanner_bot",
      access: { allowed: false, reason: "active_subscription_required" },
      status: "active",
      identityProvider: "telegram",
      emailVerificationRequired: true
    });
    expect(insertedUserQuery).toContain("email, pending_email");
    expect(insertedUserQuery).toContain("VALUES (?, ?, NULL, ?");
    expect(insertedUserArgs).toContain("alex@example.com");
  });

  it("bootstraps a Core session from signed Telegram init data without trusting browser email or userId", async () => {
    const botToken = "123:test-token";
    const initData = await signedTelegramInitData(botToken, { id: 42, first_name: "Alex", language_code: "he" });
    let insertedUserArgs: unknown[] = [];
    let sessionCreated = false;
    const env = createEnv({
      first(query) {
        if (query.includes("FROM users WHERE telegram_user_id")) return null;
        if (query.includes("SELECT * FROM users WHERE id")) return {
          id: "created_user",
          telegram_user_id: "42",
          email: null,
          email_verified_at: null,
          pending_email: null,
          display_name: "Alex",
          language: "he",
          country: "IL",
          selected_bot_url: null,
          status: "active",
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-06-01T00:00:00Z",
          last_seen_at: null
        };
        return null;
      },
      all(query) {
        if (query.includes("FROM user_country_links")) return [];
        return [];
      },
      run(query, args) {
        if (query.includes("INSERT INTO users")) insertedUserArgs = args;
        if (query.includes("INSERT INTO user_sessions")) sessionCreated = true;
      }
    }, { TELEGRAM_BOT_TOKEN: botToken, DEFAULT_COUNTRY: "IL" });

    const response = await worker.fetch(new Request("https://example.test/api/session/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "telegram", initData, userId: "attacker", email: "attacker@example.com" })
    }), env, testExecutionContext());

    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toContain("ms_session=");
    await expect(response.json()).resolves.toMatchObject({ identityProvider: "telegram", csrfTokenRequired: true });
    expect(sessionCreated).toBe(true);
    expect(insertedUserArgs).toContain("42");
    expect(insertedUserArgs).not.toContain("attacker");
    expect(insertedUserArgs).not.toContain("attacker@example.com");
  });

  it("refreshes CSRF token using only a valid Core session cookie", async () => {
    const tokenHash = await testSha256("raw-token");
    const oldCsrfHash = await testSha256("old-csrf-token");
    let updatedCsrfHash = "";
    const env = createEnv({
      first(query) {
        if (query.includes("FROM user_sessions")) return {
          user_id: "user_1",
          token_hash: tokenHash,
          csrf_hash: oldCsrfHash,
          expires_at: "2999-01-01T00:00:00Z",
          id: "user_1",
          telegram_user_id: "42",
          email: "user@example.com",
          email_verified_at: "2026-06-01T00:00:00Z",
          pending_email: null,
          display_name: "User",
          language: "en",
          country: "IL",
          selected_bot_url: null,
          status: "active",
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-06-01T00:00:00Z",
          last_seen_at: null
        };
        return null;
      },
      run(query, args) {
        if (query.includes("UPDATE user_sessions SET csrf_hash")) updatedCsrfHash = String(args[0]);
      }
    });

    const response = await worker.fetch(new Request("https://example.test/api/session/csrf", {
      headers: { Cookie: "ms_session=session_1.raw-token" }
    }), env, testExecutionContext());
    const payload = await response.json() as { csrfToken: string };

    expect(response.status).toBe(200);
    expect(payload.csrfToken).toBeTruthy();
    expect(await testSha256(payload.csrfToken)).toBe(updatedCsrfHash);
  });
});

describe("Telegram private ticker requests", () => {
  const telegramUser = {
    id: "user_1",
    telegram_user_id: "42",
    email: "user@example.com",
    email_verified_at: "2026-06-01T00:00:00Z",
    pending_email: null,
    display_name: "User",
    language: "he",
    country: "IL",
    selected_bot_url: null,
    status: "active",
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
    last_seen_at: null
  };

  function telegramUpdate(text: string, chatType = "private") {
    return {
      update_id: 1,
      message: {
        chat: { id: 42, type: chatType },
        from: { id: 42, first_name: "User" },
        text
      }
    };
  }

  function privateTickerEnv(options: { plan?: string; currentPeriodEnd?: string | null; usedCredits?: number; quotaLimitCredits?: number } = {}) {
    const state = { analysisInserted: false };
    const env = createEnv({
      first(query) {
        if (query.includes("FROM users WHERE telegram_user_id")) return telegramUser;
        if (query.includes("FROM subscriptions")) return {
          id: "sub_1",
          plan: options.plan ?? "pro",
          status: "active",
          current_period_end: options.currentPeriodEnd === undefined ? "2999-01-01T00:00:00Z" : options.currentPeriodEnd
        };
        if (query.includes("FROM quota_balances")) return {
          quota_limit_credits: options.quotaLimitCredits ?? 50,
          used_credits: options.usedCredits ?? 0
        };
        return null;
      },
      run(query) {
        if (query.includes("INSERT INTO analysis_requests")) state.analysisInserted = true;
      }
    }, { TELEGRAM_BOT_TOKEN: "telegram-token" });
    return { env, state };
  }

  it("allows premium users to request private ticker analysis", async () => {
    const { env, state } = privateTickerEnv({ plan: "pro" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 })));

    const response = await worker.fetch(new Request("https://example.test/api/telegram/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramUpdate("NVDA"))
    }), env, testExecutionContext());

    expect(response.status).toBe(200);
    expect(state.analysisInserted).toBe(true);
    expect(vi.mocked(fetch)).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("blocks free or basic users from private ticker analysis while keeping channel access separate", async () => {
    const { env, state } = privateTickerEnv({ plan: "starter" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 })));

    await worker.fetch(new Request("https://example.test/api/telegram/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramUpdate("NVDA"))
    }), env, testExecutionContext());

    expect(state.analysisInserted).toBe(false);
    const sentBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body));
    expect(sentBody.text).toContain("premium plan");
    vi.unstubAllGlobals();
  });

  it("blocks private ticker analysis when quota is exhausted or subscription is expired", async () => {
    for (const scenario of [
      { env: privateTickerEnv({ plan: "pro", usedCredits: 50, quotaLimitCredits: 50 }), expected: "quota" },
      { env: privateTickerEnv({ plan: "pro", currentPeriodEnd: "2000-01-01T00:00:00Z" }), expected: "ended" }
    ]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 })));
      await worker.fetch(new Request("https://example.test/api/telegram/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramUpdate("NVDA"))
      }), scenario.env.env, testExecutionContext());

      expect(scenario.env.state.analysisInserted).toBe(false);
      const sentBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body));
      expect(sentBody.text.toLowerCase()).toContain(scenario.expected);
      vi.unstubAllGlobals();
    }
  });

  it("does not accept ticker requests from broadcast channels or groups", async () => {
    const { env, state } = privateTickerEnv({ plan: "pro" });
    vi.stubGlobal("fetch", vi.fn());

    await worker.fetch(new Request("https://example.test/api/telegram/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telegramUpdate("NVDA", "channel"))
    }), env, testExecutionContext());

    expect(state.analysisInserted).toBe(false);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("country links", () => {
  it("keeps only supported news countries", () => {
    expect(cleanCountries(["IL", "DE", "US"], null, "IL")).toEqual(["IL", "US"]);
  });

  it("builds country links with configured bot routes", async () => {
    const env = createEnv({
      first(query, args) {
        if (query.includes("FROM bot_routes") && args[0] === "US") return { bot_url: "https://t.me/US_News_Ticker_Scanner_RU_bot" };
        return null;
      }
    });

    await expect(buildCountryLinks(env, ["US"])).resolves.toEqual([{ country: "US", botUrl: "https://t.me/US_News_Ticker_Scanner_RU_bot", isActive: true }]);
  });
});

describe("SaaS account endpoints", () => {
  it("rejects a legacy email-only session without verified ownership", async () => {
    const tokenHash = await testSha256("raw-token");
    const csrfHash = await testSha256("csrf-token");
    let revoked = false;
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return null;
        if (query.includes("FROM user_sessions")) return {
          user_id: "user_1",
          token_hash: tokenHash,
          csrf_hash: csrfHash,
          expires_at: "2999-01-01T00:00:00Z",
          telegram_user_id: null,
          email: "victim@example.com",
          email_verified_at: null
        };
        return null;
      },
      run(query) {
        if (query.includes("SET revoked_at = CURRENT_TIMESTAMP")) revoked = true;
      }
    });

    const response = await worker.fetch(new Request("https://example.test/api/me", {
      headers: { Cookie: "ms_session=session_1.raw-token" }
    }), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "email_verification_required" });
    expect(revoked).toBe(true);
  });

  it("wires /api/me/api-keys to the api_keys table", async () => {
    const tokenHash = await testSha256("raw-token");
    const csrfHash = await testSha256("csrf-token");
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return null;
        if (query.includes("FROM user_sessions")) return {
          user_id: "user_1",
          token_hash: tokenHash,
          csrf_hash: csrfHash,
          expires_at: "2999-01-01T00:00:00Z",
          id: "user_1",
          telegram_user_id: null,
          email: "user@example.com",
          email_verified_at: "2026-06-01T00:00:00Z",
          display_name: "User",
          language: "en",
          country: "IL",
          selected_bot_url: null,
          status: "active",
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-06-01T00:00:00Z",
          last_seen_at: null
        };
        return null;
      },
      all(query) {
        if (query.includes("FROM api_keys")) {
          return [{
            id: "key_1",
            user_id: "user_1",
            name: "Default key",
            key_prefix: "msk_live_test",
            scopes_json: "[\"analysis:read\"]",
            last_used_at: null,
            expires_at: null,
            is_active: 1,
            created_at: "2026-06-01T00:00:00Z",
            updated_at: "2026-06-01T00:00:00Z"
          }];
        }
        return [];
      }
    });

    const response = await worker.fetch(new Request("https://example.test/api/me/api-keys?userId=attacker", {
      headers: { Cookie: "ms_session=session_1.raw-token" }
    }), env, testExecutionContext());
    await expect(response.json()).resolves.toMatchObject({
      userId: "user_1",
      apiKeys: [{ id: "key_1", keyPrefix: "msk_live_test", scopes: ["analysis:read"], isActive: true }]
    });
  });

  it("wires /api/me/analysis-history to the analysis_requests table", async () => {
    const tokenHash = await testSha256("raw-token");
    const csrfHash = await testSha256("csrf-token");
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return null;
        if (query.includes("FROM user_sessions")) return {
          user_id: "user_1",
          token_hash: tokenHash,
          csrf_hash: csrfHash,
          expires_at: "2999-01-01T00:00:00Z",
          id: "user_1",
          telegram_user_id: null,
          email: "user@example.com",
          email_verified_at: "2026-06-01T00:00:00Z",
          display_name: "User",
          language: "en",
          country: "IL",
          selected_bot_url: null,
          status: "active",
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-06-01T00:00:00Z",
          last_seen_at: null
        };
        return null;
      },
      all(query) {
        if (query.includes("FROM analysis_requests")) {
          return [{
            id: "analysis_1",
            request_id: "req_1",
            source: "telegram_company_matcher_app",
            country: "IL",
            language: "he",
            status: "processed",
            tickers_json: "[\"LUMI.TA\"]",
            response_json: "{\"status\":\"processed\"}",
            created_at: "2026-06-01T00:00:00Z",
            updated_at: "2026-06-01T00:00:00Z"
          }];
        }
        return [];
      }
    });

    const response = await worker.fetch(new Request("https://example.test/api/me/analysis-history?userId=attacker"), env, testExecutionContext());
    await expect(response.json()).resolves.toMatchObject({
      error: "authenticated_session_required"
    });

    const authedResponse = await worker.fetch(new Request("https://example.test/api/me/analysis-history?userId=attacker", {
      headers: { Cookie: "ms_session=session_1.raw-token" }
    }), env, testExecutionContext());
    await expect(authedResponse.json()).resolves.toMatchObject({
      userId: "user_1",
      analysisHistory: [{ id: "analysis_1", requestId: "req_1", tickers: ["LUMI.TA"], status: "processed" }]
    });
  });

  it("returns a website-safe subscription summary with entitlements and quota", async () => {
    const tokenHash = await testSha256("raw-token");
    const csrfHash = await testSha256("csrf-token");
    const env = createEnv({
      first(query) {
        if (query.includes("FROM user_sessions")) return {
          user_id: "user_1",
          token_hash: tokenHash,
          csrf_hash: csrfHash,
          expires_at: "2999-01-01T00:00:00Z",
          id: "user_1",
          telegram_user_id: "42",
          email: "user@example.com",
          email_verified_at: "2026-06-01T00:00:00Z",
          display_name: "User",
          language: "en",
          country: "IL",
          selected_bot_url: null,
          status: "active",
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-06-01T00:00:00Z",
          last_seen_at: null
        };
        if (query.includes("SELECT status, current_period_end")) return { status: "active", current_period_end: "2999-01-01T00:00:00Z" };
        if (query.includes("FROM quota_balances")) return { quota_limit_credits: 50, used_credits: 10 };
        return null;
      },
      all(query) {
        if (query.includes("FROM subscriptions")) return [{
          id: "sub_1",
          provider: "website",
          external_id: "evt_1",
          plan: "pro",
          status: "active",
          current_period_end: "2999-01-01T00:00:00Z",
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-06-01T00:00:00Z"
        }];
        if (query.includes("FROM user_country_links")) return [{ country: "IL", bot_url: "https://t.me/Israel_News_Ticker_Scanner_bot", is_active: 1 }];
        return [];
      }
    }, { SUBSCRIPTION_CHECKOUT_URL: "https://checkout.example/start", SUBSCRIPTION_PORTAL_URL: "https://checkout.example/portal" });

    const response = await worker.fetch(new Request("https://example.test/api/me/subscription", {
      headers: { Cookie: "ms_session=session_1.raw-token" }
    }), env, testExecutionContext());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      userId: "user_1",
      allowed: true,
      summary: {
        plan: "pro",
        status: "active",
        renewalState: "renews",
        canManageBilling: true,
        canStartCheckout: true,
        entitlements: { channelAccess: true, privateAnalysis: true, apiAccess: true },
        quota: { limitCredits: 50, usedCredits: 10, remainingCredits: 40 },
        channelLinks: [{ country: "IL", botUrl: "https://t.me/Israel_News_Ticker_Scanner_bot", isActive: true }]
      }
    });
  });

  it("requires CSRF for cookie-authenticated API key writes", async () => {
    const tokenHash = await testSha256("raw-token");
    const csrfHash = await testSha256("csrf-token");
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return null;
        if (query.includes("FROM user_sessions")) return {
          user_id: "user_1",
          token_hash: tokenHash,
          csrf_hash: csrfHash,
          expires_at: "2999-01-01T00:00:00Z",
          id: "user_1",
          telegram_user_id: null,
          email: "user@example.com",
          email_verified_at: "2026-06-01T00:00:00Z",
          display_name: "User",
          language: "en",
          country: "IL",
          selected_bot_url: null,
          status: "active",
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-06-01T00:00:00Z",
          last_seen_at: null
        };
        return null;
      }
    });

    const response = await worker.fetch(new Request("https://example.test/api/me/api-keys", {
      method: "POST",
      headers: { Cookie: "ms_session=session_1.raw-token", "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "attacker", name: "Blocked key" })
    }), env, testExecutionContext());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "csrf_token_required" });
  });

  it("denies website private analysis requests for non-premium plans", async () => {
    const tokenHash = await testSha256("raw-token");
    const csrfHash = await testSha256("csrf-token");
    let analysisInserted = false;
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return null;
        if (query.includes("FROM user_sessions")) return {
          user_id: "user_1",
          token_hash: tokenHash,
          csrf_hash: csrfHash,
          expires_at: "2999-01-01T00:00:00Z",
          id: "user_1",
          telegram_user_id: "42",
          email: "user@example.com",
          email_verified_at: "2026-06-01T00:00:00Z",
          display_name: "User",
          language: "en",
          country: "IL",
          selected_bot_url: null,
          status: "active",
          created_at: "2026-06-01T00:00:00Z",
          updated_at: "2026-06-01T00:00:00Z",
          last_seen_at: null
        };
        if (query.includes("FROM subscriptions")) return {
          id: "sub_1",
          plan: "starter",
          status: "active",
          current_period_end: "2999-01-01T00:00:00Z"
        };
        if (query.includes("FROM quota_balances")) return { quota_limit_credits: 50, used_credits: 0 };
        return null;
      },
      run(query) {
        if (query.includes("INSERT INTO analysis_requests")) analysisInserted = true;
      }
    });

    const response = await worker.fetch(new Request("https://example.test/api/me/analysis-requests", {
      method: "POST",
      headers: {
        Cookie: "ms_session=session_1.raw-token",
        "Content-Type": "application/json",
        "X-CSRF-Token": "csrf-token"
      },
      body: JSON.stringify({ ticker: "NVDA" })
    }), env, testExecutionContext());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "private_analysis_access_denied", reason: "premium_plan_required" });
    expect(analysisInserted).toBe(false);
  });
});

describe("CORS", () => {
  it("allows configured origins and rejects unknown origins", () => {
    const env = { ALLOWED_ORIGINS: "https://app.example,https://admin.example" };
    expect(allowedCorsOrigin(new Request("https://api.example", { headers: { Origin: "https://app.example" } }), env)).toBe("https://app.example");
    expect(allowedCorsOrigin(new Request("https://api.example", { headers: { Origin: "https://evil.example" } }), env)).toBeNull();
  });

  it("does not expose internal subscription route as a browser-trusted endpoint", async () => {
    const response = await worker.fetch(new Request("https://example.test/api/internal/subscriptions", {
      method: "POST",
      headers: { Origin: "https://app.example", "Content-Type": "application/json" },
      body: "{}"
    }), createEnv({}, { ALLOWED_ORIGINS: "https://app.example" }), testExecutionContext());

    expect(response.status).toBe(401);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    await expect(response.json()).resolves.toMatchObject({ error: "internal_key_and_request_id_required" });
  });
});

describe("API key analysis authorization", () => {
  it("rejects the public analysis endpoint without an API key", async () => {
    const env = createEnv({}, { API_KEY_HASH_SECRET: "api-key-pepper" });
    const response = await worker.fetch(new Request("https://example.test/api/analysis/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: "NVDA" })
    }), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "invalid_api_key" });
  });

  it("accepts a keyed-hash token with analysis:write and active subscription", async () => {
    const token = `msk_live_${"a".repeat(43)}`;
    const secret = "api-key-pepper";
    const keyHash = await testHmacHex(secret, token);
    const env = createEnv({
      all(query) {
        if (query.includes("FROM api_keys WHERE key_prefix")) return [{
          id: "key_1", user_id: "user_1", key_hash: keyHash,
          scopes_json: "[\"analysis:write\"]", expires_at: null, is_active: 1, hash_version: "hmac_sha256_v1"
        }];
        return [];
      },
      first(query) {
        if (query.includes("FROM users WHERE id")) return { id: "user_1", status: "active" };
        if (query.includes("FROM subscriptions")) return { status: "active", current_period_end: "2999-01-01T00:00:00Z" };
        return null;
      }
    }, { API_KEY_HASH_SECRET: secret });

    const result = await requireApiKey(new Request("https://example.test/api/analysis/requests", {
      headers: { Authorization: `Bearer ${token}` }
    }), env, "analysis:write");
    expect(result).toMatchObject({ id: "key_1", userId: "user_1", scopes: ["analysis:write"] });
  });

  it("enforces scope and revoked state", async () => {
    const token = `msk_live_${"b".repeat(43)}`;
    const secret = "api-key-pepper";
    const keyHash = await testHmacHex(secret, token);
    const makeEnv = (scopes: string, isActive: number) => createEnv({
      all(query) {
        if (query.includes("FROM api_keys WHERE key_prefix")) return [{
          id: "key_1", user_id: "user_1", key_hash: keyHash,
          scopes_json: scopes, expires_at: null, is_active: isActive, hash_version: "hmac_sha256_v1"
        }];
        return [];
      }
    }, { API_KEY_HASH_SECRET: secret });
    const request = () => new Request("https://example.test/api/analysis/requests", { headers: { Authorization: `Bearer ${token}` } });

    const scopeResult = await requireApiKey(request(), makeEnv("[\"analysis:read\"]", 1), "analysis:write");
    expect(scopeResult).toBeInstanceOf(Response);
    await expect((scopeResult as Response).json()).resolves.toMatchObject({ error: "api_key_scope_required" });

    const revokedResult = await requireApiKey(request(), makeEnv("[\"analysis:write\"]", 0), "analysis:write");
    expect(revokedResult).toBeInstanceOf(Response);
    await expect((revokedResult as Response).json()).resolves.toMatchObject({ error: "api_key_revoked" });
  });

  it("requires rotation for legacy unkeyed hashes", async () => {
    const token = `msk_live_${"c".repeat(43)}`;
    const legacyHash = await testSha256(token);
    const env = createEnv({
      all(query) {
        if (query.includes("FROM api_keys WHERE key_prefix")) return [{
          id: "key_old", user_id: "user_1", key_hash: legacyHash,
          scopes_json: "[\"analysis:write\"]", expires_at: null, is_active: 1, hash_version: "sha256_legacy"
        }];
        return [];
      }
    }, { API_KEY_HASH_SECRET: "api-key-pepper" });
    const result = await requireApiKey(new Request("https://example.test/api/analysis/requests", {
      headers: { Authorization: `Bearer ${token}` }
    }), env, "analysis:write");

    expect(result).toBeInstanceOf(Response);
    await expect((result as Response).json()).resolves.toMatchObject({ error: "api_key_rotation_required" });
  });

  it("enforces expiry, active user, and active subscription", async () => {
    const token = `msk_live_${"d".repeat(43)}`;
    const secret = "api-key-pepper";
    const keyHash = await testHmacHex(secret, token);
    const request = () => new Request("https://example.test/api/analysis/requests", { headers: { Authorization: `Bearer ${token}` } });
    const makeEnv = (expiresAt: string | null, userStatus: string, subscriptionStatus: string) => createEnv({
      all(query) {
        if (query.includes("FROM api_keys WHERE key_prefix")) return [{
          id: "key_1", user_id: "user_1", key_hash: keyHash,
          scopes_json: "[\"analysis:write\"]", expires_at: expiresAt, is_active: 1, hash_version: "hmac_sha256_v1"
        }];
        return [];
      },
      first(query) {
        if (query.includes("FROM users WHERE id")) return { id: "user_1", status: userStatus };
        if (query.includes("FROM subscriptions")) return { status: subscriptionStatus, current_period_end: "2999-01-01T00:00:00Z" };
        return null;
      }
    }, { API_KEY_HASH_SECRET: secret });

    const expired = await requireApiKey(request(), makeEnv("2000-01-01T00:00:00Z", "active", "active"), "analysis:write");
    await expect((expired as Response).json()).resolves.toMatchObject({ error: "api_key_expired" });

    const inactiveUser = await requireApiKey(request(), makeEnv(null, "suspended", "active"), "analysis:write");
    await expect((inactiveUser as Response).json()).resolves.toMatchObject({ error: "user_not_active" });

    const inactiveSubscription = await requireApiKey(request(), makeEnv(null, "active", "canceled"), "analysis:write");
    await expect((inactiveSubscription as Response).json()).resolves.toMatchObject({ error: "active_subscription_required" });
  });
});

describe("internal endpoint auth", () => {
  it("blocks access checks without internal auth", async () => {
    const env = createEnv({}, { INTERNAL_API_SECRET: "internal-secret" });
    const response = await worker.fetch(new Request("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he"), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "internal_key_and_request_id_required" });
  });

  it("does not allow the shared secret as a Bearer bypass", async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const secret = "internal-secret-with-at-least-32-bytes";
    const env = createEnv({}, { INTERNAL_API_SECRET: secret, INTERNAL_API_KEY_ID: "scanner-v1" });
    const response = await worker.fetch(new Request("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he", {
      headers: {
        Authorization: `Bearer ${secret}`,
        "X-Key-Id": "scanner-v1",
        "X-Request-Id": "req-bearer",
        "X-Timestamp": timestamp
      }
    }), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "internal_signature_required" });
  });

  it("rejects an otherwise valid HMAC after the five-minute TTL", async () => {
    const secret = "internal-secret-with-at-least-32-bytes";
    const keyId = "scanner-v1";
    const requestId = "req-expired";
    const timestamp = (Math.floor(Date.now() / 1000) - 6 * 60).toString();
    const query = "country=IL&language=he&telegramUserId=42";
    const bodyHash = await testSha256("");
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.GET./api/internal/access.${query}.${bodyHash}`);
    const env = createEnv({}, { INTERNAL_API_SECRET: secret, INTERNAL_API_KEY_ID: keyId });

    const response = await worker.fetch(new Request("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he", {
      headers: {
        "X-Key-Id": keyId,
        "X-Request-Id": requestId,
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      }
    }), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "internal_timestamp_expired" });
  });

  it("binds POST HMAC authentication to the raw request body", async () => {
    const secret = "internal-secret-with-at-least-32-bytes";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signedBody = JSON.stringify(scannerPayload({ contractVersion: "2.0" }));
    const tamperedBody = JSON.stringify(scannerPayload({ contractVersion: "3.0" }));
    const bodyHash = await testSha256(signedBody);
    const keyId = "scanner-v1";
    const requestId = "req-tampered";
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.POST./api/internal/access/check..${bodyHash}`);
    const env = createQuotaEnv().env;
    env.INTERNAL_API_SECRET = secret;
    env.INTERNAL_API_KEY_ID = keyId;

    const response = await worker.fetch(new Request("https://example.test/api/internal/access/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Key-Id": keyId,
        "X-Request-Id": requestId,
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      },
      body: tamperedBody
    }), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "unauthorized" });
  });

  it("accepts scanner access check with a trailing slash when the signed path matches", async () => {
    const secret = "internal-secret-with-at-least-32-bytes";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(scannerPayload({ contractVersion: "2.0" }));
    const bodyHash = await testSha256(body);
    const keyId = "scanner-v1";
    const requestId = "req-trailing-access-check";
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.POST./api/internal/access/check/..${bodyHash}`);
    const env = createEnv({}, {
      INTERNAL_API_SECRET: secret,
      INTERNAL_API_KEY_ID: keyId,
      INTERNAL_API_SCOPES_JSON: JSON.stringify({ [keyId]: ["scanner:access"] })
    });

    const response = await worker.fetch(new Request("https://example.test/api/internal/access/check/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Key-Id": keyId,
        "X-Request-Id": requestId,
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      },
      body
    }), env, testExecutionContext());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ reason: "invalid_contract_version" });
  });

  it("logs safe scanner access diagnostics for the trailing slash alias", async () => {
    const secret = "internal-secret-with-at-least-32-bytes";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(scannerPayload({
      requestId: "req-diagnostic-trailing",
      ticker: "NVDA"
    }));
    const bodyHash = await testSha256(body);
    const keyId = "scanner-dev-v2";
    const requestId = "req-diagnostic-trailing";
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.POST./api/internal/access/check/..${bodyHash}`);
    const { env } = createQuotaEnv();
    env.INTERNAL_API_SECRET = secret;
    env.INTERNAL_API_KEY_ID = keyId;
    env.INTERNAL_API_SCOPES_JSON = JSON.stringify({ [keyId]: ["scanner:access"] });
    env.CF_VERSION_METADATA = { id: "version-test-1" };
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    let diagnostics: Array<Record<string, unknown>> = [];

    try {
      const response = await worker.fetch(new Request("https://example.test/api/internal/access/check/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Key-Id": keyId,
          "X-Request-Id": requestId,
          "X-Timestamp": timestamp,
          "X-Signature": `sha256=${signature}`
        },
        body
      }), env, testExecutionContext());
      const payload = await response.json();
      expect(response.status).toBe(200);
      expect(payload).toMatchObject({
        allowed: true,
        cacheStatus: "miss",
        quotaDecision: "new_regular",
        cacheReceiptId: expect.any(String)
      });
      diagnostics = logSpy.mock.calls.map(([message]) => JSON.parse(String(message)) as Record<string, unknown>);
    } finally {
      logSpy.mockRestore();
    }

    expect(diagnostics).toHaveLength(3);
    for (const entry of diagnostics) {
      expect(Object.keys(entry).sort()).toEqual([
        "deploymentVersionId",
        "keyId",
        "matchedHandler",
        "method",
        "pathname",
        "requestId",
        "timestamp"
      ].sort());
      expect(entry).toMatchObject({
        method: "POST",
        pathname: "/api/internal/access/check/",
        requestId,
        keyId,
        deploymentVersionId: "version-test-1"
      });
    }
    expect(diagnostics.map((entry) => entry.matchedHandler)).toEqual([
      "internal_access_check.matched",
      "internal_access_check.hmac_validated",
      "scannerAccessCheck"
    ]);
  });

  it("keeps the trailing slash path bound into the HMAC signature", async () => {
    const secret = "internal-secret-with-at-least-32-bytes";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify(scannerPayload({ contractVersion: "2.0" }));
    const bodyHash = await testSha256(body);
    const keyId = "scanner-v1";
    const requestId = "req-trailing-access-check-wrong-path";
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.POST./api/internal/access/check..${bodyHash}`);
    const env = createEnv({}, {
      INTERNAL_API_SECRET: secret,
      INTERNAL_API_KEY_ID: keyId,
      INTERNAL_API_SCOPES_JSON: JSON.stringify({ [keyId]: ["scanner:access"] })
    });

    const response = await worker.fetch(new Request("https://example.test/api/internal/access/check/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Key-Id": keyId,
        "X-Request-Id": requestId,
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      },
      body
    }), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "unauthorized" });
  });

  it("rejects tampering of every canonical HMAC component", async () => {
    const secret = "internal-secret-with-at-least-32-bytes";
    const keyId = "scanner-v1";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const requestId = "req-canonical";
    const query = "country=IL&language=he&telegramUserId=42";
    const bodyHash = await testSha256("");
    const variants = [
      { name: "wrong secret", secret: "wrong-secret-with-at-least-32-bytes", timestamp, keyId, requestId, method: "GET", path: "/api/internal/access", query, bodyHash },
      { name: "method", secret, timestamp, keyId, requestId, method: "POST", path: "/api/internal/access", query, bodyHash },
      { name: "path", secret, timestamp, keyId, requestId, method: "GET", path: "/api/internal/other", query, bodyHash },
      { name: "query", secret, timestamp, keyId, requestId, method: "GET", path: "/api/internal/access", query: "country=US&language=he&telegramUserId=42", bodyHash },
      { name: "body digest", secret, timestamp, keyId, requestId, method: "GET", path: "/api/internal/access", query, bodyHash: await testSha256("tampered") },
      { name: "key id", secret, timestamp, keyId: "scanner-v2", requestId, method: "GET", path: "/api/internal/access", query, bodyHash },
      { name: "request id", secret, timestamp, keyId, requestId: "req-other", method: "GET", path: "/api/internal/access", query, bodyHash },
      { name: "timestamp", secret, timestamp: String(Number(timestamp) - 1), keyId, requestId, method: "GET", path: "/api/internal/access", query, bodyHash }
    ];
    const env = createEnv({}, { INTERNAL_API_SECRET: secret, INTERNAL_API_KEY_ID: keyId });

    for (const variant of variants) {
      const canonical = `${variant.timestamp}.${variant.keyId}.${variant.requestId}.${variant.method}.${variant.path}.${variant.query}.${variant.bodyHash}`;
      const signature = await testHmacHex(variant.secret, canonical);
      const response = await worker.fetch(new Request("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he", {
        headers: {
          "X-Key-Id": keyId,
          "X-Request-Id": requestId,
          "X-Timestamp": timestamp,
          "X-Signature": `sha256=${signature}`
        }
      }), env, testExecutionContext());

      expect(response.status, variant.name).toBe(401);
      await expect(response.json()).resolves.toMatchObject({ error: "unauthorized" });
    }
  });

  it("rejects a timestamp more than five minutes in the future", async () => {
    const secret = "internal-secret-with-at-least-32-bytes";
    const keyId = "scanner-v1";
    const requestId = "req-future";
    const timestamp = (Math.floor(Date.now() / 1000) + 6 * 60).toString();
    const query = "country=IL&language=he&telegramUserId=42";
    const bodyHash = await testSha256("");
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.GET./api/internal/access.${query}.${bodyHash}`);
    const env = createEnv({}, { INTERNAL_API_SECRET: secret, INTERNAL_API_KEY_ID: keyId });

    const response = await worker.fetch(new Request("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he", {
      headers: {
        "X-Key-Id": keyId,
        "X-Request-Id": requestId,
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      }
    }), env, testExecutionContext());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "internal_timestamp_expired" });
  });

  it("supports overlap rotation with distinct secrets and rejects the retired key", async () => {
    const oldSecret = "old-internal-secret-with-at-least-32-bytes";
    const newSecret = "new-internal-secret-with-at-least-32-bytes";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const query = "country=IL&language=he&telegramUserId=42";
    const bodyHash = await testSha256("");
    let nonce = 0;
    const resolvers = {
      first() { return null; },
      run(queryText: string) { return queryText.includes("INSERT OR IGNORE INTO internal_request_nonces") ? 1 : undefined; }
    };

    const call = async (keyId: string, secret: string, keyring: Record<string, string>) => {
      const requestId = `req-rotation-${++nonce}`;
      const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.GET./api/internal/access.${query}.${bodyHash}`);
      return worker.fetch(new Request("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he", {
        headers: {
          "X-Key-Id": keyId,
          "X-Request-Id": requestId,
          "X-Timestamp": timestamp,
          "X-Signature": `sha256=${signature}`
        }
      }), createEnv(resolvers, {
        INTERNAL_API_SECRETS_JSON: JSON.stringify(keyring),
        INTERNAL_API_SCOPES_JSON: JSON.stringify(Object.fromEntries(Object.keys(keyring).map((id) => [id, ["matcher:access"]])))
      }), testExecutionContext());
    };

    const overlap = { "scanner-old": oldSecret, "scanner-new": newSecret };
    expect((await call("scanner-old", oldSecret, overlap)).status).toBe(200);
    expect((await call("scanner-new", newSecret, overlap)).status).toBe(200);
    expect((await call("scanner-old", oldSecret, { "scanner-new": newSecret })).status).toBe(401);
  });

  it("accepts split internal secrets without overwriting the shared keyring", async () => {
    const secret = "matcher-split-secret-with-at-least-32-bytes";
    const keyId = "matcher-dev-v1";
    const requestId = "req-split-secret";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const query = "country=IL&language=he&telegramUserId=42";
    const bodyHash = await testSha256("");
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.GET./api/internal/access.${query}.${bodyHash}`);
    const response = await worker.fetch(new Request("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he", {
      headers: {
        "X-Key-Id": keyId,
        "X-Request-Id": requestId,
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      }
    }), createEnv({
      first() { return null; },
      run(queryText: string) { return queryText.includes("INSERT OR IGNORE INTO internal_request_nonces") ? 1 : undefined; }
    }, {
      INTERNAL_API_SECRETS_JSON: JSON.stringify({ "scanner-dev-v2": "scanner-secret-with-at-least-32-bytes" }),
      INTERNAL_API_SECRET_MATCHER_DEV_V1: secret,
      INTERNAL_API_SCOPES_JSON: JSON.stringify({ [keyId]: ["matcher:access"] })
    }), testExecutionContext());

    expect(response.status).toBe(200);
  });

  it("rejects replay of the same signed internal request", async () => {
    const secret = "internal-secret-with-at-least-32-bytes";
    const keyId = "scanner-v1";
    const requestId = "req-replay";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const query = "country=IL&language=he&telegramUserId=42";
    const bodyHash = await testSha256("");
    const signature = await testHmacHex(secret, `${timestamp}.${keyId}.${requestId}.GET./api/internal/access.${query}.${bodyHash}`);
    let nonceInserted = false;
    const env = createEnv({
      first() { return null; },
      run(queryText) {
        if (!queryText.includes("INSERT OR IGNORE INTO internal_request_nonces")) return;
        if (nonceInserted) return 0;
        nonceInserted = true;
        return 1;
      }
    }, {
      INTERNAL_API_SECRET: secret,
      INTERNAL_API_KEY_ID: keyId,
      INTERNAL_API_SCOPES_JSON: JSON.stringify({ [keyId]: ["matcher:access"] })
    });
    const makeRequest = () => new Request("https://example.test/api/internal/access?telegramUserId=42&country=IL&language=he", {
      headers: {
        "X-Key-Id": keyId,
        "X-Request-Id": requestId,
        "X-Timestamp": timestamp,
        "X-Signature": `sha256=${signature}`
      }
    });

    expect((await worker.fetch(makeRequest(), env, testExecutionContext())).status).toBe(200);
    const replay = await worker.fetch(makeRequest(), env, testExecutionContext());
    expect(replay.status).toBe(409);
    await expect(replay.json()).resolves.toMatchObject({ error: "internal_request_replayed" });
  });

  it("enforces endpoint scopes before nonce consumption", async () => {
    const secret = "scoped-internal-secret-with-at-least-32-bytes";
    let nonceWrites = 0;
    const cases = [
      { keyId: "matcher-v1", scopes: ["matcher:access"], path: "/api/internal/access/check", requiredScope: "scanner:access" },
      { keyId: "matcher-v1", scopes: ["matcher:access"], path: "/api/internal/access/cache/commit", requiredScope: "scanner:cache" },
      { keyId: "scanner-v1", scopes: ["scanner:access", "scanner:cache"], path: "/api/internal/deliver", requiredScope: "matcher:deliver" },
      { keyId: "matcher-v1", scopes: ["matcher:access", "matcher:deliver"], path: "/api/internal/subscriptions", requiredScope: "website:subscriptions" }
    ];

    for (const [index, scenario] of cases.entries()) {
      const body = "{}";
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const requestId = `scope-${index}`;
      const bodyHash = await testSha256(body);
      const signature = await testHmacHex(secret, `${timestamp}.${scenario.keyId}.${requestId}.POST.${scenario.path}..${bodyHash}`);
      const env = createEnv({
        run(query) {
          if (query.includes("internal_request_nonces")) nonceWrites += 1;
        }
      }, {
        INTERNAL_API_SECRETS_JSON: JSON.stringify({ [scenario.keyId]: secret }),
        INTERNAL_API_SCOPES_JSON: JSON.stringify({ [scenario.keyId]: scenario.scopes })
      });
      const response = await worker.fetch(new Request(`https://example.test${scenario.path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Key-Id": scenario.keyId,
          "X-Request-Id": requestId,
          "X-Timestamp": timestamp,
          "X-Signature": `sha256=${signature}`
        },
        body
      }), env, testExecutionContext());

      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toMatchObject({ error: "internal_scope_required", requiredScope: scenario.requiredScope });
    }
    expect(nonceWrites).toBe(0);
  });
});

describe("rate limit", () => {
  it("returns 429 when a bucket is over limit", async () => {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % 60);
    const env = createEnv({
      first(query) {
        if (query.includes("FROM rate_limits")) return { count: 10, window_start: windowStart };
        return null;
      }
    });

    const response = await worker.fetch(new Request("https://example.test/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.10" },
      body: JSON.stringify({ email: "user@example.com" })
    }), env, testExecutionContext());

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({ error: "rate_limited", bucket: "register" });
  });
});

describe("health", () => {
  it("reports DB and core table checks", async () => {
    const env = createEnv({
      first(query) {
        if (query.includes("COUNT(*)")) return { count: 2 };
        return { count: 1 };
      }
    });

    const payload = await (await health(env)).json();
    expect(payload).toMatchObject({
      ok: true,
      checks: {
        db: { ok: true, count: 1 },
        users: { ok: true, count: 2 },
        subscriptions: { ok: true, count: 2 },
        bot_routes: { ok: true, count: 2 },
        api_keys: { ok: true, count: 2 },
        analysis_requests: { ok: true, count: 2 }
      }
    });
  });
});
