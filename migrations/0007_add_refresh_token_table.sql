CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash varchar(64) UNIQUE NOT NULL,
  family_id uuid NOT NULL,
  issued_at timestamp NOT NULL,
  expires_at timestamp NOT NULL,
  rotated_at timestamp, 
  revoked_at timestamp,
  reused_at timestamp
);

CREATE INDEX IF NOT EXISTS refresh_tokens_family_id_idx
  ON refresh_tokens(family_id);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own refresh tokens" ON refresh_tokens;
CREATE POLICY "Users can read own refresh tokens"
ON refresh_tokens
FOR SELECT
USING (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
);

DROP POLICY IF EXISTS "Users can write own refresh tokens" ON refresh_tokens;
CREATE POLICY "Users can write own refresh tokens"
ON refresh_tokens
FOR ALL
USING (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
)
WITH CHECK (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
);