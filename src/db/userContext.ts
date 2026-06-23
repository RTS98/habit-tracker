import { sql } from "drizzle-orm";
import db, { client } from "./connection.ts";
import { withCancellation, type Tx } from "./withCancellation.ts";

export async function withUserContext<T>(
  userId: string,
  role: string,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return withCancellation(db, client, fn, async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_user_id', ${userId}, true),
          set_config('app.current_user_role', ${role}, true)`,
    );
  });
}
