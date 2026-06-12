export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  PUBLIC_APP_NAME: string;
  DEFAULT_LOCALE: string;
  DEFAULT_COUNTRY: string;
  ALLOWED_ORIGINS?: string;
  ADMIN_USERNAME?: string;
  ADMIN_TOKEN?: string;
  INTERNAL_API_SECRET?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  SUBSCRIPTION_WEBHOOK_SECRET?: string;
  ALLOW_UNVERIFIED_TELEGRAM?: string;
  SUBSCRIPTION_CHECKOUT_URL?: string;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type AppUser = {
  id: string;
  telegram_user_id: string | null;
  email: string | null;
  display_name: string | null;
  language: string;
  country: string;
  selected_bot_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
};

type SubscriptionInput = {
  userId?: string;
  telegramUserId?: string;
  email?: string;
  displayName?: string;
  language?: string;
  country?: string;
  countries?: string[];
  provider?: string;
  externalId?: string;
  plan?: string;
  status?: string;
  currentPeriodEnd?: string;
  metadata?: Record<string, JsonValue>;
};

type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: {
    chat?: { id: number | string };
    text?: string;
    from?: TelegramWebAppUser;
  };
};

type CountryLink = {
  country: string;
  botUrl: string | null;
  isActive: boolean;
};

type RateLimitRule = {
  bucket: string;
  limit: number;
  windowSeconds: number;
};

const ACTIVE_SUBSCRIPTION_STATUSES = ["trialing", "active"] as const;
const NEWS_CHAT_OPTIONS = [
  { country: "IL", language: "he", name: "Israel news", languageName: "Hebrew", botUrl: "https://t.me/Israel_News_Ticker_Scanner_bot" },
  { country: "US", language: "ru", name: "US news", languageName: "Russian", botUrl: "https://t.me/US_News_Ticker_Scanner_RU_bot" }
];
const AVAILABLE_NEWS_COUNTRIES = new Set(NEWS_CHAT_OPTIONS.map((option) => option.country));

const COUNTRIES = [
  ["US", "United States"],
  ["RU", "Russia"],
  ["GB", "United Kingdom"],
  ["GE", "Georgia"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["AE", "United Arab Emirates"],
  ["IL", "Israel"]
];

const LANGUAGES = [
  ["en", "English"],
  ["ru", "Russian"],
  ["he", "Hebrew"]
];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (request.method === "OPTIONS") {
        return withCors(request, new Response(null, { status: 204 }), env);
      }

      const rateLimit = await maybeRateLimit(request, env, url);
      if (rateLimit) return withCors(request, rateLimit, env);

      if (url.pathname === "/") {
        return htmlResponse(renderTelegramApp(env));
      }

      if (url.pathname === "/admin") {
        return htmlResponse(renderAdminApp(env));
      }

      if (url.pathname === "/api/health" && request.method === "GET") {
        return await health(env);
      }

      if (url.pathname === "/api/config" && request.method === "GET") {
        return json({
          appName: env.PUBLIC_APP_NAME,
          defaultLocale: env.DEFAULT_LOCALE,
          defaultCountry: AVAILABLE_NEWS_COUNTRIES.has(env.DEFAULT_COUNTRY.toUpperCase()) ? env.DEFAULT_COUNTRY : "IL",
          subscriptionCheckoutUrl: env.SUBSCRIPTION_CHECKOUT_URL ?? null,
          countries: NEWS_CHAT_OPTIONS.map((option) => ({
            code: option.country,
            name: `${option.name} (${option.languageName})`,
            language: option.language,
            isAvailable: true,
            isComingSoon: false
          })),
          languages: LANGUAGES.map(([code, name]) => ({ code, name }))
        });
      }

      if (url.pathname === "/api/register" && request.method === "POST") {
        return withCors(request, await registerUser(request, env, ctx), env);
      }

      if (url.pathname === "/api/settings" && request.method === "PUT") {
        return withCors(request, await updateSettings(request, env, ctx), env);
      }

      if (url.pathname === "/api/account" && request.method === "GET") {
        return withCors(request, await accountDetails(url, env), env);
      }

      if (url.pathname === "/api/account/countries" && request.method === "DELETE") {
        return withCors(request, await deleteCountryLink(request, env, ctx), env);
      }

      if (url.pathname === "/api/subscriptions" && request.method === "POST") {
        return withCors(request, await acceptSubscription(request, env, ctx), env);
      }

      if (url.pathname === "/api/internal/access" && request.method === "GET") {
        const guard = await requireInternalAccess(request, env);
        if (guard) return guard;
        return await internalAccess(url, env);
      }

      if (url.pathname === "/api/telegram/webhook" && request.method === "POST") {
        return withCors(request, await telegramWebhook(request, env, ctx), env);
      }

      if (url.pathname === "/api/admin/telegram/setup" && request.method === "POST") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await setupTelegramWebApp(request, env), env);
      }

      if (url.pathname === "/api/admin/overview" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await adminOverview(env), env);
      }

      if (url.pathname === "/api/admin/users" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await adminUsers(env, url), env);
      }

      if (url.pathname === "/api/admin/users" && request.method === "PUT") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await updateAdminUser(request, env, ctx), env);
      }

      if (url.pathname === "/api/admin/events" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await adminEvents(env), env);
      }

      if (url.pathname === "/api/admin/bot-routes" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await adminBotRoutes(env), env);
      }

      if (url.pathname === "/api/admin/bot-routes" && request.method === "PUT") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await upsertBotRoute(request, env, ctx), env);
      }

      if (url.pathname === "/api/admin/bot-routes" && request.method === "DELETE") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await deleteBotRoute(request, env, ctx), env);
      }

      return json({ error: "not_found" }, 404);
    } catch (error) {
      console.error(JSON.stringify({ level: "error", message: "request_failed", path: url.pathname, error: String(error) }));
      return json({ error: "internal_error" }, 500);
    }
  }
};

