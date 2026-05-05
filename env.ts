import dotenv from "dotenv";
import z from "zod";

export const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

if (isProduction) {
  dotenv.config({ path: "./.env" });
} else {
  dotenv.config({ path: "./.env.development" });
}

const envSchema = z.object({
  PORT: z.coerce.number().positive().default(3000),
  CORS_ORIGIN: z.url().default("http://localhost:3000"),
  DATABASE_URL: z
    .url()
    .default("postgresql://user:password@localhost:5432/habit_tracker"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long")
    .default("your_jwt_secret_key"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error("Environment variable validation failed:", error);

  if (error instanceof z.ZodError) {
    error.issues.forEach((err) => {
      console.error(`- ${err.path.join(".")}: ${err.message}`);
    });
    process.exit(1);
  }

  throw error;
}

export default env;
