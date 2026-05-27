import { sql } from "drizzle-orm";
import db from "./connection.ts";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function withUserContext<T>(
  userId: string,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
    );
    return fn(tx);
  });
}
