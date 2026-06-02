interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  PUBLIC_APP_NAME: string;
  DEFAULT_LOCALE: string;
  DEFAULT_COUNTRY: string;
  ADMIN_TOKEN?: string;
  TELEGRAM_BOT_TOKEN?: string;
  SUBSCRIPTION_WEBHOOK_SECRET?: string;
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
  provider?: string;
  externalId?: string;
  plan?: string;
  status?: string;
  currentPeriodEnd?: string;
  metadata?: Record<string, JsonValue>;
};

const COUNTRIES = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["GE", "Georgia"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["AE", "United Arab Emirates"]
];

const LANGUAGES = [
  ["en", "English"],
  ["ka", "ქართული"],
  ["ru", "Русский"],
  ["de", "Deutsch"],
  ["fr", "Français"],
  ["es", "Español"]
];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (request.method === "OPTIONS") {
        return withCors(new Response(null, { status: 204 }));
      }

      if (url.pathname === "/") {
        return htmlResponse(renderTelegramApp(env));
      }

      if (url.pathname === "/admin") {
        return htmlResponse(renderAdminApp(env));
      }

      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({ ok: true, service: env.PUBLIC_APP_NAME, environment: env.ENVIRONMENT });
      }

      if (url.pathname === "/api/config" && request.method === "GET") {
        return json({
          appName: env.PUBLIC_APP_NAME,
          defaultLocale: env.DEFAULT_LOCALE,
          defaultCountry: env.DEFAULT_COUNTRY,
          countries: COUNTRIES.map(([code, name]) => ({ code, name })),
          languages: LANGUAGES.map(([code, name]) => ({ code, name }))
        });
      }

      if (url.pathname === "/api/register" && request.method === "POST") {
        return withCors(await registerUser(request, env, ctx));
      }

      if (url.pathname === "/api/settings" && request.method === "PUT") {
        return withCors(await updateSettings(request, env, ctx));
      }

      if (url.pathname === "/api/subscriptions" && request.method === "POST") {
        return withCors(await acceptSubscription(request, env, ctx));
      }

      if (url.pathname === "/api/admin/overview" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(guard);
        return withCors(await adminOverview(env));
      }

      if (url.pathname === "/api/admin/users" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(guard);
        return withCors(await adminUsers(env, url));
      }

      if (url.pathname === "/api/admin/events" && request.method === "GET") {
        const guard = await requireAdmin(request, env);
        if (guard) return withCors(guard);
        return withCors(await adminEvents(env));
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
  const telegramUserId = cleanString(body.telegramUserId);
  const email = cleanString(body.email)?.toLowerCase() ?? null;
  const displayName = cleanString(body.displayName) ?? null;
  const language = cleanLanguage(body.language, env.DEFAULT_LOCALE);
  const country = cleanCountry(body.country, env.DEFAULT_COUNTRY);

  if (!telegramUserId && !email) {
    return json({ error: "telegramUserId_or_email_required" }, 400);
  }

  const existing = await findUser(env, { telegramUserId, email });
  const userId = existing?.id ?? crypto.randomUUID();
  const botUrl = await findBotUrl(env, country);

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
    ).bind(email, displayName, language, country, botUrl, userId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO users (id, telegram_user_id, email, display_name, language, country, selected_bot_url, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(userId, telegramUserId, email, displayName, language, country, botUrl).run();
  }

  await env.DB.prepare(
    `INSERT INTO user_settings (user_id, language, country)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, country = excluded.country, updated_at = CURRENT_TIMESTAMP`
  ).bind(userId, language, country).run();

  ctx.waitUntil(audit(env, userId, "user", "user.registered", request, { country, language }));

  return json({ userId, botUrl, status: "active" });
}

async function updateSettings(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await readJson<Record<string, unknown>>(request);
  const userId = cleanString(body.userId);
  if (!userId) return json({ error: "userId_required" }, 400);

  const language = cleanLanguage(body.language, env.DEFAULT_LOCALE);
  const country = cleanCountry(body.country, env.DEFAULT_COUNTRY);
  const riskProfile = cleanEnum(body.riskProfile, ["conservative", "balanced", "aggressive"], "balanced");
  const deliveryMode = cleanEnum(body.deliveryMode, ["telegram", "email", "both"], "telegram");
  const tickers = Array.isArray(body.tickers)
    ? body.tickers.map((ticker) => cleanString(ticker)?.toUpperCase()).filter(isString).slice(0, 50)
    : [];
  const botUrl = await findBotUrl(env, country);

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
  ).bind(language, country, botUrl, userId).run();

  ctx.waitUntil(audit(env, userId, "user", "settings.updated", request, { country, language, riskProfile, deliveryMode }));

  return json({ userId, botUrl, settings: { language, country, riskProfile, deliveryMode, tickers } });
}

