import { defineConfig } from "drizzle-kit";

const url = process.env.MIGRATION_DATABASE_URL;

if (!url) {
  throw new Error("MIGRATION_DATABASE_URL is not set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
  migrations: {
    table: "migrations_table",
    schema: "public",
  },
  verbose: true,
});
