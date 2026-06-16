-- =============================================
-- USERS: replace recursive subquery policies
-- =============================================

DROP POLICY IF EXISTS "Users can only access their own data" ON users;
CREATE POLICY "Users can only access their own data"
ON users FOR SELECT
USING (
  id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
);

DROP POLICY IF EXISTS "Users can only create their own data" ON users;
CREATE POLICY "Users can only create their own data"
ON users FOR INSERT
WITH CHECK (
  id = current_setting('app.current_user_id', true)::uuid
);

DROP POLICY IF EXISTS "Users can only modify their own data" ON users;
CREATE POLICY "Users can only modify their own data"
ON users FOR UPDATE
USING (
  id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
)
WITH CHECK (
  id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
);

DROP POLICY IF EXISTS "Users can only delete their own data" ON users;
CREATE POLICY "Users can only delete their own data"
ON users FOR DELETE
USING (
  id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
);

-- =============================================
-- HABITS: replace subquery with session var
-- =============================================

DROP POLICY IF EXISTS "Users can only access their own habits" ON habits;
CREATE POLICY "Users can only access their own habits"
ON habits FOR SELECT
USING (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
);

DROP POLICY IF EXISTS "Users can only create habits for themselves" ON habits;
CREATE POLICY "Users can only create habits for themselves"
ON habits FOR INSERT
WITH CHECK (
  user_id = current_setting('app.current_user_id', true)::uuid
);

DROP POLICY IF EXISTS "Users can only modify their own habits" ON habits;
CREATE POLICY "Users can only modify their own habits"
ON habits FOR UPDATE
USING (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
)
WITH CHECK (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
);

DROP POLICY IF EXISTS "Users can only delete their own habits" ON habits;
CREATE POLICY "Users can only delete their own habits"
ON habits FOR DELETE
USING (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR current_setting('app.current_user_role', true) = 'admin'
);

-- =============================================
-- TAGS: replace subquery with session var
-- =============================================

DROP POLICY IF EXISTS "Only admins can create tags" ON tags;
CREATE POLICY "Only admins can create tags"
ON tags FOR INSERT
WITH CHECK (
  current_setting('app.current_user_role', true) = 'admin'
);

DROP POLICY IF EXISTS "Only admins can update tags" ON tags;
CREATE POLICY "Only admins can update tags"
ON tags FOR UPDATE
USING (
  current_setting('app.current_user_role', true) = 'admin'
);

DROP POLICY IF EXISTS "Only admins can delete tags" ON tags;
CREATE POLICY "Only admins can delete tags"
ON tags FOR DELETE
USING (
  current_setting('app.current_user_role', true) = 'admin'
);