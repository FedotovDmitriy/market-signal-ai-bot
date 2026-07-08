ALTER TABLE users ADD COLUMN pending_email TEXT;

-- Preserve untrusted contact input without reserving it as a login identity.
UPDATE users
SET pending_email = email,
    email = NULL
WHERE email IS NOT NULL
  AND email_verified_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_pending_email ON users(pending_email);
