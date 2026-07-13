CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_provider_external_id
ON subscriptions(provider, external_id)
WHERE external_id IS NOT NULL;
