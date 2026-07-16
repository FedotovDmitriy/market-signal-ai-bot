export interface Env {
  DB: D1Database;
  EMAIL?: SendEmail;
  ENVIRONMENT: string;
  PUBLIC_APP_NAME: string;
  DEFAULT_LOCALE: string;
  DEFAULT_COUNTRY: string;
  ALLOWED_ORIGINS?: string;
  ADMIN_USERNAME?: string;
  ADMIN_TOKEN?: string;
  INTERNAL_API_SECRET?: string;
  INTERNAL_API_KEY_ID?: string;
  INTERNAL_API_SECRETS_JSON?: string;
  INTERNAL_API_SCOPES_JSON?: string;
  INTERNAL_API_SECRET_MATCHER_DEV_V1?: string;
  INTERNAL_API_SECRET_WEBSITE_DEV_V1?: string;
  API_KEY_HASH_SECRET?: string;
  EMAIL_VERIFICATION_SECRET?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  SUBSCRIPTION_WEBHOOK_SECRET?: string;
  ALLOW_UNVERIFIED_TELEGRAM?: string;
  SUBSCRIPTION_CHECKOUT_URL?: string;
  SUBSCRIPTION_PORTAL_URL?: string;
  CF_VERSION_METADATA?: {
    id?: string;
    tag?: string;
    timestamp?: string;
  };
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type AppUser = {
  id: string;
  telegram_user_id: string | null;
  email: string | null;
  email_verified_at: string | null;
  pending_email: string | null;
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

type ApiKeyRecord = {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  scopes_json: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  hash_version?: string;
};

type ApiKeyIdentity = {
  id: string;
  userId: string;
  scopes: string[];
};

type AnalysisRequestInput = {
  userId?: string;
  telegramUserId?: string;
  email?: string;
  apiKeyId?: string;
  requestId?: string;
  source?: string;
  country?: string;
  language?: string;
  status?: string;
  tickers?: unknown[];
  request?: Record<string, JsonValue>;
  response?: Record<string, JsonValue>;
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
    chat?: { id: number | string; type?: string };
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

type AuthenticatedSession = {
  user: AppUser;
  sessionId: string;
  csrfTokenHash: string;
};

type ScannerAccessCheckRequest = {
  contractVersion: "1.1";
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

type QuotaDecisionV11 =
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

type QuotaDecisionRowV11 = {
  request_id: string;
  ticker: string;
  payload_hash: string;
  report_type: "regular" | "fundrep";
  allowed: number;
  charge_credits: number;
  quota_decision: QuotaDecisionV11 | "pending" | "approved_unsettled";
  effective_cache_status: "hit" | "miss" | "bypass";
  report_source: "new_analysis" | "cache" | "own_repeat" | "none";
  remaining_credits: number | null;
  cache_receipt_id: string | null;
  cache_entry_id: string | null;
  reason: string | null;
};

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

type InternalScope =
  | "matcher:access"
  | "matcher:deliver"
  | "scanner:access"
  | "scanner:cache"
  | "scanner:history"
  | "website:subscriptions";

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

type DeliveryLedgerRow = {
  delivery_id: string;
  request_id: string;
  payload_hash: string;
  status: "pending" | "sending" | "sent" | "failed" | "indeterminate" | "access_denied";
  telegram_message_id: string | null;
  failure_reason: string | null;
  sent_at: string | null;
};

const ACTIVE_SUBSCRIPTION_STATUSES = ["trialing", "active"] as const;
const SESSION_COOKIE_NAME = "ms_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const API_KEY_SCOPES = ["analysis:read", "analysis:write"] as const;
const PERSONAL_ANALYSIS_PLANS = ["pro", "premium"] as const;
const EMAIL_VERIFICATION_TTL_MINUTES = 15;
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

function logInternalAccessDiagnostic(request: Request, env: Env, matchedHandler: string): void {
  const url = new URL(request.url);
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: request.method,
    pathname: url.pathname,
    requestId: cleanString(request.headers.get("X-Request-Id")) ?? "",
    keyId: cleanString(request.headers.get("X-Key-Id") ?? request.headers.get("X-Market-Signal-Key-Id")) ?? "",
    deploymentVersionId: cleanString(env.CF_VERSION_METADATA?.id) ?? cleanString(env.ENVIRONMENT) ?? "unknown",
    matchedHandler
  }));
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (request.method === "OPTIONS") {
        return withCors(request, new Response(null, { status: 204 }), env);
      }

      const rateLimit = await maybeRateLimit(request, env, url);
      if (rateLimit) return withCors(request, rateLimit, env);

      const marketingPage = pageForPath(url.pathname);
      if (marketingPage) {
        return htmlResponse(renderSaasPage(env, marketingPage));
      }

      if (url.pathname === "/telegram") {
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

      if (url.pathname === "/api/auth/email/request" && request.method === "POST") {
        return withCors(request, await requestEmailVerification(request, env, ctx), env);
      }

      if (url.pathname === "/api/auth/email/verify" && (request.method === "POST" || request.method === "GET")) {
        return withCors(request, await verifyEmailToken(request, env, ctx), env);
      }

      if (url.pathname === "/api/session/bootstrap" && request.method === "POST") {
        return withCors(request, await bootstrapSession(request, env, ctx), env);
      }

      if (url.pathname === "/api/session/csrf" && (request.method === "GET" || request.method === "POST")) {
        return withCors(request, await refreshCsrfToken(request, env, ctx), env);
      }

      if (url.pathname === "/api/settings" && request.method === "PUT") {
        return withCors(request, await updateSettings(request, env, ctx), env);
      }

      if (url.pathname === "/api/account" && request.method === "GET") {
        return withCors(request, await accountDetails(request, env), env);
      }

      if (url.pathname === "/api/account/countries" && request.method === "DELETE") {
        return withCors(request, await deleteCountryLink(request, env, ctx), env);
      }

      if (url.pathname === "/api/me" && request.method === "GET") {
        return withCors(request, await userDashboard(request, env), env);
      }

      if (url.pathname === "/api/me/profile" && request.method === "PUT") {
        return withCors(request, await updateUserProfile(request, env, ctx), env);
      }

      if (url.pathname === "/api/me/subscription" && request.method === "GET") {
        return withCors(request, await userSubscription(request, env), env);
      }

      if (url.pathname === "/api/me/subscription/checkout" && request.method === "POST") {
        return withCors(request, await createSubscriptionCheckout(request, env, ctx), env);
      }

      if (url.pathname === "/api/me/subscription/portal" && request.method === "POST") {
        return withCors(request, await createSubscriptionPortal(request, env, ctx), env);
      }

      if (url.pathname === "/api/me/api-keys" && request.method === "GET") {
        return withCors(request, await userApiKeys(request, env), env);
      }

      if (url.pathname === "/api/me/api-keys" && request.method === "POST") {
        return withCors(request, await createUserApiKey(request, env, ctx), env);
      }

      if (url.pathname === "/api/me/api-keys/rotate" && request.method === "POST") {
        return withCors(request, await rotateUserApiKey(request, env, ctx), env);
      }

      if (url.pathname === "/api/me/api-keys" && request.method === "DELETE") {
        return withCors(request, await revokeUserApiKey(request, env, ctx), env);
      }

      if (url.pathname === "/api/me/analysis-history" && request.method === "GET") {
        return withCors(request, await userAnalysisHistory(request, env), env);
      }

      if (url.pathname === "/api/me/analysis-requests" && request.method === "POST") {
        return withCors(request, await createUserAnalysisRequest(request, env, ctx), env);
      }

      if (url.pathname === "/api/analysis/requests" && request.method === "POST") {
        return withCors(request, await createApiAnalysisRequest(request, env, ctx), env);
      }

      if (url.pathname === "/api/subscriptions" && request.method === "POST") {
        return withCors(request, await acceptSubscription(request, env, ctx), env);
      }

      if (url.pathname === "/api/internal/subscriptions" && request.method === "POST") {
        const rawBody = await request.text();
        const guard = await requireInternalAccess(request, env, rawBody, "website:subscriptions");
        if (guard) return guard;
        return await processSubscriptionEvent(request, env, ctx, rawBody);
      }

      if (url.pathname === "/api/internal/access" && request.method === "GET") {
        const guard = await requireInternalAccess(request, env, "", "matcher:access");
        if (guard) return guard;
        return await internalAccess(url, env);
      }

      if ((url.pathname === "/api/internal/access/check" || url.pathname === "/api/internal/access/check/") && request.method === "POST") {
        const rawBody = await request.text();
        logInternalAccessDiagnostic(request, env, "internal_access_check.matched");
        const guard = await requireInternalAccess(request, env, rawBody, "scanner:access");
        if (guard) {
          logInternalAccessDiagnostic(request, env, "internal_access_check.hmac_rejected");
          return guard;
        }
        logInternalAccessDiagnostic(request, env, "internal_access_check.hmac_validated");
        const response = await scannerAccessCheck(rawBody, env);
        logInternalAccessDiagnostic(request, env, "scannerAccessCheck");
        return response;
      }

      if (url.pathname === "/api/internal/access/cache/commit" && request.method === "POST") {
        const rawBody = await request.text();
        logInternalAccessDiagnostic(request, env, "internal_access_cache_commit.matched");
        const guard = await requireInternalAccess(request, env, rawBody, "scanner:cache");
        if (guard) {
          logInternalAccessDiagnostic(request, env, "internal_access_cache_commit.hmac_rejected");
          return guard;
        }
        logInternalAccessDiagnostic(request, env, "internal_access_cache_commit.hmac_validated");
        const response = await commitScannerCache(rawBody, env);
        logInternalAccessDiagnostic(request, env, "commitScannerCache");
        return response;
      }

      if (url.pathname === "/api/internal/deliver" && request.method === "POST") {
        const rawBody = await request.text();
        const guard = await requireInternalAccess(request, env, rawBody, "matcher:deliver");
        if (guard) return guard;
        return await internalDeliver(request, rawBody, env, ctx);
      }

      if (url.pathname === "/api/internal/analysis-requests" && request.method === "POST") {
        const rawBody = await request.text();
        const guard = await requireInternalAccess(request, env, rawBody, "scanner:history");
        if (guard) return guard;
        return withCors(request, await recordAnalysisRequest(request, env, ctx, rawBody), env);
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

      if (url.pathname === "/api/admin/subscriptions" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await adminSubscriptions(env, url), env);
      }

      if (url.pathname === "/api/admin/api-usage" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await adminApiUsage(env, url), env);
      }

      if (url.pathname === "/api/admin/channels" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(request, guard, env);
        return withCors(request, await adminChannels(env), env);
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
  if (!email || !isValidEmail(email)) return json({ error: "valid_email_required" }, 400);

  // An email address is not an identity until a verification provider proves ownership.
  // Keep email-only signup closed rather than issuing a session to an arbitrary address.
  if (!telegramUser) {
    return json({
      error: "email_verification_required",
      emailVerificationRequired: true,
      accountCreated: false
    }, 403);
  }

  const telegramName = telegramUser ? [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ") : null;
  const displayName = cleanString(body.displayName) ?? telegramName ?? null;
  const language = cleanLanguage(body.language, telegramUser?.language_code ?? env.DEFAULT_LOCALE);
  const countries = cleanCountries(body.countries, body.country, env.DEFAULT_COUNTRY);
  const country = countries[0];

  const existing = await findUser(env, { telegramUserId });
  const userId = existing?.id ?? crypto.randomUUID();
  const countryLinks = await buildCountryLinks(env, countries);
  const primaryBotUrl = countryLinks[0]?.botUrl ?? null;
  const access = await resolveAccess(env, userId, primaryBotUrl);

  if (existing) {
    await env.DB.prepare(
      `UPDATE users
       SET pending_email = CASE WHEN email = ? THEN NULL ELSE ? END,
           display_name = COALESCE(?, display_name),
           language = ?,
           country = ?,
           selected_bot_url = ?,
           updated_at = CURRENT_TIMESTAMP,
           last_seen_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(email, email, displayName, language, country, primaryBotUrl, userId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO users (id, telegram_user_id, email, pending_email, display_name, language, country, selected_bot_url, last_seen_at)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(userId, telegramUserId, email, displayName, language, country, primaryBotUrl).run();
  }

  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, language, country)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, country = excluded.country, updated_at = CURRENT_TIMESTAMP`
  ).bind(userId, language, country).run();

  await replaceCountryLinks(env, userId, countryLinks);
  await persistLegalAcceptances(env, userId, body);
  const session = await createUserSession(env, userId);

  ctx.waitUntil(audit(env, userId, "user", "user.registered", request, { countries, language }));

  return jsonWithHeaders(
    {
      userId,
      botUrl: primaryBotUrl,
      countryLinks,
      access,
      status: "active",
      identityProvider: "telegram",
      emailVerificationRequired: existing?.email !== email || !existing?.email_verified_at,
      csrfToken: session.csrfToken
    },
    { "Set-Cookie": session.cookie }
  );
}

export async function requestEmailVerification(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.EMAIL || !env.EMAIL_FROM || !env.EMAIL_VERIFICATION_SECRET || env.EMAIL_VERIFICATION_SECRET.length < 32) {
    return json({ error: "email_verification_not_configured" }, 503);
  }

  const body = await readJson<Record<string, unknown>>(request);
  const email = cleanString(body.email)?.toLowerCase() ?? "";
  if (!isValidEmail(email)) return json({ error: "valid_email_required" }, 400);

  const session = await optionalSession(request, env);
  const token = randomSecret(32);
  const tokenHash = await hmacHex(env.EMAIL_VERIFICATION_SECRET, token);
  const verificationId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000).toISOString();
  const countries = cleanCountries(body.countries, body.country, env.DEFAULT_COUNTRY);
  const payload = {
    displayName: cleanString(body.displayName),
    language: cleanLanguage(body.language, env.DEFAULT_LOCALE),
    countries,
    acceptances: Array.isArray(body.acceptances) ? body.acceptances.slice(0, 20) : []
  };

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE email_verifications
       SET consumed_at = CURRENT_TIMESTAMP
       WHERE email = ? AND consumed_at IS NULL`
    ).bind(email),
    env.DB.prepare(
      `INSERT INTO email_verifications
       (id, user_id, email, token_hash, purpose, payload_json, expires_at)
       VALUES (?, ?, ?, ?, 'signup_or_login', ?, ?)`
    ).bind(verificationId, session?.user.id ?? null, email, tokenHash, JSON.stringify(payload), expiresAt)
  ]);

  const verificationUrl = new URL("/api/auth/email/verify", request.url);
  verificationUrl.searchParams.set("token", token);
  const from = { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME ?? env.PUBLIC_APP_NAME };
  const subject = `Confirm your email for ${env.PUBLIC_APP_NAME}`;
  const text = `Confirm your email by opening this link within ${EMAIL_VERIFICATION_TTL_MINUTES} minutes:\n\n${verificationUrl.toString()}\n\nIf you did not request this, ignore this email.`;
  const html = `<p>Confirm your email for <strong>${escapeHtml(env.PUBLIC_APP_NAME)}</strong>.</p><p><a href="${escapeHtml(verificationUrl.toString())}">Confirm email</a></p><p>This link expires in ${EMAIL_VERIFICATION_TTL_MINUTES} minutes. If you did not request it, ignore this email.</p>`;

  try {
    await env.EMAIL.send({ to: email, from, subject, text, html });
  } catch {
    await env.DB.prepare("DELETE FROM email_verifications WHERE id = ? AND consumed_at IS NULL").bind(verificationId).run();
    return json({ error: "email_delivery_failed" }, 503);
  }

  ctx.waitUntil(audit(env, session?.user.id ?? null, "user", "email.verification_requested", request, { emailDomain: email.split("@")[1] }));
  return json({ accepted: true, expiresInSeconds: EMAIL_VERIFICATION_TTL_MINUTES * 60 }, 202);
}

export async function verifyEmailToken(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.EMAIL_VERIFICATION_SECRET || env.EMAIL_VERIFICATION_SECRET.length < 32) {
    return json({ error: "email_verification_not_configured" }, 503);
  }

  const token = request.method === "GET"
    ? cleanString(new URL(request.url).searchParams.get("token"))
    : cleanString((await readJson<Record<string, unknown>>(request)).token);
  if (!token || token.length < 32 || token.length > 256) return json({ error: "invalid_email_verification_token" }, 400);

  const tokenHash = await hmacHex(env.EMAIL_VERIFICATION_SECRET, token);
  const verification = await env.DB.prepare(
    `SELECT id, user_id, email, payload_json, expires_at, consumed_at
     FROM email_verifications WHERE token_hash = ?`
  ).bind(tokenHash).first<{
    id: string;
    user_id: string | null;
    email: string;
    payload_json: string;
    expires_at: string;
    consumed_at: string | null;
  }>();
  if (!verification || verification.consumed_at || Date.parse(verification.expires_at) <= Date.now()) {
    return json({ error: "email_verification_expired_or_used" }, 410);
  }

  const owner = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(verification.email).first<{ id: string }>();
  if (verification.user_id && owner && owner.id !== verification.user_id) {
    return json({ error: "email_already_in_use" }, 409);
  }

  const claim = await env.DB.prepare(
    `UPDATE email_verifications SET consumed_at = CURRENT_TIMESTAMP
     WHERE id = ? AND consumed_at IS NULL AND expires_at > CURRENT_TIMESTAMP`
  ).bind(verification.id).run();
  if ((claim.meta?.changes ?? 0) !== 1) return json({ error: "email_verification_expired_or_used" }, 410);

  const saved = parseJsonSafe<Record<string, unknown>>(verification.payload_json, {});
  const language = cleanLanguage(saved.language, env.DEFAULT_LOCALE);
  const countries = cleanCountries(saved.countries, null, env.DEFAULT_COUNTRY);
  const country = countries[0];
  const displayName = cleanString(saved.displayName);
  const userId = verification.user_id ?? owner?.id ?? crypto.randomUUID();
  const existingUser = await findUserById(env, userId);

  if (existingUser) {
    await env.DB.prepare(
      `UPDATE users SET email = ?, email_verified_at = CURRENT_TIMESTAMP, pending_email = NULL,
       display_name = COALESCE(?, display_name), language = ?, country = ?, status = 'active',
       updated_at = CURRENT_TIMESTAMP, last_seen_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(verification.email, displayName, language, country, userId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO users
       (id, email, email_verified_at, display_name, language, country, status, last_seen_at)
       VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`
    ).bind(userId, verification.email, displayName, language, country).run();
  }

  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, language, country)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, country = excluded.country, updated_at = CURRENT_TIMESTAMP`
  ).bind(userId, language, country).run();
  const countryLinks = await buildCountryLinks(env, countries);
  await replaceCountryLinks(env, userId, countryLinks);
  await persistLegalAcceptances(env, userId, saved);

  const activeSubscription = await env.DB.prepare(
    `SELECT id FROM subscriptions
     WHERE user_id = ? AND status IN ('trialing', 'active')
       AND (current_period_end IS NULL OR current_period_end > CURRENT_TIMESTAMP)
     LIMIT 1`
  ).bind(userId).first<{ id: string }>();
  if (!activeSubscription) {
    await env.DB.prepare(
      `INSERT INTO subscriptions
       (id, user_id, provider, external_id, plan, status, current_period_end, metadata_json, updated_at)
       VALUES (?, ?, 'core', ?, 'beta', 'active', NULL, '{"free":true,"source":"email_verification"}', CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET status = 'active', plan = 'beta', current_period_end = NULL, updated_at = CURRENT_TIMESTAMP`
    ).bind(`beta_${userId}`, userId, `beta_${userId}`).run();
  }

  const session = await createUserSession(env, userId);
  ctx.waitUntil(audit(env, userId, "user", "email.verified", request, { emailDomain: verification.email.split("@")[1], plan: "beta" }));

  if (request.method === "GET") {
    return new Response(null, { status: 303, headers: { Location: "/dashboard", "Set-Cookie": session.cookie } });
  }
  return jsonWithHeaders({ verified: true, userId, plan: "beta", countryLinks, csrfToken: session.csrfToken }, { "Set-Cookie": session.cookie });
}

async function bootstrapSession(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const provider = cleanString(body.provider) ?? "telegram";
  if (provider === "google") return json({ error: "google_oauth_not_configured" }, 501);
  if (provider !== "telegram") return json({ error: "unsupported_identity_provider" }, 400);

  const initData = cleanString(body.initData);
  const telegramUser = initData ? await verifyTelegramInitData(initData, env) : null;
  if (!telegramUser) return json({ error: "valid_telegram_init_data_required" }, 401);

  const telegramUserId = String(telegramUser.id);
  const existingSession = await optionalSession(request, env);
  const telegramOwner = await findUser(env, { telegramUserId });
  if (existingSession && telegramOwner && telegramOwner.id !== existingSession.user.id) {
    return json({ error: "telegram_identity_already_linked" }, 409);
  }

  const userId = existingSession?.user.id ?? telegramOwner?.id ?? crypto.randomUUID();
  const language = cleanLanguage(telegramUser.language_code, env.DEFAULT_LOCALE);
  const displayName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ") || telegramUser.username || null;

  if (existingSession?.user) {
    await env.DB.prepare(
      `UPDATE users
       SET telegram_user_id = COALESCE(telegram_user_id, ?),
           display_name = COALESCE(display_name, ?),
           language = COALESCE(NULLIF(language, ''), ?),
           updated_at = CURRENT_TIMESTAMP,
           last_seen_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(telegramUserId, displayName, language, userId).run();
  } else if (telegramOwner) {
    await env.DB.prepare(
      `UPDATE users
       SET display_name = COALESCE(display_name, ?),
           language = COALESCE(NULLIF(language, ''), ?),
           status = 'active',
           updated_at = CURRENT_TIMESTAMP,
           last_seen_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(displayName, language, userId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO users (id, telegram_user_id, display_name, language, country, status, last_seen_at)
       VALUES (?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`
    ).bind(userId, telegramUserId, displayName, language, env.DEFAULT_COUNTRY).run();
    await env.DB.prepare(
      `INSERT INTO user_settings (user_id, language, country)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, country = excluded.country, updated_at = CURRENT_TIMESTAMP`
    ).bind(userId, language, env.DEFAULT_COUNTRY).run();
  }

  const session = await createUserSession(env, userId);
  const user = await findUserById(env, userId);
  const countryLinks = await listCountryLinks(env, userId);
  ctx.waitUntil(audit(env, userId, "user", "session.bootstrap", request, { provider: "telegram" }));
  return jsonWithHeaders({
    user,
    countryLinks,
    identityProvider: "telegram",
    csrfToken: session.csrfToken,
    csrfTokenRequired: true
  }, { "Set-Cookie": session.cookie });
}

async function refreshCsrfToken(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrfToken = randomSecret(32);
  await env.DB.prepare(
    `UPDATE user_sessions SET csrf_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(await sha256(csrfToken), auth.sessionId).run();
  ctx.waitUntil(audit(env, auth.user.id, "user", "session.csrf_refreshed", request, {}));
  return json({ csrfToken, csrfTokenRequired: true });
}

async function optionalSession(request: Request, env: Env): Promise<AuthenticatedSession | null> {
  if (!cookieValue(request, SESSION_COOKIE_NAME)) return null;
  const session = await requireSession(request, env);
  return session instanceof Response ? null : session;
}

export async function health(env: Env): Promise<Response> {
  const checks: Record<string, { ok: boolean; count?: number; error?: string }> = {};
  const tableChecks = [
    ["db", "SELECT 1 AS count"],
    ["users", "SELECT COUNT(*) AS count FROM users"],
    ["subscriptions", "SELECT COUNT(*) AS count FROM subscriptions"],
    ["bot_routes", "SELECT COUNT(*) AS count FROM bot_routes"],
    ["api_keys", "SELECT COUNT(*) AS count FROM api_keys"],
    ["analysis_requests", "SELECT COUNT(*) AS count FROM analysis_requests"],
    ["user_sessions", "SELECT COUNT(*) AS count FROM user_sessions"],
    ["legal_acceptances", "SELECT COUNT(*) AS count FROM legal_acceptances"],
    ["quota_plan_policies", "SELECT COUNT(*) AS count FROM quota_plan_policies"],
    ["quota_balances", "SELECT COUNT(*) AS count FROM quota_balances"],
    ["quota_decisions", "SELECT COUNT(*) AS count FROM quota_decisions"],
    ["quota_decisions_v11", "SELECT COUNT(*) AS count FROM quota_decisions_v11"],
    ["cache_receipts", "SELECT COUNT(*) AS count FROM cache_receipts"],
    ["core_cache_entries", "SELECT COUNT(*) AS count FROM core_cache_entries"],
    ["internal_request_nonces", "SELECT COUNT(*) AS count FROM internal_request_nonces"],
    ["internal_deliveries", "SELECT COUNT(*) AS count FROM internal_deliveries"],
    ["email_verifications", "SELECT COUNT(*) AS count FROM email_verifications"]
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
  if (url.pathname === "/api/auth/email/request" && request.method === "POST") return { bucket: "email_verification", limit: 5, windowSeconds: 15 * 60 };
  if (url.pathname === "/api/auth/email/verify" && request.method === "POST") return { bucket: "email_verify", limit: 10, windowSeconds: 15 * 60 };
  if (url.pathname === "/api/settings" && request.method === "PUT") return { bucket: "settings", limit: 30, windowSeconds: 60 };
  if (url.pathname.startsWith("/api/me/") || url.pathname === "/api/me") return { bucket: "account", limit: 60, windowSeconds: 60 };
  if (url.pathname === "/api/subscriptions" && request.method === "POST") return { bucket: "subscriptions", limit: 60, windowSeconds: 60 };
  if (url.pathname.startsWith("/api/admin/")) return { bucket: "admin", limit: 120, windowSeconds: 60 };
  return null;
}

async function updateSettings(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;

  const body = await readJson<Record<string, unknown>>(request);
  const userId = auth.user.id;

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

  return processSubscriptionEvent(request, env, ctx, rawBody);
}

async function processSubscriptionEvent(request: Request, env: Env, ctx: ExecutionContext, rawBody: string): Promise<Response> {
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
    if (!email || !isValidEmail(email)) return json({ error: "valid_email_required" }, 400);
    return json({ error: "verified_user_required", emailVerificationRequired: true }, 409);
  }

  const existingSubscription = externalId ? await env.DB.prepare(
    `SELECT id FROM subscriptions WHERE provider = ? AND external_id = ? LIMIT 1`
  ).bind(provider, externalId).first<{ id: string }>() : null;
  const subscriptionId = existingSubscription?.id ?? crypto.randomUUID();
  if (existingSubscription) {
    await env.DB.prepare(
      `UPDATE subscriptions
       SET user_id = ?, plan = ?, status = ?, current_period_end = ?, metadata_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(userId, plan, status, currentPeriodEnd, JSON.stringify(body.metadata ?? {}), subscriptionId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO subscriptions (id, user_id, provider, external_id, plan, status, current_period_end, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(subscriptionId, userId, provider, externalId, plan, status, currentPeriodEnd, JSON.stringify(body.metadata ?? {})).run();
  }

  ctx.waitUntil(audit(env, userId, provider, existingSubscription ? "subscription.replayed" : "subscription.received", request, { plan, status, externalId }));

  const user = await findUserById(env, userId);
  const countryLinks = await listCountryLinks(env, userId);
  const country = countryLinks[0]?.country ?? user?.country ?? env.DEFAULT_COUNTRY;
  const botUrl = countryLinks[0]?.botUrl ?? await findBotUrl(env, country);
  const access = await resolveAccess(env, userId, botUrl);

  return json({ subscriptionId, replayed: Boolean(existingSubscription), userId, status, botUrl, countryLinks, access });
}

async function accountDetails(request: Request, env: Env): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const countryLinks = await listCountryLinks(env, auth.user.id);
  return json({ user: auth.user, countryLinks, csrfTokenRequired: true });
}

async function deleteCountryLink(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;

  const body = await readJson<Record<string, unknown>>(request);
  const userId = auth.user.id;
  const country = cleanCountry(body.country, "");
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

async function userDashboard(request: Request, env: Env): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const user = auth.user;

  const [countryLinks, subscription, apiKeys, history] = await Promise.all([
    listCountryLinks(env, user.id),
    latestSubscription(env, user.id),
    listApiKeys(env, user.id),
    listAnalysisHistory(env, user.id, 10)
  ]);

  return json({
    user,
    countryLinks,
    subscription,
    apiKeys,
    analysisHistory: history,
    access: await resolveAccess(env, user.id, countryLinks[0]?.botUrl ?? user.selected_bot_url)
  });
}

async function updateUserProfile(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;

  const body = await readJson<Record<string, unknown>>(request);
  const userId = auth.user.id;

  const existing = auth.user;

  const emailInput = cleanString(body.email);
  const email = emailInput ? emailInput.toLowerCase() : existing.email;
  if (!email || !isValidEmail(email)) return json({ error: "valid_email_required" }, 400);

  const displayName = cleanString(body.displayName) ?? existing.display_name;
  const language = cleanLanguage(body.language, existing.language);
  const countries = cleanCountries(body.countries, body.country, existing.country);
  const countryLinks = await buildCountryLinks(env, countries);
  const primary = countryLinks[0];

  await env.DB.prepare(
    `UPDATE users
     SET pending_email = CASE WHEN email = ? THEN NULL ELSE ? END,
         display_name = ?,
         language = ?,
         country = ?,
         selected_bot_url = ?,
         updated_at = CURRENT_TIMESTAMP,
         last_seen_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(email, email, displayName, language, primary.country, primary.botUrl, userId).run();

  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, language, country)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, country = excluded.country, updated_at = CURRENT_TIMESTAMP`
  ).bind(userId, language, primary.country).run();

  await replaceCountryLinks(env, userId, countryLinks);
  ctx.waitUntil(audit(env, userId, "user", "profile.updated", request, { countries, language }));

  const user = await findUserById(env, userId);
  return json({
    user,
    countryLinks,
    subscription: await latestSubscription(env, userId),
    emailVerificationRequired: user?.email !== email || !user?.email_verified_at
  });
}

async function userSubscription(request: Request, env: Env): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const user = auth.user;

  const result = await env.DB.prepare(
    `SELECT id, provider, external_id, plan, status, current_period_end, created_at, updated_at
     FROM subscriptions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 20`
  ).bind(user.id).all();

  const current = await latestSubscription(env, user.id);
  const latest = result.results[0] as { plan?: string; status?: string; current_period_end?: string | null } | undefined;
  const plan = latest?.plan ?? null;
  const status = latest?.status ?? current?.status ?? null;
  const quota = await latestQuotaSummary(env, user.id);
  const countryLinks = await listCountryLinks(env, user.id);
  const subscriptionAllowed = isSubscriptionCurrentlyAllowed(current);
  const privateAnalysisAllowed = Boolean(subscriptionAllowed && plan && PERSONAL_ANALYSIS_PLANS.includes(plan as typeof PERSONAL_ANALYSIS_PLANS[number]) && (!quota || quota.remainingCredits > 0));
  return json({
    userId: user.id,
    current,
    allowed: subscriptionAllowed,
    summary: {
      plan,
      status,
      currentPeriodEnd: current?.currentPeriodEnd ?? null,
      renewalState: subscriptionRenewalState(status, current?.currentPeriodEnd ?? null),
      canManageBilling: Boolean(env.SUBSCRIPTION_PORTAL_URL),
      canStartCheckout: Boolean(env.SUBSCRIPTION_CHECKOUT_URL),
      entitlements: {
        channelAccess: subscriptionAllowed,
        privateAnalysis: privateAnalysisAllowed,
        apiAccess: privateAnalysisAllowed
      },
      quota,
      channelLinks: countryLinks
    },
    subscriptions: result.results
  });
}

async function createSubscriptionCheckout(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;
  if (!env.SUBSCRIPTION_CHECKOUT_URL) return json({ error: "subscription_checkout_not_configured" }, 503);
  const checkoutUrl = appendUrlParams(env.SUBSCRIPTION_CHECKOUT_URL, { userId: auth.user.id, email: auth.user.email ?? "" });
  ctx.waitUntil(audit(env, auth.user.id, "user", "subscription.checkout.created", request, {}));
  return json({ checkoutUrl });
}

async function createSubscriptionPortal(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;
  if (!env.SUBSCRIPTION_PORTAL_URL) return json({ error: "subscription_portal_not_configured" }, 503);
  const portalUrl = appendUrlParams(env.SUBSCRIPTION_PORTAL_URL, { userId: auth.user.id, email: auth.user.email ?? "" });
  ctx.waitUntil(audit(env, auth.user.id, "user", "subscription.portal.created", request, {}));
  return json({ portalUrl });
}

async function userApiKeys(request: Request, env: Env): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const user = auth.user;
  return json({ userId: user.id, apiKeys: await listApiKeys(env, user.id) });
}

async function createUserApiKey(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;

  const body = await readJson<Record<string, unknown>>(request);
  const userId = auth.user.id;

  const user = auth.user;
  if (user.status !== "active") return json({ error: "user_not_active" }, 403);
  if (!env.API_KEY_HASH_SECRET) return json({ error: "api_key_hash_secret_not_configured" }, 503);

  const name = cleanString(body.name) ?? "Default key";
  const scopes = Array.isArray(body.scopes) ? body.scopes.map(cleanString).filter(isString) : [...API_KEY_SCOPES];
  if (!scopes.length || scopes.length > API_KEY_SCOPES.length || scopes.some((scope) => !API_KEY_SCOPES.includes(scope as typeof API_KEY_SCOPES[number]))) {
    return json({ error: "invalid_api_key_scopes", allowedScopes: API_KEY_SCOPES }, 400);
  }
  const expiry = parseFutureIsoTimestamp(body.expiresAt);
  if (!expiry.ok) return json({ error: "invalid_api_key_expiry" }, 400);
  const expiresAt = expiry.value;
  const rawKey = `msk_live_${randomSecret(32)}`;
  const keyId = crypto.randomUUID();
  const keyPrefix = rawKey.slice(0, 18);
  const keyHash = await hmacHex(env.API_KEY_HASH_SECRET, rawKey);

  await env.DB.prepare(
    `INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, scopes_json, expires_at, hash_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'hmac_sha256_v1')`
  ).bind(keyId, userId, name, keyPrefix, keyHash, JSON.stringify(scopes), expiresAt).run();

  ctx.waitUntil(audit(env, userId, "user", "api_key.created", request, { keyId, keyPrefix, name }));

  return json({
    apiKey: {
      id: keyId,
      name,
      keyPrefix,
      scopes,
      expiresAt,
      isActive: true,
      token: rawKey
    },
    warning: "Store this token now. It will not be shown again."
  }, 201);
}

async function createApiAnalysisRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const identity = await requireApiKey(request, env, "analysis:write");
  if (identity instanceof Response) return identity;

  const limited = await enforceApiAnalysisLimits(request, env, identity);
  if (limited) return limited;

  const body = await readJson<Record<string, unknown>>(request);
  const requestId = cleanString(body.requestId) ?? crypto.randomUUID();
  const ticker = cleanString(body.ticker)?.toUpperCase() ?? "";
  const reportType = body.reportType === "fundrep" ? "fundrep" : body.reportType === undefined || body.reportType === "regular" ? "regular" : null;
  const forceRefresh = body.forceRefresh === true;
  const language = cleanInternalLanguage(body.language) || "en";
  if (!requestId || requestId.length > 128 || !ticker || ticker.length > 32 || !/^[A-Z0-9._:-]+$/.test(ticker)) {
    return json({ error: "invalid_analysis_request" }, 400);
  }
  if (!reportType) return json({ error: "unsupported_report_type" }, 400);
  const privateAccess = await privateAnalysisAccess(env, identity.userId);
  if (!privateAccess.allowed) {
    return json({ error: "private_analysis_access_denied", reason: privateAccess.reason }, 403);
  }

  const quotaResponse = await scannerAccessCheck(JSON.stringify({
    contractVersion: "1.1",
    requestId,
    userId: identity.userId,
    chatId: null,
    ticker,
    reportType,
    generationVersion: cleanString(body.generationVersion) ?? "public-api-v1",
    cacheStatus: "miss",
    cacheCreatedAt: null,
    cacheGenerationVersion: null,
    forceRefresh,
    language
  }), env);
  const quota = await quotaResponse.json<Record<string, unknown>>();
  if (!quotaResponse.ok || quota.allowed !== true) {
    return json({ error: "analysis_access_denied", ...quota }, quotaResponse.status >= 400 ? quotaResponse.status : 403);
  }

  await env.DB.prepare(
    `INSERT INTO analysis_requests
     (id, user_id, api_key_id, request_id, source, country, language, status, tickers_json, request_json, response_json)
     VALUES (?, ?, ?, ?, 'public_api', NULL, ?, 'received', ?, ?, '{}')
     ON CONFLICT(request_id) DO NOTHING`
  ).bind(
    crypto.randomUUID(),
    identity.userId,
    identity.id,
    requestId,
    language,
    JSON.stringify([ticker]),
    JSON.stringify({ ticker, reportType, forceRefresh, language })
  ).run();

  await env.DB.prepare("UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(identity.id).run();
  await recordApiUsage(env, { userId: identity.userId, apiKeyId: identity.id, endpoint: "analysis.requests" });
  ctx.waitUntil(audit(env, identity.userId, "api_key", "analysis_request.authorized", request, { requestId, ticker, reportType }));
  return json({ requestId, status: "accepted", ticker, reportType, quota }, 202);
}

async function revokeUserApiKey(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;

  const body = await readJson<Record<string, unknown>>(request);
  const userId = auth.user.id;
  const keyId = cleanString(body.keyId);
  if (!keyId) return json({ error: "keyId_required" }, 400);

  await env.DB.prepare(
    `UPDATE api_keys
     SET is_active = 0, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`
  ).bind(keyId, userId).run();

  ctx.waitUntil(audit(env, userId, "user", "api_key.revoked", request, { keyId }));
  return json({ userId, keyId, revoked: true, apiKeys: await listApiKeys(env, userId) });
}

async function rotateUserApiKey(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;
  if (!env.API_KEY_HASH_SECRET) return json({ error: "api_key_hash_secret_not_configured" }, 503);

  const body = await readJson<Record<string, unknown>>(request);
  const oldKeyId = cleanString(body.keyId);
  if (!oldKeyId) return json({ error: "keyId_required" }, 400);
  const oldKey = await env.DB.prepare(
    `SELECT id, name, scopes_json FROM api_keys
     WHERE id = ? AND user_id = ? AND is_active = 1`
  ).bind(oldKeyId, auth.user.id).first<{ id: string; name: string; scopes_json: string }>();
  if (!oldKey) return json({ error: "api_key_not_found" }, 404);

  const scopes = Array.isArray(body.scopes) ? body.scopes.map(cleanString).filter(isString) : parseJsonSafe<string[]>(oldKey.scopes_json, []);
  if (!scopes.length || scopes.length > API_KEY_SCOPES.length || scopes.some((scope) => !API_KEY_SCOPES.includes(scope as typeof API_KEY_SCOPES[number]))) {
    return json({ error: "invalid_api_key_scopes", allowedScopes: API_KEY_SCOPES }, 400);
  }
  const name = cleanString(body.name) ?? oldKey.name;
  const expiry = parseFutureIsoTimestamp(body.expiresAt);
  if (!expiry.ok) return json({ error: "invalid_api_key_expiry" }, 400);
  const expiresAt = expiry.value;
  const rawKey = `msk_live_${randomSecret(32)}`;
  const keyId = crypto.randomUUID();
  const keyPrefix = rawKey.slice(0, 18);
  const keyHash = await hmacHex(env.API_KEY_HASH_SECRET, rawKey);

  await env.DB.batch([
    env.DB.prepare("UPDATE api_keys SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?").bind(oldKeyId, auth.user.id),
    env.DB.prepare(
      `INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, scopes_json, expires_at, hash_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'hmac_sha256_v1')`
    ).bind(keyId, auth.user.id, name, keyPrefix, keyHash, JSON.stringify(scopes), expiresAt)
  ]);

  ctx.waitUntil(audit(env, auth.user.id, "user", "api_key.rotated", request, { oldKeyId, keyId, keyPrefix, name }));
  return json({
    replacedKeyId: oldKeyId,
    apiKey: { id: keyId, name, keyPrefix, scopes, expiresAt, isActive: true, token: rawKey },
    warning: "The previous key was revoked. Store this replacement token now; it will not be shown again."
  }, 201);
}

async function userAnalysisHistory(request: Request, env: Env): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const user = auth.user;
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 25), 1), 100);
  return json({ userId: user.id, analysisHistory: await listAnalysisHistory(env, user.id, limit) });
}

async function createUserAnalysisRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const auth = await requireSession(request, env);
  if (auth instanceof Response) return auth;
  const csrf = await requireCsrf(request, auth);
  if (csrf) return csrf;

  const body = await readJson<Record<string, unknown>>(request);
  const requestId = cleanString(body.requestId) ?? crypto.randomUUID();
  const ticker = cleanTicker(body.ticker);
  const reportType = body.reportType === "fundrep" ? "fundrep" : body.reportType === undefined || body.reportType === "regular" ? "regular" : null;
  const forceRefresh = body.forceRefresh === true;
  const language = cleanInternalLanguage(body.language) || auth.user.language || "en";
  if (!requestId || requestId.length > 128 || !ticker) return json({ error: "invalid_analysis_request" }, 400);
  if (!reportType) return json({ error: "unsupported_report_type" }, 400);

  const privateAccess = await privateAnalysisAccess(env, auth.user.id);
  if (!privateAccess.allowed) {
    return json({ error: "private_analysis_access_denied", reason: privateAccess.reason }, 403);
  }

  const quotaResponse = await scannerAccessCheck(JSON.stringify({
    contractVersion: "1.1",
    requestId,
    userId: auth.user.id,
    chatId: null,
    ticker,
    reportType,
    generationVersion: cleanString(body.generationVersion) ?? "website-session-v1",
    cacheStatus: "miss",
    cacheCreatedAt: null,
    cacheGenerationVersion: null,
    forceRefresh,
    language
  }), env);
  const quota = await quotaResponse.json<Record<string, unknown>>();
  if (!quotaResponse.ok || quota.allowed !== true) {
    return json({ error: "analysis_access_denied", ...quota }, quotaResponse.status >= 400 ? quotaResponse.status : 403);
  }

  await env.DB.prepare(
    `INSERT INTO analysis_requests
     (id, user_id, api_key_id, request_id, source, country, language, status, tickers_json, request_json, response_json)
     VALUES (?, ?, NULL, ?, 'website_session', ?, ?, 'received', ?, ?, '{}')
     ON CONFLICT(request_id) DO NOTHING`
  ).bind(
    crypto.randomUUID(),
    auth.user.id,
    requestId,
    auth.user.country,
    language,
    JSON.stringify([ticker]),
    JSON.stringify({ ticker, reportType, forceRefresh, language, channelType: "private" })
  ).run();
  await recordApiUsage(env, { userId: auth.user.id, endpoint: "analysis.requests.website" });
  ctx.waitUntil(audit(env, auth.user.id, "user", "analysis_request.authorized", request, { requestId, ticker, reportType }));
  return json({ requestId, status: "accepted", ticker, reportType, quota }, 202);
}

async function recordAnalysisRequest(request: Request, env: Env, ctx: ExecutionContext, rawBody?: string): Promise<Response> {
  const body = rawBody ? JSON.parse(rawBody) as AnalysisRequestInput : await readJson<AnalysisRequestInput>(request);
  let userId = cleanString(body.userId);
  if (!userId) {
    const user = await findUser(env, {
      telegramUserId: cleanString(body.telegramUserId),
      email: cleanString(body.email)?.toLowerCase() ?? null
    });
    userId = user?.id ?? null;
  }

  const requestId = cleanString(body.requestId) ?? crypto.randomUUID();
  const source = cleanString(body.source) ?? "internal";
  const country = cleanCountry(body.country, "");
  const language = cleanInternalLanguage(body.language);
  const status = cleanEnum(body.status, ["received", "processing", "sent", "failed"], "received");
  const tickers = Array.isArray(body.tickers) ? body.tickers.slice(0, 100) : [];
  const apiKeyId = cleanString(body.apiKeyId);
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO analysis_requests (id, user_id, api_key_id, request_id, source, country, language, status, tickers_json, request_json, response_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(request_id) DO UPDATE SET
       status = excluded.status,
       tickers_json = excluded.tickers_json,
       request_json = excluded.request_json,
       response_json = excluded.response_json,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(
    id,
    userId ?? null,
    apiKeyId,
    requestId,
    source,
    country || null,
    language || null,
    status,
    JSON.stringify(tickers),
    JSON.stringify(body.request ?? {}),
    JSON.stringify(body.response ?? {})
  ).run();

  await recordApiUsage(env, { userId: userId ?? null, apiKeyId, endpoint: "internal.analysis-requests" });
  ctx.waitUntil(audit(env, userId ?? null, source, "analysis_request.recorded", request, { requestId, status, country, language }));

  return json({ id, requestId, userId: userId ?? null, status });
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

  await recordApiUsage(env, { userId: user.id, endpoint: "internal.access" });

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

export async function internalDeliver(request: Request, rawBody: string, env: Env, ctx: ExecutionContext): Promise<Response> {
  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid_delivery_request" }, 400);
  }
  if (!isExactRecord(input, ["contractVersion", "requestId", "deliveryId", "recipient", "content"])) {
    return json({ error: "invalid_delivery_request" }, 400);
  }

  const recipient = input.recipient;
  const content = input.content;
  if (!isRecord(recipient) || !isRecord(content)) return json({ error: "invalid_delivery_request" }, 400);
  const recipientType = recipient.type;
  const recipientKeys = recipientType === "user" ? ["type", "userId", "country", "language"] : ["type", "routeId", "country", "language"];
  if ((recipientType !== "user" && recipientType !== "channel") || !isExactRecord(recipient, recipientKeys)) {
    return json({ error: "invalid_delivery_recipient" }, 400);
  }
  if (!isExactRecord(content, ["kind", "text", "ticker", "reportType"])) return json({ error: "invalid_delivery_content" }, 400);

  const requestId = cleanString(input.requestId) ?? "";
  const deliveryId = cleanString(input.deliveryId) ?? "";
  const country = cleanCountry(recipient.country, "");
  const language = cleanInternalLanguage(recipient.language);
  const text = cleanString(content.text) ?? "";
  const kind = content.kind === "news_signal" || content.kind === "ticker_analysis" || content.kind === "service_notice" ? content.kind : null;
  const ticker = content.ticker === null ? null : cleanString(content.ticker)?.toUpperCase() ?? null;
  const reportType = content.reportType === null ? null : content.reportType === "regular" || content.reportType === "fundrep" ? content.reportType : undefined;
  if (input.contractVersion !== "1.0" || !requestId || requestId.length > 128 || !deliveryId || deliveryId.length > 128 || !country || !language) {
    return json({ error: "invalid_delivery_request" }, 400);
  }
  if (!kind || !text || text.length > 4096 || reportType === undefined || (ticker !== null && (!/^[A-Z0-9._:-]+$/.test(ticker) || ticker.length > 32))) {
    return json({ error: "invalid_delivery_content" }, 400);
  }
  if (/bot\d{6,}:[A-Za-z0-9_-]{20,}|\bBearer\s+\S+|\bX-Signature\s*:/i.test(text)) {
    return json({ error: "delivery_secret_like_content_rejected" }, 400);
  }

  const recipientId = recipientType === "user" ? cleanString(recipient.userId) : cleanString(recipient.routeId);
  if (!recipientId) return json({ error: "invalid_delivery_recipient" }, 400);
  const payload: InternalDeliveryRequest = {
    contractVersion: "1.0",
    requestId,
    deliveryId,
    recipient: recipientType === "user"
      ? { type: "user", userId: recipientId, country, language }
      : { type: "channel", routeId: recipientId, country, language },
    content: { kind, text, ticker, reportType }
  };
  const payloadHash = await sha256(JSON.stringify(payload));

  await env.DB.prepare(
    `INSERT OR IGNORE INTO internal_deliveries
     (delivery_id, request_id, payload_hash, recipient_type, recipient_id, user_id, country, language, content_kind)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(deliveryId, requestId, payloadHash, recipientType, recipientId, recipientType === "user" ? recipientId : null, country, language, kind).run();

  let ledger = await findDelivery(env, deliveryId);
  if (!ledger) return json({ error: "delivery_ledger_unavailable" }, 503);
  if (ledger.payload_hash !== payloadHash) return json({ error: "delivery_id_payload_mismatch" }, 400);
  if (ledger.status === "sent") return deliveryResponse(ledger, "duplicate");
  if (ledger.status === "access_denied") return deliveryResponse(ledger, "access_denied");
  if (ledger.status === "sending" || ledger.status === "indeterminate") {
    return json({ error: ledger.status === "sending" ? "delivery_in_progress" : "delivery_state_indeterminate", retryable: false }, 409);
  }

  let chatId: string | null = null;
  let accessReason: string | null = null;
  if (recipientType === "user") {
    const user = await env.DB.prepare("SELECT id, telegram_user_id, status FROM users WHERE id = ?").bind(recipientId).first<{ id: string; telegram_user_id: string | null; status: string }>();
    const option = NEWS_CHAT_OPTIONS.find((item) => item.country === country && item.language === language);
    const link = user ? await findCountryLink(env, user.id, country) : null;
    const subscription = user ? await latestSubscription(env, user.id) : null;
    if (!user || user.status !== "active") accessReason = "user_not_found";
    else if (!option) accessReason = "unsupported_country_language";
    else if (!link) accessReason = "country_not_linked";
    else if (!isSubscriptionCurrentlyAllowed(subscription)) accessReason = subscriptionAccessReason(subscription);
    else if (!user.telegram_user_id) accessReason = "telegram_destination_not_linked";
    else chatId = user.telegram_user_id;
  } else {
    const route = await env.DB.prepare(
      `SELECT route_id, country, language, telegram_chat_id, is_active
       FROM bot_routes WHERE route_id = ?`
    ).bind(recipientId).first<{ route_id: string; country: string; language: string; telegram_chat_id: string | null; is_active: number }>();
    if (!route || !route.is_active || route.country !== country || route.language !== language) accessReason = "channel_route_not_found";
    else if (!route.telegram_chat_id) accessReason = "channel_destination_not_configured";
    else chatId = route.telegram_chat_id;
  }

  if (accessReason || !chatId) {
    await env.DB.prepare(
      `UPDATE internal_deliveries SET status = 'access_denied', failure_reason = ?, updated_at = CURRENT_TIMESTAMP
       WHERE delivery_id = ? AND status IN ('pending', 'failed')`
    ).bind(accessReason ?? "delivery_access_denied", deliveryId).run();
    ledger = await findDelivery(env, deliveryId) ?? ledger;
    ctx.waitUntil(audit(env, recipientType === "user" ? recipientId : null, "matcher", "delivery.access_denied", request, { deliveryId, reason: accessReason }));
    return deliveryResponse(ledger, "access_denied");
  }

  const claim = await env.DB.prepare(
    `UPDATE internal_deliveries SET status = 'sending', attempts = attempts + 1, failure_reason = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE delivery_id = ? AND payload_hash = ? AND status IN ('pending', 'failed')`
  ).bind(deliveryId, payloadHash).run();
  if ((claim.meta?.changes ?? 0) !== 1) return json({ error: "delivery_in_progress", retryable: false }, 409);

  try {
    const messageId = await sendDeliveryTelegramMessage(env, chatId, text);
    await env.DB.prepare(
      `UPDATE internal_deliveries SET status = 'sent', telegram_message_id = ?, sent_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP WHERE delivery_id = ? AND status = 'sending'`
    ).bind(messageId, deliveryId).run();
    ledger = await findDelivery(env, deliveryId) ?? ledger;
    ctx.waitUntil(audit(env, recipientType === "user" ? recipientId : null, "matcher", "delivery.sent", request, { deliveryId, kind, country, language }));
    return deliveryResponse(ledger, "sent");
  } catch (error) {
    const known = error instanceof TelegramDeliveryError ? error : new TelegramDeliveryError("telegram_delivery_indeterminate", false);
    const status = known.retrySafe ? "failed" : "indeterminate";
    const failureReason = known.detail ?? known.code;
    await env.DB.prepare(
      `UPDATE internal_deliveries SET status = ?, failure_reason = ?, updated_at = CURRENT_TIMESTAMP
       WHERE delivery_id = ? AND status = 'sending'`
    ).bind(status, failureReason, deliveryId).run();
    ctx.waitUntil(audit(env, recipientType === "user" ? recipientId : null, "matcher", "delivery.failed", request, { deliveryId, reason: failureReason, retryable: known.retrySafe }));
    return json({ contractVersion: "1.0", requestId, deliveryId, status: "failed", telegramMessageId: null, reason: failureReason, sentAt: null, retryable: known.retrySafe }, 503);
  }
}

async function findDelivery(env: Env, deliveryId: string): Promise<DeliveryLedgerRow | null> {
  return env.DB.prepare(
    `SELECT delivery_id, request_id, payload_hash, status, telegram_message_id, failure_reason, sent_at
     FROM internal_deliveries WHERE delivery_id = ?`
  ).bind(deliveryId).first<DeliveryLedgerRow>();
}

function deliveryResponse(row: DeliveryLedgerRow, status: "sent" | "duplicate" | "access_denied"): Response {
  return json({
    contractVersion: "1.0",
    requestId: row.request_id,
    deliveryId: row.delivery_id,
    status,
    telegramMessageId: row.telegram_message_id,
    reason: status === "access_denied" ? row.failure_reason : null,
    sentAt: row.sent_at
  });
}

export async function scannerAccessCheck(rawBody: string, env: Env): Promise<Response> {
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return scannerAccessResponse("", false, 0, "rejected_no_access", "miss", "none", null, "invalid_request", 400);
  }

  const requestId = cleanString(input.requestId) ?? "";
  if (input.contractVersion !== "1.1") {
    return scannerAccessResponse(requestId, false, 0, "rejected_no_access", "miss", "none", null, "invalid_contract_version", 400);
  }
  if (input.reportType !== "regular" && input.reportType !== "fundrep") {
    return scannerAccessResponse(requestId, false, 0, "rejected_no_access", "miss", "none", null, "unsupported_report_type", 400);
  }

  const userId = cleanString(input.userId);
  const chatId = input.chatId === null ? null : cleanString(input.chatId);
  const ticker = cleanString(input.ticker)?.toUpperCase() ?? "";
  const language = cleanInternalLanguage(input.language);
  const generationVersion = cleanString(input.generationVersion);
  const cacheCreatedAt = input.cacheCreatedAt === null ? null : cleanString(input.cacheCreatedAt);
  const cacheGenerationVersion = input.cacheGenerationVersion === null ? null : cleanString(input.cacheGenerationVersion);
  if (!requestId || requestId.length > 128 || !userId || userId.length > 128 ||
      (input.chatId !== null && !chatId) || !ticker || ticker.length > 32 ||
      !/^[A-Z0-9._:-]+$/.test(ticker) || !language || !["ru", "en", "he"].includes(language) ||
      !generationVersion || generationVersion.length > 128 ||
      (input.cacheStatus !== "hit" && input.cacheStatus !== "miss") ||
      (input.cacheCreatedAt !== null && !cacheCreatedAt) ||
      (input.cacheGenerationVersion !== null && !cacheGenerationVersion) ||
      typeof input.forceRefresh !== "boolean") {
    return scannerAccessResponse(requestId, false, 0, "rejected_no_access", "miss", "none", null, "invalid_request", 400);
  }

  const payload: ScannerAccessCheckRequest = {
    contractVersion: "1.1",
    requestId,
    userId,
    chatId,
    ticker,
    reportType: input.reportType,
    generationVersion,
    cacheStatus: input.cacheStatus,
    cacheCreatedAt,
    cacheGenerationVersion,
    forceRefresh: input.forceRefresh,
    language: language as ScannerAccessCheckRequest["language"]
  };
  const payloadHash = await sha256(JSON.stringify(payload));
  const existing = await findQuotaDecisionV11(env, requestId, ticker);
  if (existing) {
    if (existing.payload_hash !== payloadHash) {
      return scannerAccessResponse(requestId, false, 0, "rejected_no_access", existing.effective_cache_status, "none", creditsToUnits(existing.remaining_credits), "invalid_request", 400);
    }
    return quotaDecisionResponseV11(existing);
  }

  const initialCacheStatus = payload.forceRefresh ? "bypass" : "miss";

  const user = await env.DB.prepare("SELECT id, status FROM users WHERE id = ?").bind(userId).first<{ id: string; status: string }>();
  if (!user || user.status !== "active") {
    return scannerAccessResponse(requestId, false, 0, "rejected_no_access", initialCacheStatus, "none", null, "user_not_found");
  }

  const subscription = await env.DB.prepare(
    `SELECT id, plan, status, current_period_end
     FROM subscriptions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`
  ).bind(userId).first<{ id: string; plan: string; status: string; current_period_end: string | null }>();
  const normalizedSubscription = subscription
    ? { status: subscription.status, currentPeriodEnd: subscription.current_period_end }
    : null;
  if (!isSubscriptionCurrentlyAllowed(normalizedSubscription)) {
    return persistRejectedQuotaDecisionV11(env, payload, payloadHash, subscription?.id ?? null, initialCacheStatus, subscriptionAccessReason(normalizedSubscription));
  }

  const policy = await env.DB.prepare(
    `SELECT period_units, period_credits, regular_new_credits, regular_cached_credits,
            fundrep_new_credits, fundrep_cached_credits, cache_ttl_minutes
     FROM quota_plan_policies
     WHERE plan = ? AND is_active = 1`
  ).bind(subscription!.plan).first<{
    period_units: number;
    period_credits: number;
    regular_new_credits: number;
    regular_cached_credits: number;
    fundrep_new_credits: number;
    fundrep_cached_credits: number;
    cache_ttl_minutes: number;
  }>();
  if (!policy) {
    return scannerAccessResponse(requestId, false, 0, "rejected_no_access", initialCacheStatus, "none", null, "internal_access_unavailable", 503);
  }

  const ownedCommittedCache = payload.forceRefresh ? null : await env.DB.prepare(
    `SELECT id FROM core_cache_entries
     WHERE user_id = ? AND ticker = ? AND report_type = ? AND generation_version = ? AND language = ?
       AND expires_at >= ?
     ORDER BY created_at DESC LIMIT 1`
  ).bind(userId, ticker, payload.reportType, generationVersion, language, new Date().toISOString()).first<{ id: string }>();
  const sharedCommittedCache = payload.forceRefresh || ownedCommittedCache ? null : await env.DB.prepare(
    `SELECT id FROM core_cache_entries
     WHERE ticker = ? AND report_type = ? AND generation_version = ? AND language = ?
       AND expires_at >= ?
     ORDER BY created_at DESC LIMIT 1`
  ).bind(ticker, payload.reportType, generationVersion, language, new Date().toISOString()).first<{ id: string }>();
  const committedCache = ownedCommittedCache ?? sharedCommittedCache;
  const cacheStatus: "hit" | "miss" | "bypass" = payload.forceRefresh ? "bypass" : committedCache ? "hit" : "miss";
  const scenario = ownedCommittedCache
    ? {
        decision: payload.reportType === "fundrep" ? "own_repeat_fundrep" as const : "own_repeat" as const,
        reportSource: "own_repeat" as const
      }
    : quotaScenario(payload.reportType, cacheStatus);
  const chargeCredits = payload.reportType === "fundrep"
    ? (ownedCommittedCache ? 0 : cacheStatus === "hit" ? policy.fundrep_cached_credits : policy.fundrep_new_credits)
    : (ownedCommittedCache ? 0 : cacheStatus === "hit" ? policy.regular_cached_credits : policy.regular_new_credits);
  const receiptId = cacheStatus === "hit" ? null : crypto.randomUUID();
  const receiptCommitExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const quotaStatements = [
    env.DB.prepare(
      `INSERT INTO quota_balances (subscription_id, user_id, quota_limit, used_units, period_end, quota_limit_credits, used_credits)
       VALUES (?, ?, ?, 0, ?, ?, 0)
       ON CONFLICT(subscription_id) DO UPDATE SET
         quota_limit_credits = excluded.quota_limit_credits,
         used_credits = MAX(used_credits, used_units * 2)`
    ).bind(subscription!.id, userId, policy.period_units, subscription!.current_period_end, policy.period_credits),
    env.DB.prepare(
      `INSERT OR IGNORE INTO quota_decisions_v11
       (request_id, ticker, payload_hash, user_id, subscription_id, chat_id, report_type, generation_version,
        signed_cache_status, cache_created_at, cache_generation_version, force_refresh, language, effective_cache_status,
        cache_entry_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      requestId, ticker, payloadHash, userId, subscription!.id, chatId, payload.reportType, generationVersion,
      payload.cacheStatus, cacheCreatedAt, cacheGenerationVersion, payload.forceRefresh ? 1 : 0, language, cacheStatus,
      committedCache?.id ?? null
    ),
    env.DB.prepare(
      `UPDATE quota_decisions_v11
       SET quota_decision = 'approved_unsettled', updated_at = CURRENT_TIMESTAMP
       WHERE request_id = ? AND ticker = ? AND payload_hash = ? AND quota_decision = 'pending'
         AND EXISTS (
           SELECT 1 FROM quota_balances
           WHERE subscription_id = ? AND used_credits + ? <= quota_limit_credits
         )`
    ).bind(requestId, ticker, payloadHash, subscription!.id, chargeCredits),
    env.DB.prepare(
      `UPDATE quota_balances
       SET used_credits = used_credits + ?, updated_at = CURRENT_TIMESTAMP
       WHERE subscription_id = ?
         AND EXISTS (
           SELECT 1 FROM quota_decisions_v11
           WHERE request_id = ? AND ticker = ? AND payload_hash = ? AND quota_decision = 'approved_unsettled'
         )`
    ).bind(chargeCredits, subscription!.id, requestId, ticker, payloadHash),
    env.DB.prepare(
      `UPDATE quota_decisions_v11
       SET allowed = 1, charge_credits = ?, quota_decision = ?, report_source = ?,
           remaining_credits = (SELECT quota_limit_credits - used_credits FROM quota_balances WHERE subscription_id = ?),
           cache_entry_id = ?, reason = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE request_id = ? AND ticker = ? AND payload_hash = ? AND quota_decision = 'approved_unsettled'`
    ).bind(chargeCredits, scenario.decision, scenario.reportSource, subscription!.id, committedCache?.id ?? null, requestId, ticker, payloadHash),
    env.DB.prepare(
      `UPDATE quota_decisions_v11
       SET allowed = 0, charge_credits = 0, quota_decision = 'rejected_no_quota', report_source = 'none',
           remaining_credits = (SELECT quota_limit_credits - used_credits FROM quota_balances WHERE subscription_id = ?),
           reason = 'quota_exceeded', updated_at = CURRENT_TIMESTAMP
       WHERE request_id = ? AND ticker = ? AND payload_hash = ? AND quota_decision = 'pending'`
    ).bind(subscription!.id, requestId, ticker, payloadHash)
  ];
  if (receiptId) {
    quotaStatements.push(
      env.DB.prepare(
        `INSERT OR IGNORE INTO cache_receipts
         (id, request_id, ticker, user_id, subscription_id, report_type, generation_version, language,
          cache_ttl_minutes, status, commit_expires_at)
         SELECT ?, d.request_id, d.ticker, d.user_id, d.subscription_id, d.report_type, d.generation_version, d.language,
                ?, 'pending', ?
         FROM quota_decisions_v11 d
         WHERE d.request_id = ? AND d.ticker = ? AND d.payload_hash = ? AND d.allowed = 1
           AND d.quota_decision IN ('new_regular', 'refresh_regular', 'new_fundrep', 'refresh_fundrep')`
      ).bind(receiptId, policy.cache_ttl_minutes, receiptCommitExpiresAt, requestId, ticker, payloadHash),
      env.DB.prepare(
        `UPDATE quota_decisions_v11
         SET cache_receipt_id = (
           SELECT id FROM cache_receipts WHERE request_id = ? AND ticker = ?
         ), updated_at = CURRENT_TIMESTAMP
         WHERE request_id = ? AND ticker = ? AND payload_hash = ? AND allowed = 1`
      ).bind(requestId, ticker, requestId, ticker, payloadHash)
    );
  }
  await env.DB.batch(quotaStatements);

  const decision = await findQuotaDecisionV11(env, requestId, ticker);
  if (!decision || decision.quota_decision === "pending" || decision.quota_decision === "approved_unsettled") {
    return scannerAccessResponse(requestId, false, 0, "rejected_no_access", cacheStatus, "none", null, "internal_access_unavailable", 503);
  }
  return quotaDecisionResponseV11(decision);
}

async function persistRejectedQuotaDecisionV11(
  env: Env,
  payload: ScannerAccessCheckRequest,
  payloadHash: string,
  subscriptionId: string | null,
  cacheStatus: "hit" | "miss" | "bypass",
  reason: string
): Promise<Response> {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO quota_decisions_v11
     (request_id, ticker, payload_hash, user_id, subscription_id, chat_id, report_type, generation_version,
      signed_cache_status, cache_created_at, cache_generation_version, force_refresh, language,
      allowed, charge_credits, quota_decision, effective_cache_status, report_source, remaining_credits, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'rejected_no_access', ?, 'none', NULL, ?)`
  ).bind(
    payload.requestId,
    payload.ticker,
    payloadHash,
    payload.userId,
    subscriptionId,
    payload.chatId,
    payload.reportType,
    payload.generationVersion,
    payload.cacheStatus,
    payload.cacheCreatedAt,
    payload.cacheGenerationVersion,
    payload.forceRefresh ? 1 : 0,
    payload.language,
    cacheStatus,
    reason
  ).run();
  const decision = await findQuotaDecisionV11(env, payload.requestId, payload.ticker);
  return decision ? quotaDecisionResponseV11(decision) : scannerAccessResponse(payload.requestId, false, 0, "rejected_no_access", cacheStatus, "none", null, "internal_access_unavailable", 503);
}

async function findQuotaDecisionV11(env: Env, requestId: string, ticker: string): Promise<QuotaDecisionRowV11 | null> {
  return env.DB.prepare(
    `SELECT request_id, ticker, payload_hash, report_type, allowed, charge_credits, quota_decision,
            effective_cache_status, report_source, remaining_credits, cache_receipt_id, cache_entry_id, reason
     FROM quota_decisions_v11 WHERE request_id = ? AND ticker = ?`
  ).bind(requestId, ticker).first<QuotaDecisionRowV11>();
}

function quotaDecisionResponseV11(row: QuotaDecisionRowV11): Response {
  return scannerAccessResponse(
    row.request_id,
    Boolean(row.allowed),
    creditsToUnits(row.charge_credits) ?? 0,
    row.quota_decision as QuotaDecisionV11,
    row.effective_cache_status,
    row.report_source,
    creditsToUnits(row.remaining_credits),
    row.reason,
    200,
    row.cache_receipt_id,
    row.cache_entry_id
  );
}

function quotaScenario(reportType: "regular" | "fundrep", cacheStatus: "hit" | "miss" | "bypass"): {
  decision: QuotaDecisionV11;
  reportSource: "new_analysis" | "cache";
} {
  if (reportType === "fundrep") {
    if (cacheStatus === "hit") return { decision: "cached_fundrep", reportSource: "cache" };
    return { decision: cacheStatus === "bypass" ? "refresh_fundrep" : "new_fundrep", reportSource: "new_analysis" };
  }
  if (cacheStatus === "hit") return { decision: "cached_regular", reportSource: "cache" };
  return { decision: cacheStatus === "bypass" ? "refresh_regular" : "new_regular", reportSource: "new_analysis" };
}

function creditsToUnits(credits: number | null): number | null {
  return credits === null ? null : credits / 2;
}

function scannerAccessResponse(
  requestId: string,
  allowed: boolean,
  chargeUnits: number,
  quotaDecision: QuotaDecisionV11,
  cacheStatus: "hit" | "miss" | "bypass",
  reportSource: "new_analysis" | "cache" | "own_repeat" | "none",
  remainingUnits: number | null,
  reason: string | null,
  status = 200,
  cacheReceiptId: string | null = null,
  cacheEntryId: string | null = null
): Response {
  return json({ contractVersion: "1.1", requestId, allowed, chargeUnits, quotaDecision, cacheStatus, reportSource, remainingUnits, reason, cacheReceiptId, cacheEntryId }, status);
}

export async function commitScannerCache(rawBody: string, env: Env): Promise<Response> {
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid_request" }, 400);
  }
  if (input.contractVersion !== "1.1") return json({ error: "invalid_contract_version" }, 400);

  const payload: ScannerCacheCommitRequest = {
    contractVersion: "1.1",
    cacheReceiptId: cleanString(input.cacheReceiptId) ?? "",
    requestId: cleanString(input.requestId) ?? "",
    ticker: cleanString(input.ticker)?.toUpperCase() ?? "",
    reportType: input.reportType === "fundrep" ? "fundrep" : "regular",
    generationVersion: cleanString(input.generationVersion) ?? "",
    language: cleanInternalLanguage(input.language) as ScannerCacheCommitRequest["language"],
    resultDigest: cleanString(input.resultDigest)?.toLowerCase() ?? ""
  };
  if (!payload.cacheReceiptId || !payload.requestId || !payload.ticker ||
      (input.reportType !== "regular" && input.reportType !== "fundrep") ||
      !payload.generationVersion || !["ru", "en", "he"].includes(payload.language) ||
      !/^[a-f0-9]{64}$/.test(payload.resultDigest)) {
    return json({ error: "invalid_request" }, 400);
  }

  const receipt = await env.DB.prepare(
    `SELECT r.id, r.request_id, r.ticker, r.user_id, r.report_type, r.generation_version, r.language,
            r.cache_ttl_minutes, r.status, r.result_digest, r.commit_expires_at,
            e.id AS cache_entry_id, e.expires_at AS cache_entry_expires_at
     FROM cache_receipts r
     LEFT JOIN core_cache_entries e ON e.receipt_id = r.id
     WHERE r.id = ?`
  ).bind(payload.cacheReceiptId).first<{
    id: string;
    request_id: string;
    ticker: string;
    user_id: string;
    report_type: string;
    generation_version: string;
    language: string;
    cache_ttl_minutes: number;
    status: string;
    result_digest: string | null;
    commit_expires_at: string;
    cache_entry_id: string | null;
    cache_entry_expires_at: string | null;
  }>();
  if (!receipt) return json({ error: "invalid_cache_receipt" }, 400);

  const immutableMatch = receipt.request_id === payload.requestId && receipt.ticker === payload.ticker &&
    receipt.report_type === payload.reportType && receipt.generation_version === payload.generationVersion &&
    receipt.language === payload.language;
  if (!immutableMatch) return json({ error: "cache_receipt_mismatch" }, 400);

  if (receipt.status === "committed") {
    if (receipt.result_digest !== payload.resultDigest || !receipt.cache_entry_id || !receipt.cache_entry_expires_at) {
      return json({ error: "cache_receipt_already_used" }, 409);
    }
    return json({ contractVersion: "1.1", cacheEntryId: receipt.cache_entry_id, committed: true, expiresAt: receipt.cache_entry_expires_at });
  }
  const now = new Date();
  if (receipt.status !== "pending") return json({ error: "cache_receipt_not_pending" }, 409);
  if (Date.parse(receipt.commit_expires_at) <= now.getTime()) {
    await env.DB.prepare("UPDATE cache_receipts SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'").bind(receipt.id).run();
    return json({ error: "cache_receipt_expired" }, 410);
  }

  const cacheEntryId = crypto.randomUUID();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + receipt.cache_ttl_minutes * 60 * 1000).toISOString();
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE cache_receipts
       SET status = 'committing', result_digest = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'pending' AND commit_expires_at > ?`
    ).bind(payload.resultDigest, receipt.id, createdAt),
    env.DB.prepare(
      `INSERT OR IGNORE INTO core_cache_entries
       (id, receipt_id, user_id, ticker, report_type, generation_version, language, result_digest, created_at, expires_at)
       SELECT ?, id, user_id, ticker, report_type, generation_version, language, result_digest, ?, ?
       FROM cache_receipts WHERE id = ? AND status = 'committing' AND result_digest = ?`
    ).bind(cacheEntryId, createdAt, expiresAt, receipt.id, payload.resultDigest),
    env.DB.prepare(
      `UPDATE cache_receipts
       SET status = 'committed', committed_at = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'committing'
         AND EXISTS (SELECT 1 FROM core_cache_entries WHERE receipt_id = ?)`
    ).bind(createdAt, receipt.id, receipt.id)
  ]);

  const committed = await env.DB.prepare(
    `SELECT id, expires_at, result_digest FROM core_cache_entries WHERE receipt_id = ?`
  ).bind(receipt.id).first<{ id: string; expires_at: string; result_digest: string }>();
  if (!committed) return json({ error: "cache_commit_conflict" }, 409);
  if (committed.result_digest !== payload.resultDigest) return json({ error: "cache_receipt_already_used" }, 409);
  return json({ contractVersion: "1.1", cacheEntryId: committed.id, committed: true, expiresAt: committed.expires_at });
}

async function telegramWebhook(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!secret || !(await timingSafeEqual(secret, env.TELEGRAM_WEBHOOK_SECRET))) {
      return json({ error: "unauthorized" }, 401);
    }
  }

  const update = await readJson<TelegramUpdate>(request);
  const chat = update.message?.chat;
  const chatId = chat?.id;
  const rawText = update.message?.text?.trim();
  const text = rawText?.toLowerCase();
  if (!chatId || !text || !rawText) return json({ ok: true });

  if (text === "/start" || text === "/app") {
    const appUrl = buildPublicAppUrl(request);
    ctx.waitUntil(sendTelegramMessage(env, chatId, "Open Market Signal AI to create your account and unlock the country bot.", {
      reply_markup: {
        inline_keyboard: [[
          { text: "Open Market Signal AI", web_app: { url: appUrl } }
        ]]
      }
    }));
    return json({ ok: true });
  }

  if (cleanString(chat?.type) !== "private") {
    ctx.waitUntil(audit(env, null, "telegram", "private_analysis.rejected", request, { reason: "broadcast_channel_request_blocked", chatType: cleanString(chat?.type) ?? "unknown" }));
    return json({ ok: true });
  }

  const ticker = cleanTicker(rawText);
  if (!ticker) {
    ctx.waitUntil(sendTelegramMessage(env, chatId, "Send one ticker symbol in this private chat to request premium analysis."));
    return json({ ok: true });
  }

  await handlePrivateTelegramTickerRequest(request, env, ctx, String(update.message?.from?.id ?? chatId), chatId, ticker);
  return json({ ok: true });
}

async function handlePrivateTelegramTickerRequest(request: Request, env: Env, ctx: ExecutionContext, telegramUserId: string, chatId: string | number, ticker: string): Promise<void> {
  const user = await findUser(env, { telegramUserId });
  if (!user) {
    ctx.waitUntil(sendTelegramMessage(env, chatId, "Open Market Signal AI first so this Telegram account can be connected."));
    ctx.waitUntil(audit(env, null, "telegram", "private_analysis.rejected", request, { reason: "user_not_found" }));
    return;
  }

  const access = await privateAnalysisAccess(env, user.id);
  if (!access.allowed) {
    ctx.waitUntil(sendTelegramMessage(env, chatId, privateAnalysisDenialText(access.reason)));
    ctx.waitUntil(audit(env, user.id, "telegram", "private_analysis.rejected", request, { reason: access.reason, ticker }));
    return;
  }

  const requestId = `tg_private_${crypto.randomUUID()}`;
  await env.DB.prepare(
    `INSERT INTO analysis_requests (id, user_id, request_id, source, country, language, status, tickers_json, request_json, response_json)
     VALUES (?, ?, ?, 'telegram_private_bot', ?, ?, 'received', ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    user.id,
    requestId,
    user.country,
    user.language,
    JSON.stringify([ticker]),
    JSON.stringify({ ticker, channelType: "private" }),
    JSON.stringify({ status: "queued" })
  ).run();
  await recordApiUsage(env, { userId: user.id, endpoint: "telegram.private_analysis" });
  ctx.waitUntil(sendTelegramMessage(env, chatId, `Premium analysis request received for ${ticker}.`));
  ctx.waitUntil(audit(env, user.id, "telegram", "private_analysis.received", request, { requestId, ticker }));
}

async function privateAnalysisAccess(env: Env, userId: string): Promise<{ allowed: boolean; reason: string | null }> {
  const subscription = await env.DB.prepare(
    `SELECT id, plan, status, current_period_end
     FROM subscriptions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`
  ).bind(userId).first<{ id: string; plan: string; status: string; current_period_end: string | null }>();
  const normalized = subscription ? { status: subscription.status, currentPeriodEnd: subscription.current_period_end } : null;
  if (!isSubscriptionCurrentlyAllowed(normalized)) return { allowed: false, reason: subscriptionAccessReason(normalized) };
  if (!PERSONAL_ANALYSIS_PLANS.includes(subscription!.plan as typeof PERSONAL_ANALYSIS_PLANS[number])) {
    return { allowed: false, reason: "premium_plan_required" };
  }
  const balance = await env.DB.prepare(
    `SELECT quota_limit_credits, used_credits
     FROM quota_balances
     WHERE user_id = ?
     ORDER BY updated_at DESC
     LIMIT 1`
  ).bind(userId).first<{ quota_limit_credits: number; used_credits: number }>();
  if (balance && balance.used_credits >= balance.quota_limit_credits) return { allowed: false, reason: "quota_exceeded" };
  return { allowed: true, reason: null };
}

function privateAnalysisDenialText(reason: string | null): string {
  if (reason === "premium_plan_required") return "Private ticker analysis is available on a premium plan.";
  if (reason === "quota_exceeded") return "Your analysis quota is used up for this period.";
  if (reason === "subscription_period_expired") return "Your subscription period has ended. Please renew to request private analysis.";
  return "An active subscription is required to request private ticker analysis.";
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
     SET pending_email = CASE WHEN email = ? THEN NULL ELSE ? END,
         display_name = ?,
         language = ?,
         country = ?,
         selected_bot_url = ?,
         status = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(email, email, displayName, language, primary.country, primary.botUrl, status, userId).run();

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

async function adminSubscriptions(env: Env, url: URL): Promise<Response> {
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
  const result = await env.DB.prepare(
    `SELECT s.id, s.user_id, u.email, u.display_name, s.provider, s.external_id, s.plan, s.status, s.current_period_end, s.created_at
     FROM subscriptions s
     LEFT JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC
     LIMIT ?`
  ).bind(limit).all();

  return json({ subscriptions: result.results });
}

async function adminApiUsage(env: Env, url: URL): Promise<Response> {
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 14), 1), 90);
  const [series, topEndpoints, activeKeys, recentRequests] = await Promise.all([
    env.DB.prepare(
      `SELECT day, SUM(count) AS count
       FROM api_usage_daily
       WHERE day >= date('now', ?)
       GROUP BY day
       ORDER BY day ASC`
    ).bind(`-${days - 1} days`).all<{ day: string; count: number }>(),
    env.DB.prepare(
      `SELECT endpoint, SUM(count) AS count
       FROM api_usage_daily
       WHERE day >= date('now', ?)
       GROUP BY endpoint
       ORDER BY count DESC
       LIMIT 10`
    ).bind(`-${days - 1} days`).all(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM api_keys WHERE is_active = 1").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM analysis_requests WHERE created_at >= datetime('now', '-24 hours')").first<{ count: number }>()
  ]);

  return json({
    activeApiKeys: activeKeys?.count ?? 0,
    analysisRequests24h: recentRequests?.count ?? 0,
    usageSeries: fillUsageSeries(series.results, days),
    topEndpoints: topEndpoints.results
  });
}

async function adminChannels(env: Env): Promise<Response> {
  const routes = await env.DB.prepare(
    `SELECT br.country, br.language, br.bot_url, br.is_active, COUNT(ucl.user_id) AS linked_users
     FROM bot_routes br
     LEFT JOIN user_country_links ucl ON ucl.country = br.country AND ucl.is_active = 1
     GROUP BY br.country, br.language, br.bot_url, br.is_active
     ORDER BY br.country ASC`
  ).all();

  return json({ channels: routes.results });
}

async function adminBotRoutes(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    `SELECT route_id, country, language, bot_url, telegram_chat_id, is_active, created_at, updated_at
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
  const routeId = cleanString(body.routeId) ?? country;
  const telegramChatId = cleanString(body.telegramChatId);
  const isActive = body.isActive === false ? 0 : 1;
  if (!botUrl || !/^https:\/\/t\.me\/[a-zA-Z0-9_]+$/.test(botUrl)) {
    return json({ error: "valid_t_me_bot_url_required" }, 400);
  }
  if (!/^[a-zA-Z0-9._:-]{2,128}$/.test(routeId)) return json({ error: "valid_route_id_required" }, 400);
  if (telegramChatId && !/^(?:-?\d{1,20}|@[a-zA-Z][a-zA-Z0-9_]{4,31})$/.test(telegramChatId)) {
    return json({ error: "valid_telegram_chat_id_required" }, 400);
  }

  await env.DB.prepare(
    `INSERT INTO bot_routes (route_id, country, language, bot_url, telegram_chat_id, is_active, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(country) DO UPDATE SET
       route_id = excluded.route_id,
       language = excluded.language,
       bot_url = excluded.bot_url,
       telegram_chat_id = excluded.telegram_chat_id,
       is_active = excluded.is_active,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(routeId, country, language, botUrl, telegramChatId, isActive).run();

  if (previousCountry !== country) {
    await env.DB.prepare("DELETE FROM bot_routes WHERE country = ?").bind(previousCountry).run();
  }

  ctx.waitUntil(audit(env, null, "admin", "bot_route.upserted", request, { country, previousCountry, language, botUrl, isActive }));

  return json({ routeId, country, language, botUrl, telegramChatId, isActive: Boolean(isActive) });
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
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? AND email_verified_at IS NOT NULL").bind(input.email).first<AppUser>();
    if (user) return user;
  }
  return null;
}

async function findUserById(env: Env, userId: string): Promise<AppUser | null> {
  return env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<AppUser>();
}

async function createUserSession(env: Env, userId: string): Promise<{ cookie: string; csrfToken: string }> {
  const sessionId = crypto.randomUUID();
  const token = randomSecret(32);
  const csrfToken = randomSecret(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO user_sessions (id, user_id, token_hash, csrf_hash, expires_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(sessionId, userId, await sha256(token), await sha256(csrfToken), expiresAt).run();

  return {
    csrfToken,
    cookie: `${SESSION_COOKIE_NAME}=${sessionId}.${token}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`
  };
}

async function requireSession(request: Request, env: Env): Promise<AuthenticatedSession | Response> {
  const token = cookieValue(request, SESSION_COOKIE_NAME);
  if (!token) return json({ error: "authenticated_session_required" }, 401);

  const [sessionId, rawToken] = token.split(".");
  if (!sessionId || !rawToken) return json({ error: "invalid_session" }, 401);

  const row = await env.DB.prepare(
    `SELECT s.id, s.user_id, s.token_hash, s.csrf_hash, s.expires_at, u.*
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.revoked_at IS NULL`
  ).bind(sessionId).first<Record<string, string | null>>();

  if (!row?.user_id || !row.token_hash || !row.csrf_hash || !row.expires_at) return json({ error: "invalid_session" }, 401);
  if (Date.parse(row.expires_at) <= Date.now()) return json({ error: "session_expired" }, 401);
  if (!(await timingSafeEqual(await sha256(rawToken), row.token_hash))) return json({ error: "invalid_session" }, 401);
  if (!row.telegram_user_id && !row.email_verified_at) {
    await env.DB.prepare("UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(sessionId).run();
    return json({ error: "email_verification_required" }, 401);
  }

  await env.DB.prepare("UPDATE user_sessions SET last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(sessionId).run();

  return {
    sessionId,
    csrfTokenHash: row.csrf_hash,
    user: {
      id: row.user_id,
      telegram_user_id: row.telegram_user_id ?? null,
      email: row.email ?? null,
      email_verified_at: row.email_verified_at ?? null,
      pending_email: row.pending_email ?? null,
      display_name: row.display_name ?? null,
      language: row.language ?? "en",
      country: row.country ?? "IL",
      selected_bot_url: row.selected_bot_url ?? null,
      status: row.status ?? "active",
      created_at: row.created_at ?? "",
      updated_at: row.updated_at ?? "",
      last_seen_at: row.last_seen_at ?? null
    }
  };
}

async function requireCsrf(request: Request, auth: AuthenticatedSession): Promise<Response | null> {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") return null;
  const token = request.headers.get("X-CSRF-Token") ?? "";
  if (!token || !(await timingSafeEqual(await sha256(token), auth.csrfTokenHash))) {
    return json({ error: "csrf_token_required" }, 403);
  }
  return null;
}

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("Cookie") ?? "";
  const prefix = `${name}=`;
  for (const part of cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
  }
  return null;
}

async function persistLegalAcceptances(env: Env, userId: string, body: Record<string, unknown>): Promise<void> {
  const accepted = body.acceptances;
  if (!Array.isArray(accepted)) return;
  for (const item of accepted.slice(0, 20)) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const documentType = cleanEnum(record.documentType, ["terms", "risk_disclaimer", "subscription_terms", "api_terms", "api_commercial_use"], "terms");
    const documentVersion = cleanString(record.documentVersion) ?? "v0.1";
    await env.DB.prepare(
      `INSERT INTO legal_acceptances (id, user_id, document_type, document_version, metadata_json)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, document_type, document_version) DO UPDATE SET accepted_at = CURRENT_TIMESTAMP, metadata_json = excluded.metadata_json`
    ).bind(crypto.randomUUID(), userId, documentType, documentVersion, JSON.stringify(record.metadata ?? {})).run();
  }
}

async function resolveUserFromUrl(url: URL, env: Env): Promise<AppUser | null> {
  const userId = cleanString(url.searchParams.get("userId"));
  const email = cleanString(url.searchParams.get("email"))?.toLowerCase() ?? null;
  const telegramUserId = cleanString(url.searchParams.get("telegramUserId"));
  if (email && !isValidEmail(email)) return null;
  return userId ? findUserById(env, userId) : findUser(env, { telegramUserId, email });
}

async function listApiKeys(env: Env, userId: string): Promise<Array<Record<string, JsonValue>>> {
  const result = await env.DB.prepare(
    `SELECT id, user_id, name, key_prefix, scopes_json, last_used_at, expires_at, is_active, created_at, updated_at
     FROM api_keys
     WHERE user_id = ?
     ORDER BY created_at DESC`
  ).bind(userId).all<ApiKeyRecord>();

  return result.results.map((key) => ({
    id: key.id,
    userId: key.user_id,
    name: key.name,
    keyPrefix: key.key_prefix,
    scopes: parseJsonSafe<JsonValue[]>(key.scopes_json, []),
    lastUsedAt: key.last_used_at,
    expiresAt: key.expires_at,
    isActive: Boolean(key.is_active),
    createdAt: key.created_at,
    updatedAt: key.updated_at
  }));
}

async function listAnalysisHistory(env: Env, userId: string, limit: number): Promise<Array<Record<string, JsonValue>>> {
  const result = await env.DB.prepare(
    `SELECT id, request_id, source, country, language, status, tickers_json, response_json, created_at, updated_at
     FROM analysis_requests
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`
  ).bind(userId, limit).all<{
    id: string;
    request_id: string | null;
    source: string;
    country: string | null;
    language: string | null;
    status: string;
    tickers_json: string;
    response_json: string;
    created_at: string;
    updated_at: string;
  }>();

  return result.results.map((row) => ({
    id: row.id,
    requestId: row.request_id,
    source: row.source,
    country: row.country,
    language: row.language,
    status: row.status,
    tickers: parseJsonSafe<JsonValue[]>(row.tickers_json, []),
    response: parseJsonSafe<Record<string, JsonValue>>(row.response_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

async function recordApiUsage(env: Env, input: { userId: string | null; apiKeyId?: string | null; endpoint: string }): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const id = await sha256(`${day}:${input.userId ?? "anonymous"}:${input.apiKeyId ?? "none"}:${input.endpoint}`);
  await env.DB.prepare(
    `INSERT INTO api_usage_daily (id, day, user_id, api_key_id, endpoint, count, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP`
  ).bind(id, day, input.userId, input.apiKeyId ?? null, input.endpoint).run();
}

export async function requireApiKey(request: Request, env: Env, requiredScope: typeof API_KEY_SCOPES[number]): Promise<ApiKeyIdentity | Response> {
  if (!env.API_KEY_HASH_SECRET) return json({ error: "api_key_hash_secret_not_configured" }, 503);
  const token = bearerToken(request);
  if (!token || !token.startsWith("msk_live_") || token.length < 40) return json({ error: "invalid_api_key" }, 401);

  const prefix = token.slice(0, 18);
  const candidates = await env.DB.prepare(
    `SELECT id, user_id, key_hash, scopes_json, expires_at, is_active, hash_version
     FROM api_keys WHERE key_prefix = ?`
  ).bind(prefix).all<{
    id: string;
    user_id: string;
    key_hash: string;
    scopes_json: string;
    expires_at: string | null;
    is_active: number;
    hash_version: string;
  }>();
  if (!candidates.results.length) return json({ error: "invalid_api_key" }, 401);

  const keyedHash = await hmacHex(env.API_KEY_HASH_SECRET, token);
  let key: typeof candidates.results[number] | undefined;
  for (const candidate of candidates.results) {
    if (candidate.hash_version === "hmac_sha256_v1" && await timingSafeEqual(candidate.key_hash, keyedHash)) {
      key = candidate;
      break;
    }
  }
  if (!key) {
    const legacyHash = await sha256(token);
    if (candidates.results.some((candidate) => candidate.hash_version === "sha256_legacy" && candidate.key_hash === legacyHash)) {
      return json({ error: "api_key_rotation_required" }, 401);
    }
    return json({ error: "invalid_api_key" }, 401);
  }

  if (!key.is_active) return json({ error: "api_key_revoked" }, 401);
  if (key.expires_at && Date.parse(key.expires_at) <= Date.now()) return json({ error: "api_key_expired" }, 401);
  const scopes = parseJsonSafe<string[]>(key.scopes_json, []);
  if (!scopes.includes(requiredScope)) return json({ error: "api_key_scope_required", requiredScope }, 403);

  const user = await findUserById(env, key.user_id);
  if (!user || user.status !== "active") return json({ error: "user_not_active" }, 403);
  if (!isSubscriptionCurrentlyAllowed(await latestSubscription(env, key.user_id))) {
    return json({ error: "active_subscription_required" }, 403);
  }
  return { id: key.id, userId: key.user_id, scopes };
}

async function enforceApiAnalysisLimits(request: Request, env: Env, identity: ApiKeyIdentity): Promise<Response | null> {
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For") ?? "unknown";
  const checks = [
    ["api_key", identity.id, 60],
    ["api_user", identity.userId, 120],
    ["api_ip", await sha256(ip), 120]
  ] as const;
  for (const [bucket, subject, limit] of checks) {
    if (!(await consumeRateLimit(env, bucket, subject, limit, 60))) {
      return json({ error: "rate_limited", bucket, retryAfter: 60 }, 429);
    }
  }
  return null;
}

async function consumeRateLimit(env: Env, bucket: string, subject: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const expiresAt = windowStart + windowSeconds;
  const key = await sha256(`${bucket}:${subject}:${windowStart}`);
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, bucket, count, window_start, expires_at, updated_at)
     VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP
     RETURNING count`
  ).bind(key, bucket, windowStart, expiresAt).first<{ count: number }>();
  return Boolean(row && row.count <= limit);
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

async function latestQuotaSummary(env: Env, userId: string): Promise<{ limitCredits: number; usedCredits: number; remainingCredits: number } | null> {
  const row = await env.DB.prepare(
    `SELECT quota_limit_credits, used_credits
     FROM quota_balances
     WHERE user_id = ?
     ORDER BY updated_at DESC
     LIMIT 1`
  ).bind(userId).first<{ quota_limit_credits: number; used_credits: number }>();
  if (!row) return null;
  return {
    limitCredits: row.quota_limit_credits,
    usedCredits: row.used_credits,
    remainingCredits: Math.max(0, row.quota_limit_credits - row.used_credits)
  };
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

function subscriptionRenewalState(status: string | null, currentPeriodEnd: string | null): "none" | "renews" | "past_due" | "canceled" | "expired" {
  if (!status) return "none";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "canceled";
  if (status === "expired") return "expired";
  if (currentPeriodEnd && Date.parse(currentPeriodEnd) <= Date.now()) return "expired";
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(status as typeof ACTIVE_SUBSCRIPTION_STATUSES[number]) ? "renews" : "none";
}

function appendUrlParams(url: string, params: Record<string, string>): string {
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value) parsed.searchParams.set(key, value);
  }
  return parsed.toString();
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

async function requireInternalAccess(request: Request, env: Env, rawBody: string, requiredScope: InternalScope): Promise<Response | null> {
  const keyId = cleanString(request.headers.get("X-Key-Id") ?? request.headers.get("X-Market-Signal-Key-Id"));
  const requestId = cleanString(request.headers.get("X-Request-Id"));
  if (!keyId || !requestId || keyId.length > 64 || requestId.length > 128) {
    return json({ error: "internal_key_and_request_id_required" }, 401);
  }
  const secret = internalSecretForKey(env, keyId);
  if (!secret) {
    return hasAnyInternalSigningSecret(env) ? json({ error: "unauthorized" }, 401) : json({ error: "internal_signing_keys_not_configured" }, 503);
  }
  const timestamp = request.headers.get("X-Timestamp") ?? request.headers.get("X-Market-Signal-Timestamp");
  const signature = request.headers.get("X-Signature") ?? request.headers.get("X-Market-Signal-Signature");
  if (!timestamp || !signature) return json({ error: "internal_signature_required" }, 401);

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    return json({ error: "internal_timestamp_expired" }, 401);
  }

  const url = new URL(request.url);
  const canonicalQuery = canonicalSearchParams(url.searchParams);
  const bodyHash = await sha256(rawBody);
  const canonical = `${timestamp}.${keyId}.${requestId}.${request.method}.${url.pathname}.${canonicalQuery}.${bodyHash}`;
  const expected = await hmacHex(secret, canonical);
  const normalizedSignature = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;
  if (!(await timingSafeEqual(normalizedSignature, expected))) return json({ error: "unauthorized" }, 401);

  if (!env.INTERNAL_API_SCOPES_JSON) return json({ error: "internal_scope_map_not_configured" }, 503);
  const scopes = internalScopesForKey(env, keyId);
  if (!scopes.includes(requiredScope)) {
    return json({ error: "internal_scope_required", requiredScope }, 403);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM internal_request_nonces WHERE expires_at < ?").bind(nowSeconds).run();
  const expiresAt = nowSeconds + 10 * 60;
  const insert = await env.DB.prepare(
    `INSERT OR IGNORE INTO internal_request_nonces (key_id, request_id, signature_hash, request_timestamp, expires_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(keyId, requestId, await sha256(normalizedSignature), Number(timestamp), expiresAt).run();
  if ((insert.meta?.changes ?? 0) !== 1) return json({ error: "internal_request_replayed" }, 409);

  return null;
}

function internalScopesForKey(env: Env, keyId: string): InternalScope[] {
  const scopeMap = parseJsonSafe<Record<string, unknown>>(env.INTERNAL_API_SCOPES_JSON ?? "{}", {});
  const configured = scopeMap[keyId];
  if (!Array.isArray(configured)) return [];
  const allowed: InternalScope[] = ["matcher:access", "matcher:deliver", "scanner:access", "scanner:cache", "scanner:history", "website:subscriptions"];
  return configured.filter((scope): scope is InternalScope => typeof scope === "string" && allowed.includes(scope as InternalScope));
}

function internalSecretForKey(env: Env, keyId: string): string | null {
  if (env.INTERNAL_API_SECRETS_JSON) {
    const secrets = parseJsonSafe<Record<string, unknown>>(env.INTERNAL_API_SECRETS_JSON, {});
    const configured = secrets[keyId];
    if (typeof configured === "string" && configured.length >= 32) return configured;
  }
  const splitSecretName = `INTERNAL_API_SECRET_${keyId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  const splitSecret = (env as unknown as Record<string, unknown>)[splitSecretName];
  if (typeof splitSecret === "string" && splitSecret.length >= 32) return splitSecret;
  if (env.INTERNAL_API_SECRET && env.INTERNAL_API_SECRET.length >= 32 && env.INTERNAL_API_KEY_ID === keyId) return env.INTERNAL_API_SECRET;
  return null;
}

function hasAnyInternalSigningSecret(env: Env): boolean {
  if (env.INTERNAL_API_SECRETS_JSON) return true;
  if (env.INTERNAL_API_SECRET && env.INTERNAL_API_KEY_ID) return true;
  return Object.entries(env as unknown as Record<string, unknown>).some(([key, value]) =>
    key.startsWith("INTERNAL_API_SECRET_") && typeof value === "string" && value.length >= 32
  );
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

class TelegramDeliveryError extends Error {
  constructor(public readonly code: string, public readonly retrySafe: boolean, public readonly detail: string | null = null) {
    super(code);
  }
}

async function sendDeliveryTelegramMessage(env: Env, chatId: string, text: string): Promise<string> {
  if (!env.TELEGRAM_BOT_TOKEN) throw new TelegramDeliveryError("telegram_bot_token_not_configured", true);
  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch {
    throw new TelegramDeliveryError("telegram_delivery_indeterminate", false);
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new TelegramDeliveryError("telegram_delivery_indeterminate", false);
  }
  if (!response.ok || !isTelegramOk(data)) {
    throw new TelegramDeliveryError("telegram_delivery_rejected", true, telegramFailureDetail(response.status, data));
  }
  const messageId = isRecord(data.result) ? data.result.message_id : null;
  if (typeof messageId !== "number" && typeof messageId !== "string") {
    throw new TelegramDeliveryError("telegram_delivery_indeterminate", false);
  }
  return String(messageId);
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

function telegramFailureDetail(status: number, data: unknown): string {
  const errorCode = isRecord(data) && typeof data.error_code === "number" ? data.error_code : status;
  const description = isRecord(data) && typeof data.description === "string" ? data.description : "telegram_request_failed";
  return `telegram_delivery_rejected:${errorCode}:${sanitizeTelegramErrorDescription(description)}`;
}

function sanitizeTelegramErrorDescription(description: string): string {
  return description
    .replace(/bot\d+:[A-Za-z0-9_-]+/g, "bot[redacted]")
    .replace(/@[A-Za-z][A-Za-z0-9_]{4,31}/g, "@[redacted]")
    .replace(/-?\d{8,}/g, "[redacted-number]")
    .slice(0, 180);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExactRecord(value: unknown, keys: string[]): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
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

function parseJsonSafe<T>(rawBody: string, fallback: T): T {
  try {
    return JSON.parse(rawBody) as T;
  } catch {
    return fallback;
  }
}

function randomSecret(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fillUsageSeries(rows: Array<{ day: string; count: number }>, days: number): Array<{ day: string; count: number }> {
  const byDay = new Map(rows.map((row) => [row.day, Number(row.count) || 0]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (days - index - 1));
    const day = date.toISOString().slice(0, 10);
    return { day, count: byDay.get(day) ?? 0 };
  });
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 && cleaned.length <= 512 ? cleaned : null;
}

function cleanTicker(value: unknown): string | null {
  const cleaned = cleanString(value)?.toUpperCase().replace(/^\$/, "");
  if (!cleaned || !/^[A-Z0-9][A-Z0-9._:-]{0,15}$/.test(cleaned)) return null;
  return cleaned;
}

export function parseFutureIsoTimestamp(value: unknown): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null || value === "") return { ok: true, value: null };
  const raw = cleanString(value);
  if (!raw || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) return { ok: false };
  const timestamp = Date.parse(raw);
  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) return { ok: false };
  return { ok: true, value: new Date(timestamp).toISOString() };
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
  return jsonWithHeaders(data, {}, status);
}

function jsonWithHeaders(data: unknown, extraHeaders: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

function withCors(request: Request, response: Response, env: Env): Response {
  const headers = new Headers(response.headers);
  const origin = allowedCorsOrigin(request, env);
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-CSRF-Token,X-Admin-User,X-Webhook-Secret,X-Timestamp,X-Signature,X-Market-Signal-Timestamp,X-Market-Signal-Signature");
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

type SaasPage =
  | "landing"
  | "pricing"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "channels"
  | "api"
  | "ticker"
  | "reports"
  | "billing";

function pageForPath(pathname: string): SaasPage | null {
  const routes: Record<string, SaasPage> = {
    "/": "landing",
    "/pricing": "pricing",
    "/login": "auth",
    "/signup": "auth",
    "/onboarding": "onboarding",
    "/dashboard": "dashboard",
    "/channels": "channels",
    "/api-access": "api",
    "/ticker": "ticker",
    "/reports": "reports",
    "/billing": "billing"
  };
  return routes[pathname] ?? null;
}

function renderSaasPage(env: Env, page: SaasPage): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle(env, page))}</title>
  <style>${baseCss()}${saasCss()}</style>
</head>
<body class="saas-body">
  <header class="topbar">
    <a class="logo" href="/"><span class="mark">MS</span><span>${escapeHtml(env.PUBLIC_APP_NAME)}</span></a>
    <nav>
      <a href="/pricing">Pricing</a>
      <a href="/ticker">Ticker analysis</a>
      <a href="/api-access">API</a>
      <a href="/telegram">Telegram entry</a>
      <a class="nav-cta" href="/signup">Start research trial</a>
    </nav>
  </header>
  ${page === "landing" ? renderLanding() : ""}
  ${page === "pricing" ? renderPricing() : ""}
  ${page === "auth" ? renderAuth() : ""}
  ${page === "onboarding" ? renderOnboarding() : ""}
  ${page === "dashboard" ? renderDashboard() : ""}
  ${page === "channels" ? renderChannels() : ""}
  ${page === "api" ? renderApiAccess() : ""}
  ${page === "ticker" ? renderTickerAnalysis() : ""}
  ${page === "reports" ? renderReports() : ""}
  ${page === "billing" ? renderBilling() : ""}
  <script>${saasScript()}</script>
</body>
</html>`;
}

function pageTitle(env: Env, page: SaasPage): string {
  const labels: Record<SaasPage, string> = {
    landing: env.PUBLIC_APP_NAME,
    pricing: `Pricing - ${env.PUBLIC_APP_NAME}`,
    auth: `Sign in - ${env.PUBLIC_APP_NAME}`,
    onboarding: `Onboarding - ${env.PUBLIC_APP_NAME}`,
    dashboard: `Dashboard - ${env.PUBLIC_APP_NAME}`,
    channels: `Countries and channels - ${env.PUBLIC_APP_NAME}`,
    api: `API access - ${env.PUBLIC_APP_NAME}`,
    ticker: `Ticker analysis - ${env.PUBLIC_APP_NAME}`,
    reports: `Reports - ${env.PUBLIC_APP_NAME}`,
    billing: `Billing - ${env.PUBLIC_APP_NAME}`
  };
  return labels[page];
}

function renderLanding(): string {
  return `<main class="saas-shell">
    <section class="hero-band">
      <div class="hero-copy">
        <p class="eyebrow">Commercial market intelligence SaaS</p>
        <h1>Market Signal AI</h1>
        <p class="hero-text">Read-only country news channels, private premium ticker analysis, API access, and operator monitoring in one subscription product.</p>
        <div class="hero-actions">
          <a class="primary-action" href="/signup">Start research trial</a>
          <a class="secondary-action" href="/dashboard">View dashboard</a>
        </div>
      </div>
      <div class="product-visual" aria-label="Market Signal AI product preview">
        <div class="terminal-panel">
          <div class="terminal-head"><span>Live scan</span><strong>US / IL</strong></div>
          <div class="signal-line up"><span>NVDA</span><strong>+1.8%</strong><em>AI supply-chain headline cluster</em></div>
          <div class="signal-line warn"><span>OIL</span><strong>-0.7%</strong><em>Policy risk update</em></div>
          <div class="signal-line up"><span>TA35</span><strong>+0.5%</strong><em>Local banking flow improving</em></div>
        </div>
        <div class="chart-panel"><span></span><span></span><span></span><span></span><span></span><span></span></div>
      </div>
    </section>
    <section class="feature-grid">
      ${feature("Broadcast workflow", "Publish matched market news into read-only country and language channels.")}
      ${feature("Private analysis", "Keep user-requested ticker analysis private through website, API, or the premium bot.")}
      ${feature("Admin monitoring", "Track users, subscriptions, events, bot routes, and operational health.")}
    </section>
  </main>`;
}

function renderPricing(): string {
  return `<main class="saas-shell page-stack">
    <section class="page-heading"><p class="eyebrow">Pricing</p><h1>Plans for market research teams</h1><p>Start with read-only country channels, then add private informational ticker analysis, API access, and report automation as volume grows. Subscription access does not include investment advice or guaranteed outcomes.</p></section>
    <section class="pricing-grid">
      ${plan("Starter", "$29", ["2 read-only country feeds", "Telegram WebApp account control", "Report history", "Informational analytics only"], "Start research trial")}
      ${plan("Pro", "$79", ["10 read-only feeds", "Private ticker analysis quota", "API key access", "Billing controls"], "Choose Pro", true)}
      ${plan("Desk", "Custom", ["Multiple operators", "Admin monitoring", "Webhook integrations", "Custom bot routes"], "Contact sales")}
    </section>
    <section class="legal-strip">
      <strong>Before checkout</strong>
      <p>Your subscription renews automatically until canceled. Market Signal AI provides informational market research only, not investment advice or guaranteed outcomes.</p>
      <label class="consent-line"><input type="checkbox"> I understand that Market Signal AI is not investment advice and that subscriptions renew automatically until canceled.</label>
    </section>
  </main>`;
}

function renderAuth(): string {
  return `<main class="auth-layout">
    <section class="auth-copy"><p class="eyebrow">Welcome back</p><h1>Sign in to manage market research</h1><p>Use email for the full SaaS workspace. Telegram remains a quick account and delivery control surface. Market Signal AI provides informational analytics only, not investment advice.</p></section>
    <form class="panel auth-card">
      <label>Email<input type="email" placeholder="you@company.com" autocomplete="email"></label>
      <label>Password<input type="password" placeholder="Password" autocomplete="current-password"></label>
      <button type="button" data-demo-login>Continue</button>
      <a href="/onboarding">Create an account instead</a>
    </form>
  </main>`;
}

function renderOnboarding(): string {
  return `<main class="app-layout">${appSidebar("onboarding")}<section class="workspace">
    <div class="page-heading compact"><p class="eyebrow">Onboarding</p><h1>Set up your market research workspace</h1></div>
    <div class="step-grid">
      ${step("1", "Choose markets", "Pick read-only country and language channels.")}
      ${step("2", "Connect Telegram", "Join broadcasts and start the private bot if your plan allows it.")}
      ${step("3", "Activate plan", "Unlock private analysis, API access, and report history.")}
    </div>
    <section class="panel form-surface">
      <label>Workspace name<input value="Market Desk"></label>
      <label>Primary use case<select><option>Trading desk monitoring</option><option>Investor research</option><option>News intelligence API</option></select></label>
      <a class="primary-action inline-action" href="/dashboard">Finish setup</a>
    </section>
  </section></main>`;
}

function renderDashboard(): string {
  return `<main class="app-layout">${appSidebar("dashboard")}<section class="workspace">
    <div class="workspace-head"><div><p class="eyebrow">Dashboard</p><h1>Today's market research board</h1><p>Informational analytics only. Not investment advice or a buy/sell/hold recommendation.</p></div><a class="primary-action" href="/ticker">Analyze ticker privately</a></div>
    <section class="metrics product-metrics">
      ${metricCard("Read-only feeds", "2", "Israel, US")}
      ${metricCard("Reports generated", "128", "+18 this week")}
      ${metricCard("API calls", "14.2k", "72% quota")}
      ${metricCard("Telegram users", "341", "active subscribers")}
    </section>
    <section class="dashboard-grid">
      <div class="panel"><h2>Read-only news channels</h2><p class="legal-note">Channel posts are visible to channel subscribers. Do not send private ticker requests in country channels.</p>${signalRows()}</div>
      <div class="panel"><h2>Private analysis quota</h2><p class="score">42 requests left</p><p class="legal-note">Private ticker analysis is delivered only through your account, API, or private bot. It is still informational only.</p><a class="primary-action inline-action" href="/ticker">Analyze privately</a></div>
    </section>
  </section></main>`;
}

function renderChannels(): string {
  return `<main class="app-layout">${appSidebar("channels")}<section class="workspace">
    <div class="page-heading compact"><p class="eyebrow">Countries, languages, channels</p><h1>Manage read-only market channels</h1><p>Country channels are broadcast-only. Personal ticker requests belong in the private bot, website, or API.</p></div>
    <section class="channel-grid">
      ${channel("Israel", "Hebrew", "Read-only Telegram channel", "Active")}
      ${channel("United States", "Russian", "Read-only Telegram channel", "Active")}
      ${channel("United Kingdom", "English", "Website feed", "Draft")}
      ${channel("Germany", "German", "Telegram channel pending", "Planned")}
    </section>
  </section></main>`;
}

function renderApiAccess(): string {
  return `<main class="app-layout">${appSidebar("api")}<section class="workspace">
    <div class="workspace-head"><div><p class="eyebrow">API access</p><h1>Production API key</h1></div><button type="button">Rotate key</button></div>
    <section class="panel api-panel">
      <label>API key<input readonly value="ms_live_**********************"></label>
      <p class="legal-note">User API keys are for approved plan features only. Internal service routes use backend HMAC signing and must never be called from browser code.</p>
      <pre>POST /api/analysis/requests
Authorization: Bearer msk_live_&lt;user_api_key&gt;
Content-Type: application/json

{"ticker":"NVDA","reportType":"regular"}</pre>
    </section>
    <section class="metrics product-metrics">${metricCard("Rate limit", "120/min", "per workspace")}${metricCard("Webhook status", "Healthy", "signed payloads")}${metricCard("Last call", "2m ago", "200 OK")}</section>
  </section></main>`;
}

function renderTickerAnalysis(): string {
  return `<main class="app-layout">${appSidebar("ticker")}<section class="workspace">
    <div class="workspace-head"><div><p class="eyebrow">Private ticker analysis</p><h1>Analyze a ticker privately with news context</h1><p>Results are delivered only to your account, API integration, or private Telegram bot. They are not posted to country channels.</p></div></div>
    <section class="panel ticker-search"><p class="legal-note">Ticker analysis is not a buy, sell, or hold recommendation. Verify independently before acting.</p><input value="NVDA"><button type="button">Run analysis</button></section>
    <section class="analysis-grid">
      <div class="panel"><h2>Informational summary</h2><p class="score">Positive momentum context</p><p>News momentum, valuation risk, and supplier sentiment are summarized for research only.</p></div>
      <div class="panel"><h2>Drivers</h2><ul><li>AI infrastructure demand remains the core narrative.</li><li>Options activity implies higher short-term volatility.</li><li>Macro rate sensitivity is the main risk factor.</li></ul></div>
    </section>
  </section></main>`;
}

function renderReports(): string {
  return `<main class="app-layout">${appSidebar("reports")}<section class="workspace">
    <div class="page-heading compact"><p class="eyebrow">Report history</p><h1>Generated research archive</h1><p>Reports are informational only and are not personalized investment advice.</p></div>
    <section class="panel table-card"><table><thead><tr><th>Report</th><th>Market</th><th>Status</th><th>Created</th></tr></thead><tbody>
      <tr><td>NVDA momentum digest</td><td>US</td><td>Ready</td><td>Today 09:40</td></tr>
      <tr><td>Banking policy watch</td><td>IL</td><td>Ready</td><td>Yesterday 18:05</td></tr>
      <tr><td>Energy headline scan</td><td>Global</td><td>Processing</td><td>Yesterday 12:22</td></tr>
    </tbody></table></section>
  </section></main>`;
}

function renderBilling(): string {
  return `<main class="app-layout">${appSidebar("billing")}<section class="workspace">
    <div class="page-heading compact"><p class="eyebrow">Billing</p><h1>Subscription and invoices</h1><p>Paid access controls product features only. It does not include investment advice or guaranteed outcomes.</p></div>
    <section class="billing-grid">
      <div class="panel"><h2>Current plan</h2><p class="price-line">Pro - $79/mo</p><p>Renews on July 15, 2026 unless canceled before renewal.</p><p class="legal-note">Cancellation stops future renewals. Current paid access may remain active until the end of the billing period.</p><button type="button">Open billing portal</button></div>
      <div class="panel"><h2>Payment method</h2><p>Billing, invoices, receipts, cancellation, and payment method updates are handled by the approved Merchant of Record portal.</p><button type="button">Manage payment</button></div>
    </section>
  </section></main>`;
}

function feature(title: string, body: string): string {
  return `<article class="feature-card"><h2>${title}</h2><p>${body}</p></article>`;
}

function plan(title: string, price: string, items: string[], action: string, highlighted = false): string {
  return `<article class="plan-card${highlighted ? " highlighted" : ""}"><h2>${title}</h2><p class="plan-price">${price}</p><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul><a class="primary-action" href="/signup">${action}</a></article>`;
}

function step(number: string, title: string, body: string): string {
  return `<article class="step-card"><span>${number}</span><h2>${title}</h2><p>${body}</p></article>`;
}

function metricCard(label: string, value: string, detail: string): string {
  return `<article class="metric"><strong>${value}</strong><span>${label}</span><p>${detail}</p></article>`;
}

function channel(country: string, language: string, delivery: string, status: string): string {
  return `<article class="channel-card"><h2>${country}</h2><p>${language}</p><strong>${delivery}</strong><span>${status}</span></article>`;
}

function signalRows(): string {
  return ["NVDA - AI infrastructure headlines", "TA35 - local banking flow", "BTC - risk appetite proxy", "OIL - policy pressure"]
    .map((item) => `<div class="signal-row"><span>${item}</span><strong>Review</strong></div>`)
    .join("");
}

function appSidebar(active: string): string {
  const links = [
    ["dashboard", "/dashboard", "Dashboard"],
    ["onboarding", "/onboarding", "Onboarding"],
    ["channels", "/channels", "Countries"],
    ["api", "/api-access", "API access"],
    ["ticker", "/ticker", "Ticker analysis"],
    ["reports", "/reports", "Reports"],
    ["billing", "/billing", "Billing"],
    ["admin", "/admin", "Admin"]
  ];
  return `<aside class="app-sidebar"><a class="logo" href="/"><span class="mark">MS</span><span>Market Signal AI</span></a><nav>${links.map(([key, href, label]) => `<a class="${active === key ? "active" : ""}" href="${href}">${label}</a>`).join("")}</nav><a class="telegram-link" href="/telegram">Telegram quick entry</a></aside>`;
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
        <p>Quick Telegram account entry for read-only channels and private analysis status</p>
      </div>
    </section>
    <section class="notice-panel">
      <strong>Telegram is a quick entry, not the full product.</strong>
      <p>Country channels are read-only broadcasts. Private ticker analysis is handled only in your private bot chat, website account, or API, subject to plan and quota.</p>
      <p>Informational market research only. Not investment advice.</p>
    </section>
    <form id="profileForm" class="panel">
      <label>Name<input name="displayName" autocomplete="name" placeholder="Your name"></label>
      <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>
      <label>Language<select name="language" id="language"></select></label>
      <fieldset>
        <legend>Read-only news countries</legend>
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
            <h2>API usage</h2>
            <div id="apiUsage" class="table"></div>
          </section>
          <section class="panel">
            <h2>Recent subscriptions</h2>
            <div id="subscriptions" class="table"></div>
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
              <input name="routeId" placeholder="israel-he">
              <input name="country" placeholder="IL">
              <input name="language" placeholder="he">
              <input name="botUrl" placeholder="https://t.me/your_israel_bot">
              <input name="telegramChatId" placeholder="@channel or -100...">
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
.notice-panel { margin-bottom: 14px; border: 1px solid #b9ded6; border-radius: 8px; padding: 14px; background: #ecfdf5; }
.notice-panel strong { color: #115e59; }
.notice-panel p { color: #31544f; }
body.dark .notice-panel { border-color: #0f766e; background: #0f2f2c; }
body.dark .notice-panel strong { color: #99f6e4; }
body.dark .notice-panel p { color: #c7dad5; }
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

function saasCss(): string {
  return `
.saas-body { background: #f4f6f4; color: #16201f; }
.topbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 72px; padding: 0 max(24px, calc((100vw - 1180px) / 2)); border-bottom: 1px solid #dce5df; background: rgba(244, 246, 244, 0.94); backdrop-filter: blur(14px); }
.logo { display: inline-flex; align-items: center; gap: 10px; color: #16201f; font-weight: 900; text-decoration: none; }
.topbar nav { display: flex; align-items: center; gap: 18px; font-size: 14px; font-weight: 800; }
.topbar nav a, .app-sidebar a { color: #425552; text-decoration: none; }
.topbar nav a:hover, .app-sidebar a:hover { color: #0f766e; }
.nav-cta, .primary-action, .secondary-action { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border-radius: 6px; padding: 0 14px; font-weight: 900; text-decoration: none; }
.nav-cta, .primary-action { background: #0f766e; color: #fff !important; }
.secondary-action { border: 1px solid #b8c9c4; color: #16201f; background: #fff; }
.saas-shell { width: min(1180px, calc(100% - 48px)); margin: 0 auto; padding: 32px 0 56px; }
.hero-band { min-height: calc(100vh - 120px); display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(420px, 1.1fr); gap: 42px; align-items: center; padding: 28px 0; }
.hero-copy h1, .page-heading h1, .workspace h1, .auth-copy h1 { margin: 0; font-size: clamp(42px, 7vw, 84px); line-height: 0.94; letter-spacing: 0; color: #101817; }
.workspace h1, .page-heading.compact h1 { font-size: 34px; line-height: 1.08; }
.auth-copy h1, .page-heading h1 { font-size: clamp(36px, 5vw, 58px); line-height: 1; }
.eyebrow { margin: 0 0 10px; color: #0f766e; font-size: 12px; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
.hero-text { max-width: 620px; font-size: 19px; line-height: 1.55; color: #4f6360; }
.hero-actions, .workspace-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
.product-visual { position: relative; min-height: 480px; border-radius: 8px; overflow: hidden; border: 1px solid #193d39; background: radial-gradient(circle at 78% 18%, rgba(39, 245, 198, 0.34), transparent 28%), linear-gradient(145deg, #091312, #143331 52%, #05100f); box-shadow: 0 28px 90px rgba(13, 65, 60, 0.24); }
.product-visual::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5; }
.terminal-panel { position: absolute; left: 34px; top: 34px; right: 78px; display: grid; gap: 12px; padding: 18px; border: 1px solid rgba(166, 255, 226, 0.24); border-radius: 8px; background: rgba(7, 19, 18, 0.82); color: #dffcf4; }
.terminal-head, .signal-line, .signal-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.signal-line { min-height: 58px; border-radius: 6px; padding: 10px 12px; background: rgba(255,255,255,0.06); }
.signal-line span { color: #7ef7cf; font-weight: 950; }
.signal-line strong { color: #fff; }
.signal-line em { width: 48%; color: #a9bebb; font-style: normal; font-size: 13px; }
.signal-line.warn span { color: #f0bf57; }
.chart-panel { position: absolute; left: 50px; right: 34px; bottom: 34px; display: grid; grid-template-columns: repeat(6, 1fr); align-items: end; gap: 14px; height: 158px; }
.chart-panel span { display: block; border-radius: 6px 6px 0 0; background: linear-gradient(#6fffd0, #0f766e); opacity: 0.92; }
.chart-panel span:nth-child(1) { height: 42%; } .chart-panel span:nth-child(2) { height: 58%; } .chart-panel span:nth-child(3) { height: 48%; } .chart-panel span:nth-child(4) { height: 76%; } .chart-panel span:nth-child(5) { height: 64%; } .chart-panel span:nth-child(6) { height: 92%; }
.feature-grid, .pricing-grid, .step-grid, .channel-grid, .billing-grid, .analysis-grid, .dashboard-grid { display: grid; gap: 16px; }
.feature-grid { grid-template-columns: repeat(3, 1fr); }
.feature-card, .plan-card, .step-card, .channel-card { border: 1px solid #dce5df; border-radius: 8px; padding: 20px; background: #fff; }
.feature-card h2, .plan-card h2, .step-card h2, .channel-card h2 { margin: 0 0 8px; font-size: 19px; }
.page-stack { display: grid; gap: 24px; }
.page-heading { max-width: 760px; }
.pricing-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.plan-card { display: grid; gap: 16px; align-content: start; }
.plan-card.highlighted { border-color: #0f766e; box-shadow: 0 20px 70px rgba(15, 118, 110, 0.18); }
.plan-price, .price-line { margin: 0; color: #101817; font-size: 34px; font-weight: 950; }
.plan-card ul { margin: 0; padding-left: 18px; color: #4f6360; line-height: 1.8; }
.legal-strip { border: 1px solid #b9ded6; border-radius: 8px; padding: 16px; background: #eefaf6; }
.legal-strip strong { color: #0f766e; }
.consent-line { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; font-weight: 800; }
.consent-line input { width: 18px; min-height: 18px; margin-top: 1px; }
.auth-layout { width: min(1000px, calc(100% - 48px)); min-height: calc(100vh - 72px); margin: 0 auto; display: grid; grid-template-columns: 1fr 390px; gap: 38px; align-items: center; }
.auth-card { display: grid; gap: 16px; }
.auth-card a { color: #0f766e; font-weight: 900; }
.app-layout { min-height: calc(100vh - 72px); display: grid; grid-template-columns: 260px minmax(0, 1fr); }
.app-sidebar { position: sticky; top: 0; height: 100vh; display: grid; grid-template-rows: auto 1fr auto; gap: 22px; padding: 24px; border-right: 1px solid #dce5df; background: #fff; }
.app-sidebar nav { display: grid; gap: 6px; align-content: start; }
.app-sidebar nav a, .telegram-link { border-radius: 6px; padding: 11px 12px; font-weight: 850; }
.app-sidebar nav a.active { color: #0f766e; background: #e8f6f3; }
.telegram-link { background: #111d1b; color: #fff !important; text-align: center; }
.workspace { min-width: 0; padding: 28px; display: grid; gap: 18px; align-content: start; }
.workspace-head { justify-content: space-between; margin-top: 0; }
.product-metrics { margin-bottom: 0; }
.product-metrics .metric p { margin-top: 8px; font-size: 13px; }
.dashboard-grid, .analysis-grid, .billing-grid { grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr); }
.legal-note { color: #4f6360; line-height: 1.5; }
.signal-row { min-height: 48px; border-bottom: 1px solid #e7edef; }
.signal-row strong { color: #0f766e; }
.heat-list { display: grid; gap: 12px; }
.heat-list span { min-width: 190px; border-radius: 6px; padding: 10px; background: linear-gradient(90deg, #0f766e, #bdeee1); color: #fff; font-weight: 900; }
.channel-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.channel-card { display: grid; gap: 8px; }
.channel-card strong { color: #0f766e; }
.channel-card span { width: max-content; border-radius: 999px; padding: 4px 9px; background: #e8f6f3; color: #0f766e; font-size: 12px; font-weight: 950; }
.form-surface { max-width: 620px; }
.inline-action { width: max-content; }
.api-panel { display: grid; gap: 16px; }
pre { margin: 0; overflow-x: auto; border-radius: 8px; padding: 16px; background: #111d1b; color: #dffcf4; font-size: 13px; line-height: 1.6; }
.ticker-search { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; }
.ticker-search .legal-note { grid-column: 1 / -1; margin: 0; }
.score { color: #0f766e; font-size: 38px; font-weight: 950; }
.table-card table { min-width: 640px; }
@media (max-width: 960px) {
  .topbar { position: static; align-items: flex-start; flex-direction: column; padding: 18px 24px; }
  .topbar nav { flex-wrap: wrap; }
  .hero-band, .auth-layout, .app-layout, .dashboard-grid, .analysis-grid, .billing-grid { grid-template-columns: 1fr; }
  .product-visual { min-height: 390px; }
  .feature-grid, .pricing-grid { grid-template-columns: 1fr; }
  .app-sidebar { position: static; height: auto; border-right: 0; border-bottom: 1px solid #dce5df; }
}
@media (max-width: 560px) {
  .saas-shell, .auth-layout { width: min(100% - 28px, 1180px); }
  .workspace { padding: 18px 14px; }
  .hero-copy h1 { font-size: 44px; }
  .product-visual { min-height: 330px; }
  .terminal-panel { left: 16px; right: 16px; top: 16px; }
  .chart-panel { left: 18px; right: 18px; bottom: 18px; }
  .ticker-search { grid-template-columns: 1fr; }
}
`;
}

function saasScript(): string {
  return `
document.querySelectorAll("[data-demo-login]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = "/dashboard";
  });
});
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
let csrfToken = localStorage.getItem("marketSignalCsrfToken") || "";

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
    if (payload.error === "valid_email_required") {
      result.textContent = "Please enter a valid email address.";
    } else if (payload.error === "email_verification_required") {
      result.textContent = "Email confirmation is required. For now, open this form from the verified Telegram Web App.";
    } else {
      result.textContent = "Could not create account. Please check your details.";
    }
    return;
  }
  currentUserId = payload.userId;
  csrfToken = payload.csrfToken || "";
  localStorage.setItem("marketSignalUserId", currentUserId);
  localStorage.setItem("marketSignalCsrfToken", csrfToken);
  result.innerHTML = renderCountryLinks(payload.countryLinks);
  renderAccount(payload.countryLinks);
});

account.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-country]");
  if (!button || !currentUserId) return;
  const response = await fetch("/api/account/countries", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify({ country: button.dataset.country })
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
  const response = await fetch("/api/account");
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
const apiUsage = document.querySelector("#apiUsage");
const subscriptions = document.querySelector("#subscriptions");
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
      routeId: row.querySelector('[name="routeId"]').value,
      language: row.querySelector('[name="language"]').value,
      botUrl: row.querySelector('[name="botUrl"]').value,
      telegramChatId: row.querySelector('[name="telegramChatId"]').value,
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
    const [summary, userData, eventData, routeData, subscriptionData, usageData] = await Promise.all([
      api("/api/admin/overview"),
      api("/api/admin/users?" + query.toString()),
      api("/api/admin/events"),
      api("/api/admin/bot-routes"),
      api("/api/admin/subscriptions?limit=10"),
      api("/api/admin/api-usage?days=14")
    ]);
    adminContent.hidden = false;
    overview.innerHTML = [
      metric("Users", summary.users),
      metric("Active subscriptions", summary.activeSubscriptions),
      metric("Active API keys", usageData.activeApiKeys),
      metric("Analysis 24h", usageData.analysisRequests24h),
      metric("Events 24h", summary.events24h),
      metric("Active bot routes", summary.activeBotRoutes),
      metric("Server time", formatTime(summary.serverTime))
    ].join("");
    subscriptionChart.innerHTML = renderSubscriptionChart(summary.subscriptionSeries || []);
    apiUsage.innerHTML = renderApiUsage(usageData);
    subscriptions.innerHTML = renderSubscriptions(subscriptionData.subscriptions || []);
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

function renderApiUsage(data) {
  const rows = data.topEndpoints || [];
  if (!rows.length) return '<p>No API usage yet.</p>';
  return '<table><thead><tr><th>Endpoint</th><th>Calls</th></tr></thead><tbody>' +
    rows.map((row) => '<tr><td>' + escapeText(row.endpoint) + '</td><td>' + escapeText(row.count) + '</td></tr>').join("") +
    '</tbody></table>';
}

function renderSubscriptions(rows) {
  if (!rows.length) return '<p>No subscriptions yet.</p>';
  return '<table><thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Provider</th><th>Period end</th><th>Created</th></tr></thead><tbody>' +
    rows.map((row) => '<tr>' +
      '<td>' + escapeText(row.email || row.display_name || row.user_id) + '</td>' +
      '<td>' + escapeText(row.plan) + '</td>' +
      '<td>' + escapeText(row.status) + '</td>' +
      '<td>' + escapeText(row.provider) + '</td>' +
      '<td>' + escapeText(row.current_period_end || "") + '</td>' +
      '<td>' + escapeText(row.created_at) + '</td>' +
    '</tr>').join("") +
    '</tbody></table>';
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
  return '<table class="editable-table"><thead><tr><th>Route ID</th><th>Country</th><th>Language</th><th>Bot URL</th><th>Telegram target</th><th>Active</th><th>Updated</th><th></th><th></th></tr></thead><tbody>' +
    rows.map((row) => '<tr>' +
      '<td><input name="routeId" value="' + escapeText(row.route_id || row.country) + '"></td>' +
      '<td><input name="country" value="' + escapeText(row.country) + '"></td>' +
      '<td><select name="language">' + renderOption("en", "English", row.language) + renderOption("ru", "Russian", row.language) + renderOption("he", "Hebrew", row.language) + '</select></td>' +
      '<td><input name="botUrl" value="' + escapeText(row.bot_url) + '"></td>' +
      '<td><input name="telegramChatId" value="' + escapeText(row.telegram_chat_id || "") + '"></td>' +
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
