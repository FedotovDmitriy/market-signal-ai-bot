ALTER TABLE quota_plan_policies ADD COLUMN period_credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE quota_plan_policies ADD COLUMN regular_new_credits INTEGER NOT NULL DEFAULT 2;
ALTER TABLE quota_plan_policies ADD COLUMN regular_cached_credits INTEGER NOT NULL DEFAULT 1;
ALTER TABLE quota_plan_policies ADD COLUMN fundrep_new_credits INTEGER NOT NULL DEFAULT 6;
ALTER TABLE quota_plan_policies ADD COLUMN fundrep_cached_credits INTEGER NOT NULL DEFAULT 3;
ALTER TABLE quota_plan_policies ADD COLUMN cache_ttl_minutes INTEGER NOT NULL DEFAULT 60;

UPDATE quota_plan_policies
SET period_credits = period_units * 2,
    regular_new_credits = 2,
    regular_cached_credits = 1,
    fundrep_new_credits = 6,
    fundrep_cached_credits = 3,
    cache_ttl_minutes = 60;

ALTER TABLE quota_balances ADD COLUMN quota_limit_credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE quota_balances ADD COLUMN used_credits INTEGER NOT NULL DEFAULT 0;

UPDATE quota_balances
SET quota_limit_credits = quota_limit * 2,
    used_credits = used_units * 2;

CREATE TABLE IF NOT EXISTS quota_decisions_v11 (
  request_id TEXT NOT NULL,
  ticker TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  contract_version TEXT NOT NULL DEFAULT '1.1',
  user_id TEXT NOT NULL,
  subscription_id TEXT,
  chat_id TEXT,
  report_type TEXT NOT NULL,
  generation_version TEXT NOT NULL,
  signed_cache_status TEXT NOT NULL,
  cache_created_at TEXT,
  cache_generation_version TEXT,
  force_refresh INTEGER NOT NULL,
  language TEXT NOT NULL,
  allowed INTEGER NOT NULL DEFAULT 0,
  charge_credits INTEGER NOT NULL DEFAULT 0,
  quota_decision TEXT NOT NULL DEFAULT 'pending',
  effective_cache_status TEXT NOT NULL DEFAULT 'miss',
  report_source TEXT NOT NULL DEFAULT 'none',
  remaining_credits INTEGER,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (request_id, ticker),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_quota_decisions_v11_user_id ON quota_decisions_v11(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_decisions_v11_subscription_id ON quota_decisions_v11(subscription_id);
CREATE INDEX IF NOT EXISTS idx_quota_decisions_v11_created_at ON quota_decisions_v11(created_at);
