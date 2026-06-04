ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data"
ON users
FOR SELECT
USING (
  id = current_setting('app.current_user_id')::uuid
);

CREATE POLICY "Users can only create their own data"
ON users
FOR INSERT
WITH CHECK (
  id = current_setting('app.current_user_id')::uuid
);

CREATE POLICY "Users can only modify their own data"
ON users
FOR UPDATE
USING (
  id = current_setting('app.current_user_id')::uuid
) WITH CHECK (
  id = current_setting('app.current_user_id')::uuid
);

CREATE POLICY "Users can only delete their own data"
ON users
FOR DELETE
USING (
  id = current_setting('app.current_user_id')::uuid
);

