ALTER TABLE api_keys ADD COLUMN hash_version TEXT NOT NULL DEFAULT 'sha256_legacy';

CREATE TABLE IF NOT EXISTS internal_request_nonces (
  key_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  request_timestamp INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (key_id, request_id)
);

CREATE INDEX IF NOT EXISTS idx_internal_request_nonces_expires_at
  ON internal_request_nonces(expires_at);
