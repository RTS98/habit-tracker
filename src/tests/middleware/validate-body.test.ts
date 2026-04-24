import type { NextFunction } from "express";
import { validateBody } from "../../middleware/validation.ts";
import { createUserSchema } from "../../schemas/user.ts";

const middleware = validateBody(createUserSchema);

describe("validateBody middleware", () => {
  let req: any;
  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it("should validate request body against the schema", () => {
    req.body = {
      email: "test@email.com",
      password: "password123",
      name: "Test User",
    };

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 400 if validation fails", () => {
    req.body = { name: "", email: "invalid-email", password: "short" };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Validation failed",
      details: [
        { field: "email", message: "Invalid email format" },
        {
          field: "password",
          message: "Password must be at least 8  characters long",
        },
        { field: "name", message: "Name is required" },
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });
});
