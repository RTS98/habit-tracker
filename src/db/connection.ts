import { Pool } from "pg";
import env, { isProduction } from "../../env.ts";
import { remember } from "@epic-web/remember";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

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

const db = drizzle(client, { schema });

export default db;
export { client };
