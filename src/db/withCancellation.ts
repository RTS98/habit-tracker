import type { Pool } from "pg";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema.ts";
import { getRequestSignal } from "../middleware/requestContext.ts";

export type AppDatabase = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<AppDatabase["transaction"]>[0]>[0];

/**
 * Runs `fn` inside a transaction whose query is cancelled (via
 * pg_cancel_backend) when the current request's abort signal fires.
 *
 * Pool-agnostic: pass the drizzle instance and its underlying pg Pool so the
 * cancel can be issued on a *separate* connection. `setup` runs first inside
 * the same transaction (e.g. to set per-request config).
 */
export async function withCancellation<T>(
  db: AppDatabase,
  pool: Pool,
  fn: (tx: Tx) => Promise<T>,
  setup?: (tx: Tx) => Promise<void>,
): Promise<T> {
  const signal = getRequestSignal();

  if (signal?.aborted) {
    throw new DOMException("Operation aborted", "AbortError");
  }

  return db.transaction(async (tx) => {
    if (setup) await setup(tx);

    if (!signal) {
      return fn(tx);
    }

    // Grab the backend PID so we can cancel this transaction's running query
    // from a separate connection when the request is aborted.
    const [{ pid }] = (
      await tx.execute<{ pid: number }>(sql`SELECT pg_backend_pid() AS pid`)
    ).rows;

    const onAbort = () => {
      // Best-effort cancel on a fresh pool connection; ignore failures since
      // the transaction may already be finishing.
      pool.query("SELECT pg_cancel_backend($1)", [pid]).catch(() => undefined);
    };
    signal.addEventListener("abort", onAbort, { once: true });

    try {
      return await fn(tx);
    } finally {
      signal.removeEventListener("abort", onAbort);
    }
  });
}