async function registerUser(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const initData = cleanString(body.initData);
  const telegramUser = initData ? await verifyTelegramInitData(initData, env) : null;
  if (initData && !telegramUser) return json({ error: "invalid_telegram_init_data" }, 401);

  const submittedTelegramUserId = cleanString(body.telegramUserId);
  if (submittedTelegramUserId && !telegramUser && env.ALLOW_UNVERIFIED_TELEGRAM !== "true") {
    return json({ error: "telegram_init_data_required" }, 401);
  }

  const telegramUserId = telegramUser ? String(telegramUser.id) : submittedTelegramUserId;
  const email = cleanString(body.email)?.toLowerCase() ?? null;
  if (email && !isValidEmail(email)) return json({ error: "valid_email_required" }, 400);
  const telegramName = telegramUser ? [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ") : null;
  const displayName = cleanString(body.displayName) ?? telegramName ?? null;
  const language = cleanLanguage(body.language, telegramUser?.language_code ?? env.DEFAULT_LOCALE);
  const countries = cleanCountries(body.countries, body.country, env.DEFAULT_COUNTRY);
  const country = countries[0];

  if (!telegramUserId && !email) {
    return json({ error: "telegramUserId_or_email_required" }, 400);
  }

  const existing = await findUser(env, { telegramUserId, email });
  const userId = existing?.id ?? crypto.randomUUID();
  const countryLinks = await buildCountryLinks(env, countries);
  const primaryBotUrl = countryLinks[0]?.botUrl ?? null;
  const access = await resolveAccess(env, userId, primaryBotUrl);

  if (existing) {
    await env.DB.prepare(
      `UPDATE users
       SET email = COALESCE(?, email),
           display_name = COALESCE(?, display_name),
           language = ?,
           country = ?,
           selected_bot_url = ?,
           updated_at = CURRENT_TIMESTAMP,
           last_seen_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(email, displayName, language, country, primaryBotUrl, userId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO users (id, telegram_user_id, email, display_name, language, country, selected_bot_url, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(userId, telegramUserId, email, displayName, language, country, primaryBotUrl).run();
  }

  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, language, country)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, country = excluded.country, updated_at = CURRENT_TIMESTAMP`
  ).bind(userId, language, country).run();

  await replaceCountryLinks(env, userId, countryLinks);

  ctx.waitUntil(audit(env, userId, "user", "user.registered", request, { countries, language }));

  return json({ userId, botUrl: primaryBotUrl, countryLinks, access, status: "active" });
}

export async function health(env: Env): Promise<Response> {
  const checks: Record<string, { ok: boolean; count?: number; error?: string }> = {};
  const tableChecks = [
    ["db", "SELECT 1 AS count"],
    ["users", "SELECT COUNT(*) AS count FROM users"],
    ["subscriptions", "SELECT COUNT(*) AS count FROM subscriptions"],
    ["bot_routes", "SELECT COUNT(*) AS count FROM bot_routes"]
  ] as const;

  await Promise.all(tableChecks.map(async ([name, query]) => {
    try {
      const row = await env.DB.prepare(query).first<{ count: number }>();
      checks[name] = { ok: true, count: row?.count ?? 0 };
    } catch (error) {
      checks[name] = { ok: false, error: String(error) };
    }
  }));

  const ok = Object.values(checks).every((check) => check.ok);
  return json({ ok, service: env.PUBLIC_APP_NAME, environment: env.ENVIRONMENT, deployCheck: "2026-06-08-subscription-gate", checks }, ok ? 200 : 503);
}

async function maybeRateLimit(request: Request, env: Env, url: URL): Promise<Response | null> {
  const rule = rateLimitRuleFor(request, url);
  if (!rule) return null;

  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For") ?? "unknown";
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % rule.windowSeconds);
  const expiresAt = windowStart + rule.windowSeconds;
  const key = await sha256(`${rule.bucket}:${ip}:${windowStart}`);
  const existing = await env.DB.prepare("SELECT count, window_start FROM rate_limits WHERE key = ?").bind(key).first<{ count: number; window_start: number }>();

  if (existing && existing.window_start === windowStart) {
    if (existing.count >= rule.limit) {
      return json({ error: "rate_limited", bucket: rule.bucket, retryAfter: expiresAt - now }, 429);
    }
    await env.DB.prepare("UPDATE rate_limits SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE key = ?").bind(key).run();
    return null;
  }

  await env.DB.prepare(
    `INSERT INTO rate_limits (key, bucket, count, window_start, expires_at, updated_at)
     VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start, expires_at = excluded.expires_at, updated_at = CURRENT_TIMESTAMP`
  ).bind(key, rule.bucket, windowStart, expiresAt).run();

  await env.DB.prepare("DELETE FROM rate_limits WHERE expires_at < ?").bind(now).run();

  return null;
}

function rateLimitRuleFor(request: Request, url: URL): RateLimitRule | null {
  if (url.pathname === "/api/register" && request.method === "POST") return { bucket: "register", limit: 10, windowSeconds: 60 };
  if (url.pathname === "/api/settings" && request.method === "PUT") return { bucket: "settings", limit: 30, windowSeconds: 60 };
  if (url.pathname === "/api/subscriptions" && request.method === "POST") return { bucket: "subscriptions", limit: 60, windowSeconds: 60 };
  if (url.pathname.startsWith("/api/admin/")) return { bucket: "admin", limit: 120, windowSeconds: 60 };
  return null;
}

async function updateSettings(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const userId = cleanString(body.userId);
  if (!userId) return json({ error: "userId_required" }, 400);

  const language = cleanLanguage(body.language, env.DEFAULT_LOCALE);
  const countries = cleanCountries(body.countries, body.country, env.DEFAULT_COUNTRY);
  const country = countries[0];
  const riskProfile = cleanEnum(body.riskProfile, ["conservative", "balanced", "aggressive"], "balanced");
  const deliveryMode = cleanEnum(body.deliveryMode, ["telegram", "email", "both"], "telegram");
  const tickers = Array.isArray(body.tickers)
    ? body.tickers.map((ticker) => cleanString(ticker)?.toUpperCase()).filter(isString).slice(0, 50)
    : [];
  const countryLinks = await buildCountryLinks(env, countries);
  const primaryBotUrl = countryLinks[0]?.botUrl ?? null;
  const access = await resolveAccess(env, userId, primaryBotUrl);

  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, language, country, risk_profile, delivery_mode, tickers_json)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       language = excluded.language,
       country = excluded.country,
       risk_profile = excluded.risk_profile,
       delivery_mode = excluded.delivery_mode,
       tickers_json = excluded.tickers_json,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(userId, language, country, riskProfile, deliveryMode, JSON.stringify(tickers)).run();

  await env.DB.prepare(
    `UPDATE users
     SET language = ?, country = ?, selected_bot_url = ?, updated_at = CURRENT_TIMESTAMP, last_seen_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(language, country, primaryBotUrl, userId).run();

  await replaceCountryLinks(env, userId, countryLinks);

  ctx.waitUntil(audit(env, userId, "user", "settings.updated", request, { countries, language, riskProfile, deliveryMode }));

  return json({ userId, botUrl: primaryBotUrl, countryLinks, access, settings: { language, countries, riskProfile, deliveryMode, tickers } });
}

async function acceptSubscription(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const rawBody = await request.text();
  const guard = await requireWebhookSignature(request, env, rawBody);
  if (guard) return guard;

  const body = parseJson<SubscriptionInput>(rawBody);
  const provider = cleanString(body.provider) ?? "external";
  const plan = cleanString(body.plan) ?? "trial";
  const status = cleanEnum(body.status, ["trialing", "active", "past_due", "canceled", "expired"], "active");
  const externalId = cleanString(body.externalId) ?? null;
  const currentPeriodEnd = cleanString(body.currentPeriodEnd) ?? null;

  let userId = cleanString(body.userId) ?? undefined;
  if (!userId) {
    const existing = await findUser(env, {
      telegramUserId: cleanString(body.telegramUserId),
      email: cleanString(body.email)?.toLowerCase() ?? null
    });
    userId = existing?.id;
  }
  if (!userId) {
    const telegramUserId = cleanString(body.telegramUserId);
    const email = cleanString(body.email)?.toLowerCase() ?? null;
    if (email && !isValidEmail(email)) return json({ error: "valid_email_required" }, 400);
    if (!telegramUserId && !email) return json({ error: "userId_telegramUserId_or_email_required" }, 400);
    userId = crypto.randomUUID();
    const language = cleanLanguage(body.language, env.DEFAULT_LOCALE);
    const countries = cleanCountries(body.countries, body.country, env.DEFAULT_COUNTRY);
    const country = countries[0];
    const countryLinks = await buildCountryLinks(env, countries);
    const botUrl = countryLinks[0]?.botUrl ?? null;
    await env.DB.prepare(
      `INSERT INTO users (id, telegram_user_id, email, display_name, language, country, selected_bot_url, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(userId, telegramUserId, email, cleanString(body.displayName), language, country, botUrl).run();
    await env.DB.prepare(
      `INSERT INTO user_settings (user_id, language, country)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, country = excluded.country, updated_at = CURRENT_TIMESTAMP`
    ).bind(userId, language, country).run();
    await replaceCountryLinks(env, userId, countryLinks);
  }

  const subscriptionId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO subscriptions (id, user_id, provider, external_id, plan, status, current_period_end, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(subscriptionId, userId, provider, externalId, plan, status, currentPeriodEnd, JSON.stringify(body.metadata ?? {})).run();

  ctx.waitUntil(audit(env, userId, provider, "subscription.received", request, { plan, status, externalId }));

  const user = await findUserById(env, userId);
  const countryLinks = await listCountryLinks(env, userId);
  const country = countryLinks[0]?.country ?? user?.country ?? env.DEFAULT_COUNTRY;
  const botUrl = countryLinks[0]?.botUrl ?? await findBotUrl(env, country);
  const access = await resolveAccess(env, userId, botUrl);

  return json({ subscriptionId, userId, status, botUrl, countryLinks, access });
}

async function accountDetails(url: URL, env: Env): Promise<Response> {
  const userId = cleanString(url.searchParams.get("userId"));
  const email = cleanString(url.searchParams.get("email"))?.toLowerCase() ?? null;
  if (email && !isValidEmail(email)) return json({ error: "valid_email_required" }, 400);
  const user = userId ? await findUserById(env, userId) : await findUser(env, { email });
  if (!user) return json({ error: "user_not_found" }, 404);
  const countryLinks = await listCountryLinks(env, user.id);
  return json({ user, countryLinks });
}

async function deleteCountryLink(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const userId = cleanString(body.userId);
  const country = cleanCountry(body.country, "");
  if (!userId) return json({ error: "userId_required" }, 400);
  if (!country) return json({ error: "country_required" }, 400);

  await env.DB.prepare(
    `UPDATE user_country_links
     SET is_active = 0, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ? AND country = ?`
  ).bind(userId, country).run();

  const remaining = await listCountryLinks(env, userId);
  const primary = remaining[0] ?? null;
  await env.DB.prepare(
    `UPDATE users
     SET country = COALESCE(?, country),
         selected_bot_url = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(primary?.country ?? null, primary?.botUrl ?? null, userId).run();

  ctx.waitUntil(audit(env, userId, "user", "country_link.deleted", request, { country }));

  return json({ userId, removedCountry: country, countryLinks: remaining });
}

export async function internalAccess(url: URL, env: Env): Promise<Response> {
  const telegramUserId = cleanString(url.searchParams.get("telegramUserId"));
  const country = cleanCountry(url.searchParams.get("country"), "");
  const language = cleanInternalLanguage(url.searchParams.get("language"));
  if (!telegramUserId) return json({ error: "telegramUserId_required" }, 400);
  if (!country) return json({ error: "country_required" }, 400);
  if (!language) return json({ error: "language_required" }, 400);

  const allowedOption = NEWS_CHAT_OPTIONS.find((option) => option.country === country && option.language === language);
  const user = await findUser(env, { telegramUserId });
  if (!user) {
    return json({
      allowed: false,
      reason: "user_not_found",
      userId: "",
      country,
      language,
      subscriptionStatus: null,
      botUrl: null
    });
  }

  const subscription = await latestSubscription(env, user.id);
  const subscriptionStatus = subscription?.status ?? null;
  const countryLink = await findCountryLink(env, user.id, country);
  const botUrl = countryLink?.botUrl ?? await findBotUrl(env, country) ?? findDefaultNewsChatUrl(country);

  let reason: string | null = null;
  if (!allowedOption) reason = "unsupported_country_language";
  else if (!countryLink) reason = "country_not_linked";
  else if (!botUrl) reason = "country_bot_not_configured";
  else if (!isSubscriptionCurrentlyAllowed(subscription)) reason = subscriptionAccessReason(subscription);

  return json({
    allowed: reason === null,
    reason,
    userId: user.id,
    country,
    language,
    subscriptionStatus,
    botUrl: reason === null ? botUrl : null
  });
}

async function telegramWebhook(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!secret || !(await timingSafeEqual(secret, env.TELEGRAM_WEBHOOK_SECRET))) {
      return json({ error: "unauthorized" }, 401);
    }
  }

  const update = await readJson<TelegramUpdate>(request);
  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim().toLowerCase();
  if (!chatId || !text) return json({ ok: true });

  if (text === "/start" || text === "/app") {
    const appUrl = buildPublicAppUrl(request);
    ctx.waitUntil(sendTelegramMessage(env, chatId, "Open Market Signal AI to create your account and unlock the country bot.", {
      reply_markup: {
        inline_keyboard: [[
          { text: "Open Market Signal AI", web_app: { url: appUrl } }
        ]]
      }
    }));
  }

  return json({ ok: true });
}

async function setupTelegramWebApp(request: Request, env: Env): Promise<Response> {
  if (!env.TELEGRAM_BOT_TOKEN) return json({ error: "telegram_bot_token_not_configured" }, 503);

  const body = await readOptionalJson<Record<string, unknown>>(request);
  const appUrl = cleanString(body?.appUrl) ?? buildPublicAppUrl(request);
  if (!/^https:\/\/.+/i.test(appUrl)) return json({ error: "https_app_url_required" }, 400);

  const webhookUrl = cleanString(body?.webhookUrl) ?? `${appUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
  if (!/^https:\/\/.+/i.test(webhookUrl)) return json({ error: "https_webhook_url_required" }, 400);

  const webhookPayload: Record<string, unknown> = {
    url: webhookUrl,
    allowed_updates: ["message"]
  };
  if (env.TELEGRAM_WEBHOOK_SECRET) webhookPayload.secret_token = env.TELEGRAM_WEBHOOK_SECRET;

  const [webhook, commands, menuButton] = await Promise.all([
    telegramApi(env, "setWebhook", webhookPayload),
    telegramApi(env, "setMyCommands", {
      commands: [
        { command: "start", description: "Open Market Signal AI" },
        { command: "app", description: "Open the Web App" }
      ]
    }),
    telegramApi(env, "setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: env.PUBLIC_APP_NAME,
        web_app: { url: appUrl }
      }
    })
  ]);

  return json({ ok: true, appUrl, webhookUrl, webhook, commands, menuButton });
}

async function adminOverview(env: Env): Promise<Response> {
  const [users, activeSubscriptions, events, countries, botRoutes, subscriptionSeries] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM subscriptions WHERE status IN ('trialing', 'active')").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM audit_events WHERE created_at >= datetime('now', '-24 hours')").first<{ count: number }>(),
    env.DB.prepare("SELECT country, COUNT(*) AS count FROM users GROUP BY country ORDER BY count DESC LIMIT 10").all(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM bot_routes WHERE is_active = 1").first<{ count: number }>(),
    env.DB.prepare(
      `SELECT date(created_at) AS day, COUNT(*) AS count
       FROM subscriptions
       WHERE created_at >= datetime('now', '-13 days')
       GROUP BY date(created_at)
       ORDER BY day ASC`
    ).all<{ day: string; count: number }>()
  ]);

  return json({
    users: users?.count ?? 0,
    activeSubscriptions: activeSubscriptions?.count ?? 0,
    events24h: events?.count ?? 0,
    activeBotRoutes: botRoutes?.count ?? 0,
    serverTime: new Date().toISOString(),
    countries: countries.results,
    subscriptionSeries: fillDailySeries(subscriptionSeries.results)
  });
}

