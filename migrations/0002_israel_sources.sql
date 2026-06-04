CREATE TABLE IF NOT EXISTS news_sources (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  language TEXT NOT NULL,
  source_type TEXT NOT NULL,
  name TEXT NOT NULL,
  handle_or_url TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_sources_country ON news_sources(country, language, is_active);

INSERT OR IGNORE INTO bot_routes (country, language, bot_url, is_active) VALUES
  ('IL', 'he', 'https://t.me/your_israel_market_signal_bot', 0);

INSERT OR IGNORE INTO news_sources (id, country, language, source_type, name, handle_or_url, notes) VALUES
  ('il-calcalist', 'IL', 'he', 'telegram', 'Calcalist', 'https://t.me/calcalist', 'Candidate Hebrew business source; verify official channel before production use.'),
  ('il-globes', 'IL', 'he', 'telegram', 'Globes', 'https://t.me/globes', 'Candidate Hebrew markets/business source; verify official channel before production use.'),
  ('il-themarker', 'IL', 'he', 'telegram', 'TheMarker', 'https://t.me/TheMarker', 'Candidate Hebrew finance source; verify official channel before production use.'),
  ('il-bizportal', 'IL', 'he', 'telegram', 'Bizportal', 'https://t.me/bizportal', 'Candidate Hebrew capital markets source; verify official channel before production use.');
