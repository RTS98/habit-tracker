import { beforeEach, describe, expect, it, vi } from "vitest";
import { withUserContext } from "../db/userContext.ts";

const { executeMock, transactionMock } = vi.hoisted(() => ({
  executeMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("../db/connection.ts", () => ({
  default: {
    transaction: transactionMock,
  },
}));

describe("withUserContext", () => {
  beforeEach(() => {
    executeMock.mockReset();
    transactionMock.mockReset();
  });

  it("sets app.current_user_id and runs the callback inside a transaction", async () => {
    const tx = {
      execute: executeMock,
    };

    transactionMock.mockImplementation(async (callback: any) => {
      return callback(tx);
    });

    const fn = vi.fn().mockResolvedValue("ok");

    const result = await withUserContext("user-123", fn as any);

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(tx);
    expect(result).toBe("ok");
  });
});