async function acceptSubscription(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const guard = await requireWebhookSecret(request, env);
  if (guard) return guard;

  const body = await readJson<SubscriptionInput>(request);
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
  if (!userId) return json({ error: "known_user_required" }, 400);

  const subscriptionId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO subscriptions (id, user_id, provider, external_id, plan, status, current_period_end, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(subscriptionId, userId, provider, externalId, plan, status, currentPeriodEnd, JSON.stringify(body.metadata ?? {})).run();

  ctx.waitUntil(audit(env, userId, provider, "subscription.received", request, { plan, status, externalId }));

  return json({ subscriptionId, userId, status });
}

async function adminOverview(env: Env): Promise<Response> {
  const [users, activeSubscriptions, events, countries] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM users").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM subscriptions WHERE status IN ('trialing', 'active')").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM audit_events WHERE created_at >= datetime('now', '-24 hours')").first<{ count: number }>(),
    env.DB.prepare("SELECT country, COUNT(*) AS count FROM users GROUP BY country ORDER BY count DESC LIMIT 10").all()
  ]);

  return json({
    users: users?.count ?? 0,
    activeSubscriptions: activeSubscriptions?.count ?? 0,
    events24h: events?.count ?? 0,
    countries: countries.results
  });
}

async function adminUsers(env: Env, url: URL): Promise<Response> {
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
  const result = await env.DB.prepare(
    `SELECT u.*, s.plan, s.status AS subscription_status, s.current_period_end
     FROM users u
     LEFT JOIN subscriptions s ON s.id = (
       SELECT id FROM subscriptions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
     )
     ORDER BY u.created_at DESC
     LIMIT ?`
  ).bind(limit).all();

  return json({ users: result.results });
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

async function findBotUrl(env: Env, country: string): Promise<string | null> {
  const route = await env.DB.prepare("SELECT bot_url FROM bot_routes WHERE country = ? AND is_active = 1").bind(country).first<{ bot_url: string }>();
  return route?.bot_url ?? null;
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
  if (!token || !(await timingSafeEqual(token, env.ADMIN_TOKEN))) {
    return json({ error: "unauthorized" }, 401);
  }
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

function bearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
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

async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) throw new Error("Expected JSON request");
  return request.json() as Promise<T>;
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

function cleanLanguage(value: unknown, fallback: string): string {
  const cleaned = cleanString(value)?.toLowerCase();
  if (!cleaned || !/^[a-z]{2,8}$/.test(cleaned)) return fallback.toLowerCase();
  return cleaned;
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

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Webhook-Secret");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "DENY",
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
      <label>Name<input name="displayName" autocomplete="name" placeholder="Dmitriy"></label>
      <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>
      <label>Language<select name="language" id="language"></select></label>
      <label>Country<select name="country" id="country"></select></label>
      <button type="submit">Create account</button>
    </form>
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
    </section>
    <form id="authForm" class="panel auth-row">
      <input name="token" type="password" autocomplete="current-password" placeholder="Admin token">
      <button type="submit">Open</button>
    </form>
    <section id="overview" class="metrics"></section>
    <section class="panel">
      <h2>Users</h2>
      <div id="users" class="table"></div>
    </section>
    <section class="panel">
      <h2>Events</h2>
      <div id="events" class="events"></div>
    </section>
  </main>
  <script>${adminAppScript()}</script>
</body>
</html>`;
}

function baseCss(): string {
  return `
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; color: #172026; background: #f5f7f8; }
.shell { width: min(1040px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 48px; }
.app-shell { max-width: 560px; }
.brand { display: flex; gap: 14px; align-items: center; margin-bottom: 22px; }
.mark { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 8px; background: #143c3c; color: #fff; font-weight: 800; }
h1 { margin: 0; font-size: 26px; line-height: 1.15; letter-spacing: 0; }
h2 { margin: 0 0 14px; font-size: 18px; letter-spacing: 0; }
p { margin: 4px 0 0; color: #607077; }
.panel, .result { background: #fff; border: 1px solid #dfe7e9; border-radius: 8px; padding: 18px; box-shadow: 0 10px 30px rgba(20, 60, 60, 0.08); }
form { display: grid; gap: 14px; }
label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #34474f; }
input, select { width: 100%; min-height: 44px; border: 1px solid #cad6da; border-radius: 6px; padding: 10px 12px; font: inherit; background: #fff; color: #172026; }
button { min-height: 44px; border: 0; border-radius: 6px; padding: 0 16px; font: inherit; font-weight: 800; color: #fff; background: #0f766e; cursor: pointer; }
button:hover { background: #115e59; }
.result { margin-top: 14px; }
.result a { color: #0f766e; font-weight: 800; }
.auth-row { grid-template-columns: minmax(0, 1fr) auto; margin-bottom: 18px; }
.metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.metric { background: #fff; border: 1px solid #dfe7e9; border-radius: 8px; padding: 16px; }
.metric strong { display: block; font-size: 28px; }
.table { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e7edef; white-space: nowrap; }
th { color: #607077; font-size: 12px; }
.events { display: grid; gap: 8px; font-size: 13px; }
.event { border-bottom: 1px solid #e7edef; padding: 8px 0; }
@media (max-width: 720px) { .metrics { grid-template-columns: 1fr; } .auth-row { grid-template-columns: 1fr; } }
`;
}

function telegramAppScript(): string {
  return `
const tg = window.Telegram?.WebApp;
tg?.ready();
const form = document.querySelector("#profileForm");
const result = document.querySelector("#result");
const language = document.querySelector("#language");
const country = document.querySelector("#country");
const telegramUser = tg?.initDataUnsafe?.user;

async function boot() {
  const config = await fetch("/api/config").then((response) => response.json());
  language.innerHTML = config.languages.map((item) => '<option value="' + item.code + '">' + item.name + '</option>').join("");
  country.innerHTML = config.countries.map((item) => '<option value="' + item.code + '">' + item.name + '</option>').join("");
  language.value = config.defaultLocale.toLowerCase();
  country.value = config.defaultCountry.toUpperCase();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.telegramUserId = telegramUser?.id ? String(telegramUser.id) : "";
  if (!data.displayName && telegramUser) data.displayName = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ");

  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const payload = await response.json();
  result.hidden = false;
  if (!response.ok) {
    result.textContent = "Could not create account. Please check your details.";
    return;
  }
  result.innerHTML = payload.botUrl
    ? '<strong>Account is ready.</strong><p>Your country bot: <a href="' + payload.botUrl + '">' + payload.botUrl + '</a></p>'
    : '<strong>Account is ready.</strong><p>No bot route is active for this country yet.</p>';
});

boot().catch(() => {
  result.hidden = false;
  result.textContent = "Could not load app settings.";
});
`;
}

function adminAppScript(): string {
  return `
const authForm = document.querySelector("#authForm");
const overview = document.querySelector("#overview");
const users = document.querySelector("#users");
const events = document.querySelector("#events");
let token = sessionStorage.getItem("adminToken") || "";
if (token) load();

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  token = new FormData(authForm).get("token");
  sessionStorage.setItem("adminToken", token);
  load();
});

async function api(path) {
  const response = await fetch(path, { headers: { Authorization: "Bearer " + token } });
  if (!response.ok) throw new Error("Unauthorized");
  return response.json();
}

async function load() {
  const [summary, userData, eventData] = await Promise.all([
    api("/api/admin/overview"),
    api("/api/admin/users"),
    api("/api/admin/events")
  ]);
  overview.innerHTML = [
    metric("Users", summary.users),
    metric("Active subscriptions", summary.activeSubscriptions),
    metric("Events 24h", summary.events24h)
  ].join("");
  users.innerHTML = renderUsers(userData.users);
  events.innerHTML = eventData.events.map((event) => '<div class="event"><strong>' + event.event_type + '</strong><br>' + event.actor + ' · ' + event.created_at + '</div>').join("");
}

function metric(label, value) {
  return '<div class="metric"><strong>' + value + '</strong><span>' + label + '</span></div>';
}

function renderUsers(rows) {
  return '<table><thead><tr><th>User</th><th>Country</th><th>Language</th><th>Status</th><th>Subscription</th><th>Created</th></tr></thead><tbody>' +
    rows.map((row) => '<tr><td>' + (row.email || row.telegram_user_id || row.id) + '</td><td>' + row.country + '</td><td>' + row.language + '</td><td>' + row.status + '</td><td>' + (row.subscription_status || "none") + '</td><td>' + row.created_at + '</td></tr>').join("") +
    '</tbody></table>';
}
`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[char];
  });
}
