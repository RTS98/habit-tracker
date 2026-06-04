import { defineConfig } from "drizzle-kit";
import env from "./env.ts";

export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.MIGRATION_DATABASE_URL ?? env.DATABASE_URL,
  },
  migrations: {
    table: "migrations_table",
    schema: "public",
  },
});
