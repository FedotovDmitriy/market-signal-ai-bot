ALTER TABLE users ADD COLUMN email_verified_at TEXT;

CREATE INDEX IF NOT EXISTS idx_users_verified_email
  ON users(email)
  WHERE email_verified_at IS NOT NULL;

-- Legacy email-only sessions were issued before email ownership was proven.
UPDATE user_sessions
SET revoked_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE revoked_at IS NULL
  AND user_id IN (
    SELECT id
    FROM users
    WHERE telegram_user_id IS NULL
      AND email_verified_at IS NULL
  );