async function adminUsers(env: Env, url: URL): Promise<Response> {
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 25), 1), 25);
  const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
  const offset = (page - 1) * limit;
  const country = cleanString(url.searchParams.get("country"))?.toUpperCase();
  const status = cleanString(url.searchParams.get("status"));
  const search = cleanString(url.searchParams.get("search"));
  const filters: string[] = [];
  const params: string[] = [];
  if (country) {
    filters.push("u.country = ?");
    params.push(country);
  }
  if (status) {
    filters.push("u.status = ?");
    params.push(status);
  }
  if (search) {
    filters.push("(u.email LIKE ? OR u.telegram_user_id LIKE ? OR u.display_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const total = await env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM users u
     ${where}`
  ).bind(...params).first<{ count: number }>();
  const result = await env.DB.prepare(
    `SELECT u.*, s.plan, s.status AS subscription_status, s.current_period_end
     FROM users u
     LEFT JOIN subscriptions s ON s.id = (
       SELECT id FROM subscriptions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
     )
     ${where}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  return json({ users: result.results, pagination: { page, limit, total: total?.count ?? 0, totalPages: Math.max(Math.ceil((total?.count ?? 0) / limit), 1) } });
}

function fillDailySeries(rows: { day: string; count: number }[]): { day: string; count: number }[] {
  const counts = new Map(rows.map((row) => [row.day, row.count]));
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (13 - index));
    const day = date.toISOString().slice(0, 10);
    return { day, count: counts.get(day) ?? 0 };
  });
}

async function updateAdminUser(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const userId = cleanString(body.userId);
  if (!userId) return json({ error: "userId_required" }, 400);

  const existing = await findUserById(env, userId);
  if (!existing) return json({ error: "user_not_found" }, 404);

  const emailInput = cleanString(body.email);
  const email = emailInput ? emailInput.toLowerCase() : null;
  if (email && !isValidEmail(email)) return json({ error: "valid_email_required" }, 400);

  const displayName = cleanString(body.displayName);
  const language = cleanLanguage(body.language, existing.language);
  const status = cleanEnum(body.status, ["active", "blocked"], existing.status === "blocked" ? "blocked" : "active");
  const countries = cleanCountries(body.countries, body.country, existing.country);
  const countryLinks = await buildCountryLinks(env, countries);
  const primary = countryLinks[0];

  await env.DB.prepare(
    `UPDATE users
     SET email = ?,
         display_name = ?,
         language = ?,
         country = ?,
         selected_bot_url = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(email, displayName, language, primary.country, primary.botUrl, status, userId).run();

  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, language, country)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, country = excluded.country, updated_at = CURRENT_TIMESTAMP`
  ).bind(userId, language, primary.country).run();

  await replaceCountryLinks(env, userId, countryLinks);

  ctx.waitUntil(audit(env, userId, "admin", "user.updated", request, { email, displayName, language, status, countries }));

  const user = await findUserById(env, userId);
  return json({ user, countryLinks });
}

