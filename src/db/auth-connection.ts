import { Pool } from "pg";
import env, { isProduction } from "../../env.ts";
import { remember } from "@epic-web/remember";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

const createPool = () => {
  return new Pool({
    connectionString: env.AUTH_DATABASE_URL,
  });
};

let client: Pool;

if (isProduction) {
  client = createPool();
} else {
  client = remember("authDbClient", createPool);
}

const authDb = drizzle(client, { schema });

export default authDb;
export { client as authClient };
