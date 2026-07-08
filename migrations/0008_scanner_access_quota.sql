CREATE TABLE IF NOT EXISTS quota_plan_policies (
  plan TEXT PRIMARY KEY,
  period_units INTEGER NOT NULL CHECK (period_units >= 0),
  regular_units INTEGER NOT NULL CHECK (regular_units > 0),
  fundrep_units INTEGER NOT NULL CHECK (fundrep_units > 0),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quota_balances (
  subscription_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quota_limit INTEGER NOT NULL CHECK (quota_limit >= 0),
  used_units INTEGER NOT NULL DEFAULT 0 CHECK (used_units >= 0),
  period_end TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quota_decisions (
  request_id TEXT PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  contract_version TEXT NOT NULL,
  user_id TEXT NOT NULL,
  subscription_id TEXT,
  chat_id TEXT,
  ticker TEXT NOT NULL,
  report_type TEXT NOT NULL,
  force_refresh INTEGER NOT NULL,
  language TEXT NOT NULL,
  allowed INTEGER NOT NULL DEFAULT 0,
  charge_units INTEGER NOT NULL DEFAULT 0,
  quota_decision TEXT NOT NULL DEFAULT 'pending',
  cache_status TEXT NOT NULL DEFAULT 'not_applicable',
  report_source TEXT NOT NULL DEFAULT 'none',
  remaining_units INTEGER,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_quota_balances_user_id ON quota_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_decisions_user_id ON quota_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_quota_decisions_subscription_id ON quota_decisions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_quota_decisions_created_at ON quota_decisions(created_at);

INSERT OR IGNORE INTO quota_plan_policies (plan, period_units, regular_units, fundrep_units) VALUES
  ('trial', 25, 1, 5),
  ('starter', 100, 1, 5),
  ('pro', 1000, 1, 5);
