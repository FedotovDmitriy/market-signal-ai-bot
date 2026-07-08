ALTER TABLE bot_routes ADD COLUMN route_id TEXT;
ALTER TABLE bot_routes ADD COLUMN telegram_chat_id TEXT;

UPDATE bot_routes SET route_id = country WHERE route_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bot_routes_route_id ON bot_routes(route_id);

CREATE TABLE IF NOT EXISTS internal_deliveries (
  delivery_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  user_id TEXT,
  country TEXT NOT NULL,
  language TEXT NOT NULL,
  content_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  telegram_message_id TEXT,
  failure_reason TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_internal_deliveries_created_at
  ON internal_deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_internal_deliveries_status
  ON internal_deliveries(status, updated_at);

CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL DEFAULT 'signup_or_login',
  payload_json TEXT NOT NULL DEFAULT '{}',
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email
  ON email_verifications(email, consumed_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expiry
  ON email_verifications(expires_at);

INSERT INTO quota_plan_policies (
  plan, period_units, regular_units, fundrep_units, is_active,
  period_credits, regular_new_credits, regular_cached_credits,
  fundrep_new_credits, fundrep_cached_credits, cache_ttl_minutes,
  updated_at
) VALUES (
  'beta', 25, 1, 3, 1,
  50, 2, 1,
  6, 3, 60,
  CURRENT_TIMESTAMP
)
ON CONFLICT(plan) DO UPDATE SET
  period_units = excluded.period_units,
  regular_units = excluded.regular_units,
  fundrep_units = excluded.fundrep_units,
  is_active = 1,
  period_credits = excluded.period_credits,
  regular_new_credits = excluded.regular_new_credits,
  regular_cached_credits = excluded.regular_cached_credits,
  fundrep_new_credits = excluded.fundrep_new_credits,
  fundrep_cached_credits = excluded.fundrep_cached_credits,
  cache_ttl_minutes = excluded.cache_ttl_minutes,
  updated_at = CURRENT_TIMESTAMP;
