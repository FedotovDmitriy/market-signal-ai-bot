import { describe, expect, it } from "vitest";
import {
  allowedCorsOrigin,
  buildCountryLinks,
  cleanCountries,
  health,
  internalAccess,
  isSubscriptionCurrentlyAllowed,
  requireWebhookSignature,
  verifyTelegramInitData,
  type Env
} from "./index";

type DbResolvers = {
  first?: (query: string, args: unknown[]) => unknown;
  all?: (query: string, args: unknown[]) => unknown[];
};

function createEnv(resolvers: DbResolvers, overrides: Partial<Env> = {}): Env {
  const db = {
    prepare(query: string) {
      return {
        bind(...args: unknown[]) {
          return {
            first: async <T>() => resolvers.first?.(query, args) as T,
            all: async <T>() => ({ results: (resolvers.all?.(query, args) ?? []) as T[] }),
            run: async () => ({ success: true })
          };
        },
        first: async <T>() => resolvers.first?.(query, []) as T,
        all: async <T>() => ({ results: (resolvers.all?.(query, []) ?? []) as T[] }),
        run: async () => ({ success: true })
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
});

describe("subscription access helper", () => {
  it("uses currentPeriodEnd in addition to status", () => {
    expect(isSubscriptionCurrentlyAllowed({ status: "active", currentPeriodEnd: "2999-01-01T00:00:00Z" })).toBe(true);
    expect(isSubscriptionCurrentlyAllowed({ status: "active", currentPeriodEnd: "2000-01-01T00:00:00Z" })).toBe(false);
    expect(isSubscriptionCurrentlyAllowed({ status: "canceled", currentPeriodEnd: "2999-01-01T00:00:00Z" })).toBe(false);
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

describe("CORS", () => {
  it("allows configured origins and rejects unknown origins", () => {
    const env = { ALLOWED_ORIGINS: "https://app.example,https://admin.example" };
    expect(allowedCorsOrigin(new Request("https://api.example", { headers: { Origin: "https://app.example" } }), env)).toBe("https://app.example");
    expect(allowedCorsOrigin(new Request("https://api.example", { headers: { Origin: "https://evil.example" } }), env)).toBeNull();
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
        bot_routes: { ok: true, count: 2 }
      }
    });
  });
});
