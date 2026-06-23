import { beforeEach, describe, expect, it, vi } from "vitest";
import { withCancellation } from "../db/withCancellation.ts";
import { runWithRequestContext } from "../middleware/requestContext.ts";

const executeMock = vi.fn();
const transactionMock = vi.fn();
const poolQueryMock = vi.fn();

// Minimal stand-ins for the drizzle db + pg Pool. withCancellation receives
// these directly, so no module mocking of the real connections is needed.
const tx = { execute: executeMock };
const db = { transaction: transactionMock } as any;
const pool = { query: poolQueryMock } as any;

describe("withCancellation", () => {
  beforeEach(() => {
    executeMock.mockReset();
    transactionMock.mockReset();
    poolQueryMock.mockReset();

    transactionMock.mockImplementation(async (callback: any) => callback(tx));
    // Default: pg_backend_pid() lookup returns a fake backend PID.
    executeMock.mockResolvedValue({ rows: [{ pid: 4242 }] });
    poolQueryMock.mockResolvedValue(undefined);
  });

  it("runs setup then the callback inside a transaction (no request context)", async () => {
    const setup = vi.fn().mockResolvedValue(undefined);
    const fn = vi.fn().mockResolvedValue("ok");

    const result = await withCancellation(db, pool, fn, setup);

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledWith(tx);
    expect(fn).toHaveBeenCalledWith(tx);
    expect(result).toBe("ok");
    // Without a signal it never looks up the PID or touches the pool.
    expect(executeMock).not.toHaveBeenCalled();
    expect(poolQueryMock).not.toHaveBeenCalled();
  });

  it("throws AbortError without opening a transaction when already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const fn = vi.fn();

    await runWithRequestContext({ abortSignal: controller.signal }, async () => {
      await expect(withCancellation(db, pool, fn)).rejects.toMatchObject({
        name: "AbortError",
      });
    });

    expect(transactionMock).not.toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });

  it("captures the backend PID and cancels it on the pool when aborted mid-flight", async () => {
    const controller = new AbortController();

    // A callback we can keep pending until after we trigger the abort.
    let resolveFn: (value: string) => void;
    const fn = vi.fn(
      () => new Promise<string>((resolve) => (resolveFn = resolve)),
    );

    await runWithRequestContext({ abortSignal: controller.signal }, async () => {
      const pending = withCancellation(db, pool, fn);

      // Let the transaction body run up to the awaited fn().
      await Promise.resolve();
      await Promise.resolve();

      controller.abort();

      // The abort listener should cancel this transaction's backend.
      expect(poolQueryMock).toHaveBeenCalledWith(
        "SELECT pg_cancel_backend($1)",
        [4242],
      );

      resolveFn("done");
      await expect(pending).resolves.toBe("done");
    });
  });

  it("removes the abort listener after completion (no cancel on late abort)", async () => {
    const controller = new AbortController();
    const fn = vi.fn().mockResolvedValue("ok");

    await runWithRequestContext({ abortSignal: controller.signal }, async () => {
      await withCancellation(db, pool, fn);
    });

    // Aborting after the work finished must not fire a cancel query.
    controller.abort();
    expect(poolQueryMock).not.toHaveBeenCalled();
  });
});
