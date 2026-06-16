-- ISSUE: Update RLS policies to respect RBAC will cause infinite recursion due to subqueries referencing the same policies. 

-- HABITS: update policies to respect RBAC
-- =============================================

DROP POLICY IF EXISTS "Users can only access their own habits" ON habits;
CREATE POLICY "Users can only access their own habits"
ON habits FOR SELECT
USING (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
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
  OR (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
)
WITH CHECK (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
);

DROP POLICY IF EXISTS "Users can only delete their own habits" ON habits;
CREATE POLICY "Users can only delete their own habits"
ON habits FOR DELETE
USING (
  user_id = current_setting('app.current_user_id', true)::uuid
  OR (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
);

-- =============================================
-- USERS: update policies to respect RBAC
-- =============================================

DROP POLICY IF EXISTS "Users can only access their own data" ON users;
CREATE POLICY "Users can only access their own data"
ON users FOR SELECT
USING (
  id = current_setting('app.current_user_id', true)::uuid
  OR (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
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
  OR (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
)
WITH CHECK (
  id = current_setting('app.current_user_id', true)::uuid
  OR (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
);

DROP POLICY IF EXISTS "Users can only delete their own data" ON users;
CREATE POLICY "Users can only delete their own data"
ON users FOR DELETE
USING (
  id = current_setting('app.current_user_id', true)::uuid
  OR (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
);