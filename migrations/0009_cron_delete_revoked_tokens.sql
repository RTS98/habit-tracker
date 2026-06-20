CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete-revoked-refresh-tokens',
  '0 3 * * *',
  $$
    DELETE FROM refresh_tokens
    WHERE revoked_at IS NOT NULL
      AND expires_at < NOW() - INTERVAL '30 days';
  $$
);
