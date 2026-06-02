CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  telegram_user_id TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  country TEXT NOT NULL DEFAULT 'US',
  selected_bot_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'en',
  country TEXT NOT NULL DEFAULT 'US',
  risk_profile TEXT NOT NULL DEFAULT 'balanced',
  delivery_mode TEXT NOT NULL DEFAULT 'telegram',
  tickers_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bot_routes (
  country TEXT PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'en',
  bot_url TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  actor TEXT NOT NULL,
  event_type TEXT NOT NULL,
  ip_hash TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at);

INSERT OR IGNORE INTO bot_routes (country, language, bot_url) VALUES
  ('US', 'en', 'https://t.me/your_us_market_signal_bot'),
  ('GB', 'en', 'https://t.me/your_gb_market_signal_bot'),
  ('GE', 'ka', 'https://t.me/your_ge_market_signal_bot'),
  ('DE', 'de', 'https://t.me/your_de_market_signal_bot');
