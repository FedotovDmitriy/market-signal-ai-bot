CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  bucket TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at ON rate_limits(expires_at);
