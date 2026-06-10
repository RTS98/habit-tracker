import type { NextFunction } from "express";
import validatePermissions from "../../middleware/permissions.ts";
import type { Permission } from "../../permissions/rbac.ts";

describe("validatePermissions middleware", () => {
  let req: any;
  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe("user role", () => {
    beforeEach(() => {
      req = { user: { id: "user-1", role: "user" } };
    });

    it("should call next() when user has the required permission", () => {
      const middleware = validatePermissions("habits:create");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 when user lacks the required permission", () => {
      const middleware = validatePermissions("users:read:all");
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden: Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it.each<Permission>([
      "users:create",
      "users:read:own-data",
      "users:update:own-data",
      "users:delete:own-data",
      "habits:create",
      "habits:read:own-data",
      "habits:update:own-data",
      "habits:delete:own-data",
    ])("should allow permission: %s", (permission) => {
      const middleware = validatePermissions(permission);
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it.each<Permission>([
      "users:read:all",
      "users:update",
      "users:delete",
      "habits:read:all",
      "habits:update",
      "habits:delete",
      "tags:create",
      "tags:read",
      "tags:update",
      "tags:delete",
    ])("should deny permission: %s", (permission) => {
      const middleware = validatePermissions(permission);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("admin role", () => {
    beforeEach(() => {
      req = { user: { id: "admin-1", role: "admin" } };
    });

    it("should call next() when admin has the required permission", () => {
      const middleware = validatePermissions("users:read:all");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it.each<Permission>([
      "tags:create",
      "tags:read",
      "tags:update",
      "tags:delete",
      "users:read:all",
      "habits:read:all",
      "users:delete",
      "habits:delete",
    ])("should allow admin-only permission: %s", (permission) => {
      const middleware = validatePermissions(permission);
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});