async function adminEvents(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    `SELECT id, user_id, actor, event_type, payload_json, created_at
     FROM audit_events
     ORDER BY created_at DESC
     LIMIT 100`
  ).all();

  return json({ events: result.results });
}

async function adminBotRoutes(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    `SELECT country, language, bot_url, is_active, created_at, updated_at
     FROM bot_routes
     ORDER BY country ASC`
  ).all();

  return json({ routes: result.results });
}

async function upsertBotRoute(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const country = cleanCountry(body.country, env.DEFAULT_COUNTRY);
  const previousCountry = cleanCountry(body.previousCountry, country);
  const language = cleanLanguage(body.language, env.DEFAULT_LOCALE);
  const botUrl = cleanString(body.botUrl);
  const isActive = body.isActive === false ? 0 : 1;
  if (!botUrl || !/^https:\/\/t\.me\/[a-zA-Z0-9_]+$/.test(botUrl)) {
    return json({ error: "valid_t_me_bot_url_required" }, 400);
  }

  await env.DB.prepare(
    `INSERT INTO bot_routes (country, language, bot_url, is_active, updated_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(country) DO UPDATE SET
       language = excluded.language,
       bot_url = excluded.bot_url,
       is_active = excluded.is_active,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(country, language, botUrl, isActive).run();

  if (previousCountry !== country) {
    await env.DB.prepare("DELETE FROM bot_routes WHERE country = ?").bind(previousCountry).run();
  }

  ctx.waitUntil(audit(env, null, "admin", "bot_route.upserted", request, { country, previousCountry, language, botUrl, isActive }));

  return json({ country, language, botUrl, isActive: Boolean(isActive) });
}

async function deleteBotRoute(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const country = cleanCountry(body.country, "");
  if (!country) return json({ error: "country_required" }, 400);

  await env.DB.prepare("DELETE FROM bot_routes WHERE country = ?").bind(country).run();

  ctx.waitUntil(audit(env, null, "admin", "bot_route.deleted", request, { country }));

  return json({ country, deleted: true });
}

async function findUser(env: Env, input: { telegramUserId?: string | null; email?: string | null }): Promise<AppUser | null> {
  if (input.telegramUserId) {
    const user = await env.DB.prepare("SELECT * FROM users WHERE telegram_user_id = ?").bind(input.telegramUserId).first<AppUser>();
    if (user) return user;
  }
  if (input.email) {
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(input.email).first<AppUser>();
    if (user) return user;
  }
  return null;
}

async function findUserById(env: Env, userId: string): Promise<AppUser | null> {
  return env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<AppUser>();
}

async function findBotUrl(env: Env, country: string): Promise<string | null> {
  const route = await env.DB.prepare("SELECT bot_url FROM bot_routes WHERE country = ? AND is_active = 1").bind(country).first<{ bot_url: string }>();
  return route?.bot_url ?? null;
}

export async function buildCountryLinks(env: Env, countries: string[]): Promise<CountryLink[]> {
  return Promise.all(countries.map(async (country) => ({
    country,
    botUrl: await findBotUrl(env, country) ?? findDefaultNewsChatUrl(country),
    isActive: true
  })));
}

function findDefaultNewsChatUrl(country: string): string | null {
  return NEWS_CHAT_OPTIONS.find((option) => option.country === country)?.botUrl ?? null;
}

async function replaceCountryLinks(env: Env, userId: string, links: CountryLink[]): Promise<void> {
  await env.DB.prepare("UPDATE user_country_links SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").bind(userId).run();
  for (const link of links) {
    await env.DB.prepare(
      `INSERT INTO user_country_links (user_id, country, bot_url, is_active, updated_at)
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, country) DO UPDATE SET
         bot_url = excluded.bot_url,
         is_active = 1,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(userId, link.country, link.botUrl).run();
  }
}

async function listCountryLinks(env: Env, userId: string): Promise<CountryLink[]> {
  const result = await env.DB.prepare(
    `SELECT country, bot_url, is_active
     FROM user_country_links
     WHERE user_id = ? AND is_active = 1
     ORDER BY created_at ASC`
  ).bind(userId).all<{ country: string; bot_url: string | null; is_active: number }>();
  return result.results.map((row) => ({ country: row.country, botUrl: row.bot_url, isActive: Boolean(row.is_active) }));
}

async function findCountryLink(env: Env, userId: string, country: string): Promise<CountryLink | null> {
  const row = await env.DB.prepare(
    `SELECT country, bot_url, is_active
     FROM user_country_links
     WHERE user_id = ? AND country = ? AND is_active = 1`
  ).bind(userId, country).first<{ country: string; bot_url: string | null; is_active: number }>();
  return row ? { country: row.country, botUrl: row.bot_url, isActive: Boolean(row.is_active) } : null;
}

async function latestSubscription(env: Env, userId: string): Promise<{ status: string; currentPeriodEnd: string | null } | null> {
  const row = await env.DB.prepare(
    `SELECT status, current_period_end
     FROM subscriptions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`
  ).bind(userId).first<{ status: string; current_period_end: string | null }>();
  return row ? { status: row.status, currentPeriodEnd: row.current_period_end } : null;
}

export function isSubscriptionCurrentlyAllowed(subscription: { status: string; currentPeriodEnd: string | null } | null, now = new Date()): boolean {
  if (!subscription || !ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status as typeof ACTIVE_SUBSCRIPTION_STATUSES[number])) return false;
  if (!subscription.currentPeriodEnd) return true;
  const periodEndMs = Date.parse(subscription.currentPeriodEnd);
  return Number.isFinite(periodEndMs) && periodEndMs > now.getTime();
}

export function subscriptionAccessReason(subscription: { status: string; currentPeriodEnd: string | null } | null, now = new Date()): string {
  if (!subscription || !ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status as typeof ACTIVE_SUBSCRIPTION_STATUSES[number])) return "active_subscription_required";
  if (!subscription.currentPeriodEnd) return "active_subscription_required";
  const periodEndMs = Date.parse(subscription.currentPeriodEnd);
  return Number.isFinite(periodEndMs) && periodEndMs <= now.getTime() ? "subscription_period_expired" : "active_subscription_required";
}

async function hasActiveSubscription(env: Env, userId: string): Promise<boolean> {
  return isSubscriptionCurrentlyAllowed(await latestSubscription(env, userId));
}

async function resolveAccess(env: Env, userId: string, botUrl: string | null): Promise<{ allowed: boolean; reason: string | null; subscriptionRequired: boolean }> {
  if (!botUrl) return { allowed: false, reason: "country_bot_not_configured", subscriptionRequired: true };
  const subscribed = await hasActiveSubscription(env, userId);
  if (!subscribed) return { allowed: false, reason: "active_subscription_required", subscriptionRequired: true };
  return { allowed: true, reason: null, subscriptionRequired: true };
}

