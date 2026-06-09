CREATE TABLE IF NOT EXISTS user_country_links (
  user_id TEXT NOT NULL,
  country TEXT NOT NULL,
  bot_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, country),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_country_links_country ON user_country_links(country, is_active);

INSERT OR IGNORE INTO user_country_links (user_id, country, bot_url)
SELECT id, country, selected_bot_url
FROM users
WHERE country IS NOT NULL;
