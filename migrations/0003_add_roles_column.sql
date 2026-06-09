-- Add an enum type first for safety
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add the column with a safe default
ALTER TABLE users
  ADD COLUMN role user_role NOT NULL DEFAULT 'user';