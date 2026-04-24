import dotenv from "dotenv";
import z from "zod";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

if (isProduction) {
  dotenv.config({ path: "./.env" });
} else if (isDevelopment) {
  dotenv.config({ path: "./.env.development" });
}

const envSchema = z.object({
  PORT: z.coerce.number().positive().default(3000),
  CORS_ORIGIN: z.url().default("http://localhost:3000"),
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
