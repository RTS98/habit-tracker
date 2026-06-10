import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.ts";
import { hasPermission, type Permission } from "../permissions/rbac.ts";

const validatePermissions = (requiredPermission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user!.role;

    if (!hasPermission(userRole, requiredPermission)) {
      return res.status(403).json({ error: "Forbidden: Unauthorized" });
    }

    next();
  };
};

export default validatePermissions;
