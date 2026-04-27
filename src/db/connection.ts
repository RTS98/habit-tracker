import { Pool } from "pg";
import env, { isProduction } from "../../env.ts";
import { remember } from "@epic-web/remember";
import { drizzle } from "drizzle-orm/node-postgres";

const createPool = () => {
  return new Pool({
    connectionString: env.DATABASE_URL,
  });
};

let client: Pool;

if (isProduction) {
  client = createPool();
} else {
  client = remember("dbClient", createPool);
}

const db = drizzle(client);

export default db;
