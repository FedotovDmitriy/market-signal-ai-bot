ALTER TABLE quota_decisions_v11 ADD COLUMN cache_receipt_id TEXT;

CREATE TABLE IF NOT EXISTS cache_receipts (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  ticker TEXT NOT NULL,
  user_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  report_type TEXT NOT NULL,
  generation_version TEXT NOT NULL,
  language TEXT NOT NULL,
  cache_ttl_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result_digest TEXT,
  commit_expires_at TEXT NOT NULL,
  committed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(request_id, ticker),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS core_cache_entries (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  ticker TEXT NOT NULL,
  report_type TEXT NOT NULL,
  generation_version TEXT NOT NULL,
  language TEXT NOT NULL,
  result_digest TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (receipt_id) REFERENCES cache_receipts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cache_receipts_status_expiry ON cache_receipts(status, commit_expires_at);
CREATE INDEX IF NOT EXISTS idx_core_cache_lookup
  ON core_cache_entries(user_id, ticker, report_type, generation_version, language, expires_at);
