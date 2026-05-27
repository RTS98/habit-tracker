ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own habits"
ON habits 
FOR SELECT
USING (
    user_id = current_setting('app.current_user_id')::UUID
);

CREATE POLICY "Users can only create habits for themselves"
ON habits
FOR INSERT
WITH CHECK (
    user_id = current_setting('app.current_user_id')::UUID
);

CREATE POLICY "Users can only modify their own habits"
ON habits
FOR UPDATE
USING (
    user_id = current_setting('app.current_user_id')::UUID
) WITH CHECK (
    user_id = current_setting('app.current_user_id')::UUID
);

CREATE POLICY "Users can only delete their own habits"
ON habits
FOR DELETE
USING (
    user_id = current_setting('app.current_user_id')::UUID
);