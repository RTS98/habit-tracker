CREATE ROLE service_role LOGIN;
GRANT SELECT, INSERT ON TABLE users TO service_role;
ALTER ROLE service_role BYPASSRLS;