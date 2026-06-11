ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read tags
CREATE POLICY "Tags are publicly readable"
ON tags FOR SELECT
USING (true);

-- Only admins can create tags
CREATE POLICY "Only admins can create tags"
ON tags FOR INSERT
WITH CHECK (
  (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
);

-- Only admins can update tags
CREATE POLICY "Only admins can update tags"
ON tags FOR UPDATE
USING (
  (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
);

-- Only admins can delete tags
CREATE POLICY "Only admins can delete tags"
ON tags FOR DELETE
USING (
  (SELECT role FROM users WHERE id = current_setting('app.current_user_id', true)::uuid) = 'admin'
);