async function audit(env: Env, userId: string | null, actor: string, eventType: string, request: Request, payload: Record<string, JsonValue>): Promise<void> {
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For") ?? "unknown";
  const ipHash = await sha256(ip);
  await env.DB.prepare(
    `INSERT INTO audit_events (id, user_id, actor, event_type, ip_hash, payload_json)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(crypto.randomUUID(), userId, actor, eventType, ipHash, JSON.stringify(payload)).run();
}

async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  if (!env.ADMIN_TOKEN) return json({ error: "admin_token_not_configured" }, 503);
  const token = bearerToken(request) ?? new URL(request.url).searchParams.get("token");
  const adminUser = request.headers.get("X-Admin-User") ?? new URL(request.url).searchParams.get("adminUser");
  if (env.ADMIN_USERNAME && (!adminUser || !(await timingSafeEqual(adminUser, env.ADMIN_USERNAME)))) {
    return json({ error: "unauthorized" }, 401);
  }
  if (!token || !(await timingSafeEqual(token, env.ADMIN_TOKEN))) {
    return json({ error: "unauthorized" }, 401);
  }
  return null;
}

async function requireInternalAccess(request: Request, env: Env): Promise<Response | null> {
  if (!env.INTERNAL_API_SECRET) return json({ error: "internal_api_secret_not_configured" }, 503);
  const token = bearerToken(request);
  if (token && await timingSafeEqual(token, env.INTERNAL_API_SECRET)) return null;

  const timestamp = request.headers.get("X-Timestamp") ?? request.headers.get("X-Market-Signal-Timestamp");
  const signature = request.headers.get("X-Signature") ?? request.headers.get("X-Market-Signal-Signature");
  if (!timestamp || !signature) return json({ error: "internal_signature_required" }, 401);

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    return json({ error: "internal_timestamp_expired" }, 401);
  }

  const url = new URL(request.url);
  const canonicalQuery = canonicalSearchParams(url.searchParams);
  const expected = await hmacHex(env.INTERNAL_API_SECRET, `${timestamp}.${request.method}.${url.pathname}.${canonicalQuery}`);
  const normalizedSignature = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;
  if (!(await timingSafeEqual(normalizedSignature, expected))) return json({ error: "unauthorized" }, 401);

  return null;
}

async function requireWebhookSecret(request: Request, env: Env): Promise<Response | null> {
  if (!env.SUBSCRIPTION_WEBHOOK_SECRET) return null;
  const token = request.headers.get("X-Webhook-Secret");
  if (!token || !(await timingSafeEqual(token, env.SUBSCRIPTION_WEBHOOK_SECRET))) {
    return json({ error: "unauthorized" }, 401);
  }
  return null;
}

export async function requireWebhookSignature(request: Request, env: Env, rawBody: string): Promise<Response | null> {
  if (!env.SUBSCRIPTION_WEBHOOK_SECRET) return json({ error: "webhook_secret_not_configured" }, 503);
  const timestamp = request.headers.get("X-Timestamp") ?? request.headers.get("X-Market-Signal-Timestamp");
  const signature = request.headers.get("X-Signature") ?? request.headers.get("X-Market-Signal-Signature");
  if (!timestamp || !signature) return json({ error: "webhook_signature_required" }, 401);

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    return json({ error: "webhook_timestamp_expired" }, 401);
  }

  const expected = await hmacHex(env.SUBSCRIPTION_WEBHOOK_SECRET, `${timestamp}.${rawBody}`);
  const normalizedSignature = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;
  if (!(await timingSafeEqual(normalizedSignature, expected))) return json({ error: "unauthorized" }, 401);

  return null;
}

export async function verifyTelegramInitData(initData: string, env: Env): Promise<TelegramWebAppUser | null> {
  if (!env.TELEGRAM_BOT_TOKEN) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const authDate = Number(params.get("auth_date") ?? "0");
  if (!Number.isFinite(authDate) || Math.abs(Date.now() / 1000 - authDate) > 24 * 60 * 60) return null;

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = await hmacBytes("WebAppData", env.TELEGRAM_BOT_TOKEN);
  const expectedHash = await hmacHex(secretKey, dataCheckString);
  if (!(await timingSafeEqual(hash, expectedHash))) return null;

  const userJson = params.get("user");
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson) as TelegramWebAppUser;
    return typeof user.id === "number" ? user : null;
  } catch {
    return null;
  }
}

function buildPublicAppUrl(request: Request): string {
  const url = new URL(request.url);
  return url.origin;
}

async function sendTelegramMessage(env: Env, chatId: string | number, text: string, extra: Record<string, unknown> = {}): Promise<unknown> {
  if (!env.TELEGRAM_BOT_TOKEN) return null;
  return telegramApi(env, "sendMessage", { chat_id: chatId, text, ...extra });
}

async function telegramApi(env: Env, method: string, payload: Record<string, unknown>): Promise<unknown> {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error("Telegram bot token is not configured");

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok || !isTelegramOk(data)) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(data)}`);
  }
  return data;
}

function isTelegramOk(value: unknown): value is { ok: true; result?: unknown } {
  return typeof value === "object" && value !== null && (value as { ok?: unknown }).ok === true;
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

function canonicalSearchParams(params: URLSearchParams): string {
  return [...params.entries()]
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  if (left.byteLength !== right.byteLength) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode("market-signal-admin-compare"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const [leftMac, rightMac] = await Promise.all([
    crypto.subtle.sign("HMAC", key, left),
    crypto.subtle.sign("HMAC", key, right)
  ]);
  return constantTimeBytes(new Uint8Array(leftMac), new Uint8Array(rightMac));
}

function constantTimeBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacBytes(key: string | ArrayBuffer, value: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyBytes = typeof key === "string" ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
}

async function hmacHex(key: string | ArrayBuffer, value: string): Promise<string> {
  const signature = await hmacBytes(key, value);
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) throw new Error("Expected JSON request");
  return request.json() as Promise<T>;
}

async function readOptionalJson<T>(request: Request): Promise<T | null> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) return null;
  const rawBody = await request.text();
  if (!rawBody.trim()) return null;
  return parseJson<T>(rawBody);
}

function parseJson<T>(rawBody: string): T {
  return JSON.parse(rawBody) as T;
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 && cleaned.length <= 512 ? cleaned : null;
}

function cleanCountry(value: unknown, fallback: string): string {
  const cleaned = cleanString(value)?.toUpperCase();
  if (!cleaned || !/^[A-Z]{2}$/.test(cleaned)) return fallback.toUpperCase();
  return cleaned;
}

export function cleanCountries(value: unknown, legacyCountry: unknown, fallback: string): string[] {
  const rawValues = Array.isArray(value) ? value : [legacyCountry];
  const countries = rawValues
    .map((item) => cleanString(item)?.toUpperCase())
    .filter((item): item is string => Boolean(item && /^[A-Z]{2}$/.test(item) && AVAILABLE_NEWS_COUNTRIES.has(item)));
  const unique = [...new Set(countries)].slice(0, 10);
  const fallbackCountry = fallback.toUpperCase();
  return unique.length ? unique : [AVAILABLE_NEWS_COUNTRIES.has(fallbackCountry) ? fallbackCountry : "IL"];
}

function cleanLanguage(value: unknown, fallback: string): string {
  const cleaned = cleanString(value)?.toLowerCase();
  const allowed = new Set(LANGUAGES.map(([code]) => code));
  if (!cleaned || !/^[a-z]{2,8}$/.test(cleaned) || !allowed.has(cleaned)) return allowed.has(fallback.toLowerCase()) ? fallback.toLowerCase() : "en";
  return cleaned;
}

function cleanInternalLanguage(value: unknown): string {
  const cleaned = cleanString(value)?.toLowerCase();
  return cleaned && /^[a-z]{2,8}$/.test(cleaned) ? cleaned : "";
}

function isValidEmail(value: string): boolean {
  if (value.length > 254) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return false;
  const [local, domain] = value.split("@");
  if (!local || !domain || local.length > 64) return false;
  if (domain.includes("..")) return false;
  return domain.split(".").every((part) => /^[a-z0-9-]+$/i.test(part) && !part.startsWith("-") && !part.endsWith("-"));
}

function cleanEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function isString(value: string | null | undefined): value is string {
  return typeof value === "string";
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function withCors(request: Request, response: Response, env: Env): Response {
  const headers = new Headers(response.headers);
  const origin = allowedCorsOrigin(request, env);
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-User,X-Webhook-Secret,X-Timestamp,X-Signature,X-Market-Signal-Timestamp,X-Market-Signal-Signature");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function allowedCorsOrigin(request: Request, env: Pick<Env, "ALLOWED_ORIGINS">): string | null {
  const origin = request.headers.get("Origin");
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
  if (!allowedOrigins.length) return origin ?? "*";
  if (!origin) return null;
  return allowedOrigins.includes(origin) ? origin : null;
}

export function parseAllowedOrigins(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    }
  });
}

function renderTelegramApp(env: Env): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(env.PUBLIC_APP_NAME)}</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>${baseCss()}</style>
</head>
<body>
  <main class="shell app-shell">
    <section class="brand">
      <span class="mark">MS</span>
      <div>
        <h1>${escapeHtml(env.PUBLIC_APP_NAME)}</h1>
        <p>Account, subscription and market bot access</p>
      </div>
    </section>
    <form id="profileForm" class="panel">
      <label>Name<input name="displayName" autocomplete="name" placeholder="Your name"></label>
      <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>
      <label>Language<select name="language" id="language"></select></label>
      <fieldset>
        <legend>News countries</legend>
        <div id="countries" class="check-grid"></div>
      </fieldset>
      <button type="submit">Create account</button>
    </form>
    <section id="account" class="result" hidden></section>
    <section id="result" class="result" hidden></section>
  </main>
  <script>${telegramAppScript()}</script>
