-- DEV ONLY. Apply explicitly with --env dev; never include this file in migrations.
INSERT INTO users (
  id, telegram_user_id, email, email_verified_at, pending_email, display_name,
  language, country, selected_bot_url, status, last_seen_at
) VALUES (
  'dev_test_scanner_user', NULL, 'scanner-fixture@example.invalid', CURRENT_TIMESTAMP, NULL,
  'Scanner Contract Fixture', 'ru', 'US', 'https://t.me/US_News_Ticker_Scanner_RU_bot',
  'active', CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO UPDATE SET
  telegram_user_id = NULL,
  email = excluded.email,
  email_verified_at = CURRENT_TIMESTAMP,
  pending_email = NULL,
  display_name = excluded.display_name,
  language = excluded.language,
  country = excluded.country,
  selected_bot_url = excluded.selected_bot_url,
  status = 'active',
  last_seen_at = CURRENT_TIMESTAMP;

INSERT INTO user_settings (user_id, language, country, risk_profile, delivery_mode, tickers_json)
VALUES ('dev_test_scanner_user', 'ru', 'US', 'balanced', 'telegram', '[]')
ON CONFLICT(user_id) DO UPDATE SET
  language = excluded.language,
  country = excluded.country,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO user_country_links (user_id, country, bot_url, is_active, updated_at)
VALUES ('dev_test_scanner_user', 'US', 'https://t.me/US_News_Ticker_Scanner_RU_bot', 1, CURRENT_TIMESTAMP)
ON CONFLICT(user_id, country) DO UPDATE SET
  bot_url = excluded.bot_url,
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO subscriptions (
  id, user_id, provider, external_id, plan, status, current_period_end, metadata_json, updated_at
) VALUES (
  'dev_test_scanner_subscription', 'dev_test_scanner_user', 'dev_fixture',
  'dev_fixture_scanner_contract', 'pro', 'active', datetime('now', '+30 days'),
  '{"fixture":true,"environment":"dev"}', CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  provider = excluded.provider,
  external_id = excluded.external_id,
  plan = excluded.plan,
  status = 'active',
  current_period_end = datetime('now', '+30 days'),
  metadata_json = excluded.metadata_json,
  updated_at = CURRENT_TIMESTAMP;

DELETE FROM user_sessions WHERE user_id = 'dev_test_scanner_user';
DELETE FROM api_keys WHERE user_id = 'dev_test_scanner_user';
DELETE FROM quota_balances WHERE subscription_id = 'dev_test_scanner_subscription';
DELETE FROM quota_decisions_v11 WHERE user_id = 'dev_test_scanner_user';
DELETE FROM cache_receipts WHERE user_id = 'dev_test_scanner_user';
DELETE FROM core_cache_entries WHERE user_id = 'dev_test_scanner_user';

INSERT INTO quota_balances (
  subscription_id, user_id, quota_limit, used_units, period_end,
  quota_limit_credits, used_credits, updated_at
)
SELECT
  'dev_test_scanner_subscription', 'dev_test_scanner_user', period_units, 0,
  datetime('now', '+30 days'), period_credits, 0, CURRENT_TIMESTAMP
FROM quota_plan_policies
WHERE plan = 'pro' AND is_active = 1;
