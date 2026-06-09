INSERT INTO bot_routes (country, language, bot_url, is_active, updated_at)
VALUES
  ('IL', 'he', 'https://t.me/Israel_News_Ticker_Scanner_bot', 1, CURRENT_TIMESTAMP),
  ('US', 'ru', 'https://t.me/US_News_Ticker_Scanner_RU_bot', 1, CURRENT_TIMESTAMP)
ON CONFLICT(country) DO UPDATE SET
  language = excluded.language,
  bot_url = excluded.bot_url,
  is_active = excluded.is_active,
  updated_at = CURRENT_TIMESTAMP;