</body>
</html>`;
}

function renderAdminApp(env: Env): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(env.PUBLIC_APP_NAME)} Admin</title>
  <style>${baseCss()}</style>
</head>
<body>
  <main class="shell admin-shell">
    <section class="brand">
      <span class="mark">AD</span>
      <div>
        <h1>Admin monitoring</h1>
        <p>Private users, subscriptions and settings overview</p>
      </div>
      <button id="themeToggle" class="theme-toggle" type="button">Dark mode</button>
    </section>
    <form id="authForm" class="panel auth-row">
      <input name="username" autocomplete="username" placeholder="Admin name">
      <input name="token" type="password" autocomplete="current-password" placeholder="Admin password">
      <button type="submit">Open</button>
    </form>
    <section id="adminStatus" class="status" hidden></section>
    <div id="adminContent" hidden>
      <section class="admin-grid">
        <div class="admin-main">
          <section id="refreshInfo" class="time-strip"></section>
          <section id="overview" class="metrics"></section>
          <section class="panel">
            <h2>Subscriptions</h2>
            <div id="subscriptionChart" class="bar-chart"></div>
          </section>
          <section class="panel">
            <h2>Users</h2>
            <form id="filtersForm" class="filters-row">
              <input name="search" placeholder="Search email, Telegram ID, name">
              <input name="country" placeholder="Country">
              <select name="status">
                <option value="">Any status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
              <button type="submit">Filter</button>
            </form>
            <div id="users" class="table"></div>
            <div id="usersPager" class="pager"></div>
          </section>
          <section class="panel">
            <h2>Bot routes</h2>
            <form id="routeForm" class="route-row">
              <input name="country" placeholder="IL">
              <input name="language" placeholder="he">
              <input name="botUrl" placeholder="https://t.me/your_israel_bot">
              <label class="inline-check"><input name="isActive" type="checkbox" checked> Active</label>
              <button type="submit">Save</button>
            </form>
            <div id="routes" class="table"></div>
          </section>
        </div>
        <aside class="panel event-panel">
          <h2>Events</h2>
          <div id="events" class="events"></div>
        </aside>
      </section>
    </div>
  </main>
  <script>${adminAppScript()}</script>
</body>
</html>`;
}

function baseCss(): string {
  return `
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; color: #172026; background: #f5f7f8; }
body.dark { color: #e5edf0; background: #0f1720; }
.shell { width: min(1040px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 48px; }
.app-shell { max-width: 560px; }
.admin-shell { width: min(1440px, calc(100% - 48px)); }
.brand { display: flex; gap: 14px; align-items: center; margin-bottom: 22px; }
.mark { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 8px; background: #143c3c; color: #fff; font-weight: 800; }
h1 { margin: 0; font-size: 26px; line-height: 1.15; letter-spacing: 0; }
h2 { margin: 0 0 14px; font-size: 18px; letter-spacing: 0; }
p { margin: 4px 0 0; color: #607077; }
body.dark p { color: #9fb0b8; }
.panel, .result { background: #fff; border: 1px solid #dfe7e9; border-radius: 8px; padding: 18px; box-shadow: 0 10px 30px rgba(20, 60, 60, 0.08); }
body.dark .panel, body.dark .result { background: #17232d; border-color: #2b3b45; box-shadow: none; }
form { display: grid; gap: 14px; }
label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #34474f; }
body.dark label, body.dark legend { color: #d7e3e7; }
input, select { width: 100%; min-height: 44px; border: 1px solid #cad6da; border-radius: 6px; padding: 10px 12px; font: inherit; background: #fff; color: #172026; }
body.dark input, body.dark select { background: #0f1720; border-color: #40515c; color: #e5edf0; }
fieldset { margin: 0; border: 1px solid #cad6da; border-radius: 6px; padding: 12px; }
body.dark fieldset { border-color: #40515c; }
legend { padding: 0 4px; font-size: 13px; font-weight: 800; color: #34474f; }
button { min-height: 44px; border: 0; border-radius: 6px; padding: 0 16px; font: inherit; font-weight: 800; color: #fff; background: #0f766e; cursor: pointer; }
button:hover { background: #115e59; }
.theme-toggle { margin-left: auto; min-height: 38px; border: 1px solid #cad6da; background: #fff; color: #172026; }
.theme-toggle:hover { background: #eef4f5; }
body.dark .theme-toggle { border-color: #40515c; background: #17232d; color: #e5edf0; }
body.dark .theme-toggle:hover { background: #21313c; }
.result { margin-top: 14px; }
.result a { color: #0f766e; font-weight: 800; }
.button-link { display: inline-flex; align-items: center; min-height: 42px; margin-top: 4px; border-radius: 6px; padding: 0 14px; color: #fff !important; background: #0f766e; text-decoration: none; }
.check-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
.check-option { display: flex; align-items: center; gap: 8px; min-height: 36px; font-weight: 700; color: #172026; }
.check-option.disabled { color: #b91c1c; cursor: not-allowed; }
.check-option.disabled input { cursor: not-allowed; }
.dev-badge { margin-left: auto; border-radius: 999px; padding: 3px 7px; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 900; }
.check-option input { width: 16px; min-height: 16px; }
.link-list { display: grid; gap: 10px; margin-top: 12px; }
.link-row { display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 10px; border: 1px solid #e7edef; border-radius: 6px; }
.link-row button { min-height: 34px; padding: 0 10px; background: #7f1d1d; }
.link-row button:hover { background: #991b1b; }
.auth-row { grid-template-columns: minmax(0, 1fr) auto; margin-bottom: 18px; }
.auth-row { grid-template-columns: minmax(140px, 180px) minmax(180px, 1fr) auto; }
.status { margin: 0 0 18px; border: 1px solid #cad6da; border-radius: 8px; padding: 12px 14px; background: #fff; color: #34474f; font-weight: 700; }
body.dark .status { background: #17232d; border-color: #40515c; color: #d7e3e7; }
.status.success { border-color: #99f6e4; background: #ecfdf5; color: #115e59; }
.status.error { border-color: #fecaca; background: #fef2f2; color: #991b1b; }
.status.loading { border-color: #bfdbfe; background: #eff6ff; color: #1d4ed8; }
body.dark .status.success { border-color: #0f766e; background: #0f2f2c; color: #99f6e4; }
body.dark .status.error { border-color: #7f1d1d; background: #2d1515; color: #fecaca; }
body.dark .status.loading { border-color: #1d4ed8; background: #101f3d; color: #bfdbfe; }
.time-strip { display: flex; flex-wrap: wrap; gap: 10px 18px; margin: 0 0 18px; color: #607077; font-size: 13px; }
.time-strip strong { color: #172026; }
body.dark .time-strip { color: #9fb0b8; }
body.dark .time-strip strong { color: #e5edf0; }
.filters-row { grid-template-columns: minmax(180px, 1fr) 110px 150px auto; margin-bottom: 14px; }
.route-row { grid-template-columns: 80px 90px minmax(220px, 1fr) 110px auto; margin-bottom: 14px; }
.inline-check { display: flex; align-items: center; gap: 8px; min-height: 44px; }
.inline-check input { width: 16px; min-height: 16px; }
.admin-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; grid-template-areas: "main events"; gap: 24px; align-items: start; }
.admin-main { grid-area: main; display: grid; gap: 18px; min-width: 0; }
.admin-main > .panel, .admin-main > .metrics, .admin-main > .time-strip { min-width: 0; max-width: 100%; }
.event-panel { grid-area: events; position: sticky; top: 18px; width: 340px; max-width: 340px; max-height: calc(100vh - 36px); overflow: auto; }
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px; }
.metric { background: #fff; border: 1px solid #dfe7e9; border-radius: 8px; padding: 16px; }
body.dark .metric { background: #17232d; border-color: #2b3b45; }
.metric strong { display: block; font-size: 28px; }
.bar-chart { display: grid; grid-template-columns: repeat(14, minmax(18px, 1fr)); gap: 8px; align-items: end; min-height: 180px; }
.bar-item { display: grid; gap: 6px; align-items: end; min-width: 0; }
.bar-track { display: flex; align-items: end; height: 130px; border-radius: 6px; background: #edf4f5; overflow: hidden; }
.bar-fill { width: 100%; min-height: 4px; border-radius: 6px 6px 0 0; background: #0f766e; }
.bar-label, .bar-value { font-size: 11px; color: #607077; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-value { color: #172026; font-weight: 800; }
body.dark .bar-track { background: #0f1720; }
body.dark .bar-label { color: #9fb0b8; }
body.dark .bar-value { color: #e5edf0; }
.table { max-width: 100%; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e7edef; white-space: nowrap; }
th { color: #607077; font-size: 12px; }
body.dark th, body.dark td { border-bottom-color: #2b3b45; }
body.dark th { color: #9fb0b8; }
.editable-table input, .editable-table select { min-height: 34px; min-width: 110px; padding: 6px 8px; font-size: 13px; }
.editable-table .email-input { min-width: 190px; }
.editable-table .name-input { min-width: 140px; }
.editable-table button { min-height: 34px; padding: 0 10px; }
.danger-button { background: #7f1d1d; }
.danger-button:hover { background: #991b1b; }
.pager { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 14px; color: #607077; font-size: 13px; }
.pager-actions { display: flex; gap: 8px; }
.pager button { min-height: 34px; padding: 0 12px; }
.pager button:disabled { opacity: 0.45; cursor: not-allowed; }
body.dark .pager { color: #9fb0b8; }
.events { display: grid; gap: 8px; font-size: 13px; }
.event { border-bottom: 1px solid #e7edef; padding: 8px 0; }
body.dark .event { border-bottom-color: #2b3b45; }
@media (max-width: 980px) { .admin-grid { grid-template-columns: 1fr; grid-template-areas: "main" "events"; } .event-panel { position: static; width: auto; max-width: none; max-height: none; } }
@media (max-width: 860px) { .metrics, .auth-row, .filters-row, .route-row { grid-template-columns: 1fr; } }
`;
}

function telegramAppScript(): string {
  return `
const tg = window.Telegram?.WebApp;
tg?.ready();
const form = document.querySelector("#profileForm");
const result = document.querySelector("#result");
const account = document.querySelector("#account");
const language = document.querySelector("#language");
const countries = document.querySelector("#countries");
const telegramUser = tg?.initDataUnsafe?.user;
let appConfig = null;
let currentUserId = localStorage.getItem("marketSignalUserId") || "";

async function boot() {
  const config = await fetch("/api/config").then((response) => response.json());
  appConfig = config;
  language.innerHTML = config.languages.map((item) => '<option value="' + item.code + '">' + item.name + '</option>').join("");
  countries.innerHTML = config.countries.map((item) => {
    const disabled = item.isAvailable ? "" : " disabled";
    const className = item.isAvailable ? "check-option" : "check-option disabled";
    const badge = item.isComingSoon ? '<span class="dev-badge">In development</span>' : "";
    return '<label class="' + className + '"><input type="checkbox" name="countries" value="' + item.code + '"' + disabled + '> ' + item.name + badge + '</label>';
  }).join("");
  language.value = "he";
  const defaultCountry = countries.querySelector('input[value="' + config.defaultCountry.toUpperCase() + '"]');
  if (defaultCountry) defaultCountry.checked = true;
  if (currentUserId) await loadAccount(currentUserId);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.countries = [...form.querySelectorAll('input[name="countries"]:checked')].map((input) => input.value);
  data.language = selectedPrimaryLanguage(data.countries);
  data.initData = tg?.initData || "";
  if (!data.displayName && telegramUser) data.displayName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ");
  if (!isValidEmail(data.email)) {
    result.hidden = false;
    result.textContent = "Please enter a valid email address.";
    return;
  }
  if (!data.countries.length) {
    result.hidden = false;
    result.textContent = "Choose at least one news country.";
    return;
  }

  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const payload = await response.json();
  result.hidden = false;
  if (!response.ok) {
    result.textContent = payload.error === "valid_email_required" ? "Please enter a valid email address." : "Could not create account. Please check your details.";
    return;
  }
  currentUserId = payload.userId;
  localStorage.setItem("marketSignalUserId", currentUserId);
  result.innerHTML = renderCountryLinks(payload.countryLinks);
  renderAccount(payload.countryLinks);
});

account.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-country]");
  if (!button || !currentUserId) return;
  const response = await fetch("/api/account/countries", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: currentUserId, country: button.dataset.country })
  });
  const payload = await response.json();
  if (!response.ok) {
    result.hidden = false;
    result.textContent = "Could not remove this country.";
    return;
  }
  renderAccount(payload.countryLinks);
  result.hidden = false;
  result.innerHTML = renderCountryLinks(payload.countryLinks);
});

async function loadAccount(userId) {
  const response = await fetch("/api/account?userId=" + encodeURIComponent(userId));
  if (!response.ok) return;
  const payload = await response.json();
  renderAccount(payload.countryLinks);
}

function renderLockedAccess(payload) {
  if (payload.access?.reason === "country_bot_not_configured") {
    return '<strong>Account is ready.</strong><p>The country bot is not active yet. You will see the link here after it is configured.</p>';
  }
  const checkoutUrl = appConfig?.subscriptionCheckoutUrl;
  const checkout = checkoutUrl
    ? '<p><a class="button-link" href="' + escapeText(appendCheckoutParam(checkoutUrl, payload.userId)) + '">Create subscription</a></p>'
    : '';
  return '<strong>Account is ready.</strong><p>Create or activate a subscription to unlock your country bot.</p>' + checkout;
}

function renderCountryLinks(links = []) {
  if (!links.length) return '<strong>Account is ready.</strong><p>No country chats are linked yet.</p>';
  return '<strong>Account is ready.</strong><p>Your news chats:</p><div class="link-list">' + links.map((link) => {
    const url = link.botUrl;
    return '<div class="link-row"><span>' + escapeText(link.country) + '</span>' + (url ? '<a href="' + escapeText(url) + '">' + escapeText(url) + '</a>' : '<span>Chat is not configured yet</span>') + '</div>';
  }).join("") + '</div>';
}

function renderAccount(links = []) {
  account.hidden = false;
  account.innerHTML = '<strong>Linked news chats</strong><div class="link-list">' + (links.length ? links.map((link) => (
    '<div class="link-row"><span>' + escapeText(link.country) + '</span><button type="button" data-country="' + escapeText(link.country) + '">Remove</button></div>'
  )).join("") : '<p>No linked chats.</p>') + '</div>';
}

function selectedPrimaryLanguage(countryCodes) {
  const first = countryCodes[0];
  const option = appConfig?.countries?.find((item) => item.code === first);
  return option?.language || "he";
}

function isValidEmail(value) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(String(value || "").trim());
}

function appendCheckoutParam(checkoutUrl, userId) {
  const separator = checkoutUrl.includes("?") ? "&" : "?";
  return checkoutUrl + separator + "userId=" + encodeURIComponent(userId);
}

function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

boot().catch(() => {
  result.hidden = false;
  result.textContent = "Could not load app settings.";
});
`;
}

function adminAppScript(): string {
  return `
const authForm = document.querySelector("#authForm");
const themeToggle = document.querySelector("#themeToggle");
const filtersForm = document.querySelector("#filtersForm");
const routeForm = document.querySelector("#routeForm");
const adminContent = document.querySelector("#adminContent");
const adminStatus = document.querySelector("#adminStatus");
const refreshInfo = document.querySelector("#refreshInfo");
const overview = document.querySelector("#overview");
const subscriptionChart = document.querySelector("#subscriptionChart");
const users = document.querySelector("#users");
const usersPager = document.querySelector("#usersPager");
const events = document.querySelector("#events");
const routes = document.querySelector("#routes");
let token = sessionStorage.getItem("adminToken") || "";
let adminUser = sessionStorage.getItem("adminUser") || "";
let usersPage = 1;
let theme = localStorage.getItem("adminTheme") || "light";
applyTheme(theme);
if (adminUser) authForm.elements.username.value = adminUser;
if (token) authForm.elements.token.value = token;
if (token) load();

themeToggle.addEventListener("click", () => {
  theme = document.body.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem("adminTheme", theme);
  applyTheme(theme);
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  adminUser = new FormData(authForm).get("username");
  token = new FormData(authForm).get("token");
  sessionStorage.setItem("adminUser", adminUser);
  sessionStorage.setItem("adminToken", token);
  load();
});

filtersForm.addEventListener("submit", (event) => {
  event.preventDefault();
  usersPage = 1;
  load();
});

usersPager.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (!button || button.disabled) return;
  usersPage = Number(button.dataset.page);
  load();
});

routeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Saving bot route...", "loading");
  try {
    const data = Object.fromEntries(new FormData(routeForm).entries());
    data.isActive = routeForm.elements.isActive.checked;
    await api("/api/admin/bot-routes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    routeForm.reset();
    routeForm.elements.isActive.checked = true;
    await load("Bot route saved.");
  } catch (error) {
    setStatus(error.message || "Could not save bot route.", "error");
  }
});

users.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-user-id]");
  if (!button) return;
  const row = button.closest("tr");
  const data = {
    userId: button.dataset.userId,
    email: row.querySelector('[name="email"]').value,
    displayName: row.querySelector('[name="displayName"]').value,
    language: row.querySelector('[name="language"]').value,
    country: row.querySelector('[name="country"]').value,
    status: row.querySelector('[name="status"]').value
  };
  setStatus("Saving user...", "loading");
  try {
    await api("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    await load("User saved.");
  } catch (error) {
    setStatus(error.message || "Could not save user.", "error");
  }
});

routes.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-route-action]");
  if (!button) return;
  const row = button.closest("tr");
  const country = button.dataset.country || row.querySelector('[name="country"]')?.value;
  if (button.dataset.routeAction === "save") {
    const data = {
      country: row.querySelector('[name="country"]').value,
      previousCountry: button.dataset.country,
      language: row.querySelector('[name="language"]').value,
      botUrl: row.querySelector('[name="botUrl"]').value,
      isActive: row.querySelector('[name="isActive"]').checked
    };
    setStatus("Saving bot route...", "loading");
    try {
      await api("/api/admin/bot-routes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      await load("Bot route saved.");
    } catch (error) {
      setStatus(error.message || "Could not save bot route.", "error");
    }
    return;
  }
  if (button.dataset.routeAction === "delete") {
    setStatus("Deleting bot route...", "loading");
    try {
      await api("/api/admin/bot-routes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country })
      });
      await load("Bot route deleted.");
    } catch (error) {
      setStatus(error.message || "Could not delete bot route.", "error");
    }
  }
});

function applyTheme(nextTheme) {
  document.body.classList.toggle("dark", nextTheme === "dark");
  themeToggle.textContent = nextTheme === "dark" ? "Light mode" : "Dark mode";
}

async function api(path, options = {}) {
  const headers = { Authorization: "Bearer " + token, "X-Admin-User": adminUser, ...(options.headers || {}) };
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    let message = "Request failed.";
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

async function load(successMessage = "Admin panel loaded.") {
  setStatus("Loading admin panel...", "loading");
  try {
    const query = new URLSearchParams(new FormData(filtersForm));
    query.set("page", String(usersPage));
    query.set("limit", "25");
    const [summary, userData, eventData, routeData] = await Promise.all([
      api("/api/admin/overview"),
      api("/api/admin/users?" + query.toString()),
      api("/api/admin/events"),
      api("/api/admin/bot-routes")
    ]);
    adminContent.hidden = false;
    overview.innerHTML = [
      metric("Users", summary.users),
      metric("Active subscriptions", summary.activeSubscriptions),
      metric("Events 24h", summary.events24h),
      metric("Active bot routes", summary.activeBotRoutes),
      metric("Server time", formatTime(summary.serverTime))
    ].join("");
    subscriptionChart.innerHTML = renderSubscriptionChart(summary.subscriptionSeries || []);
    refreshInfo.innerHTML = '<span><strong>Server:</strong> ' + formatTime(summary.serverTime) + '</span><span><strong>Local:</strong> ' + formatTime(new Date().toISOString()) + '</span><span><strong>Refreshed:</strong> ' + new Date().toLocaleString() + '</span>';
    users.innerHTML = renderUsers(userData.users);
    usersPager.innerHTML = renderPager(userData.pagination);
    routes.innerHTML = renderRoutes(routeData.routes);
    events.innerHTML = eventData.events.map((event) => '<div class="event"><strong>' + escapeText(event.event_type) + '</strong><br>' + escapeText(event.actor) + ' - ' + escapeText(event.created_at) + '</div>').join("");
    setStatus(successMessage, "success");
  } catch (error) {
    adminContent.hidden = true;
    setStatus(error.message === "unauthorized" ? "Wrong admin name or password." : error.message, "error");
  }
}

function setStatus(message, type) {
  adminStatus.hidden = false;
  adminStatus.className = "status " + type;
  adminStatus.textContent = message;
}

function metric(label, value) {
  return '<div class="metric"><strong>' + value + '</strong><span>' + label + '</span></div>';
}

function formatTime(value) {
  return new Date(value).toLocaleString();
}

function renderSubscriptionChart(series) {
  const max = Math.max(...series.map((item) => item.count), 1);
  return series.map((item) => {
    const height = Math.max((item.count / max) * 100, item.count ? 8 : 3);
    const label = item.day.slice(5);
    return '<div class="bar-item"><div class="bar-value">' + escapeText(item.count) + '</div><div class="bar-track"><div class="bar-fill" style="height:' + height + '%"></div></div><div class="bar-label">' + escapeText(label) + '</div></div>';
  }).join("");
}

function renderPager(pagination) {
  if (!pagination) return "";
  const previousPage = Math.max(pagination.page - 1, 1);
  const nextPage = Math.min(pagination.page + 1, pagination.totalPages);
  const start = pagination.total ? ((pagination.page - 1) * pagination.limit) + 1 : 0;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);
  return '<span>Showing ' + start + '-' + end + ' of ' + pagination.total + '</span><div class="pager-actions">' +
    '<button type="button" data-page="' + previousPage + '"' + (pagination.page <= 1 ? " disabled" : "") + '>Previous</button>' +
    '<button type="button" data-page="' + nextPage + '"' + (pagination.page >= pagination.totalPages ? " disabled" : "") + '>Next</button>' +
    '</div>';
}

function renderUsers(rows) {
  return '<table class="editable-table"><thead><tr><th>Email</th><th>Name</th><th>Country</th><th>Language</th><th>Status</th><th>Subscription</th><th>Telegram</th><th>Created</th><th></th></tr></thead><tbody>' +
    rows.map((row) => '<tr>' +
      '<td><input class="email-input" name="email" type="email" value="' + escapeText(row.email || "") + '"></td>' +
      '<td><input class="name-input" name="displayName" value="' + escapeText(row.display_name || "") + '"></td>' +
      '<td><input name="country" value="' + escapeText(row.country || "IL") + '"></td>' +
      '<td><select name="language">' + renderOption("en", "English", row.language) + renderOption("ru", "Russian", row.language) + renderOption("he", "Hebrew", row.language) + '</select></td>' +
      '<td><select name="status">' + renderOption("active", "Active", row.status) + renderOption("blocked", "Blocked", row.status) + '</select></td>' +
      '<td>' + escapeText(row.subscription_status || "none") + '</td>' +
      '<td>' + escapeText(row.telegram_user_id || "") + '</td>' +
      '<td>' + escapeText(row.created_at) + '</td>' +
      '<td><button type="button" data-user-id="' + escapeText(row.id) + '">Save</button></td>' +
    '</tr>').join("") +
    '</tbody></table>';
}

function renderOption(value, label, selectedValue) {
  return '<option value="' + escapeText(value) + '"' + (value === selectedValue ? " selected" : "") + '>' + escapeText(label) + '</option>';
}

function renderRoutes(rows) {
  return '<table class="editable-table"><thead><tr><th>Country</th><th>Language</th><th>Bot URL</th><th>Active</th><th>Updated</th><th></th><th></th></tr></thead><tbody>' +
    rows.map((row) => '<tr>' +
      '<td><input name="country" value="' + escapeText(row.country) + '"></td>' +
      '<td><select name="language">' + renderOption("en", "English", row.language) + renderOption("ru", "Russian", row.language) + renderOption("he", "Hebrew", row.language) + '</select></td>' +
      '<td><input name="botUrl" value="' + escapeText(row.bot_url) + '"></td>' +
      '<td><label class="inline-check"><input name="isActive" type="checkbox"' + (row.is_active ? " checked" : "") + '> Active</label></td>' +
      '<td>' + escapeText(row.updated_at) + '</td>' +
      '<td><button type="button" data-route-action="save" data-country="' + escapeText(row.country) + '">Save</button></td>' +
      '<td><button class="danger-button" type="button" data-route-action="delete" data-country="' + escapeText(row.country) + '">Delete</button></td>' +
    '</tr>').join("") +
    '</tbody></table>';
}

function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char];
  });
}
