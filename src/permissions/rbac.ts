import { userRoleEnum } from "../db/schema.ts";

export type Permission =
  | "users:create"
  | "users:read:all"
  | "users:read:own-data"
  | "users:update"
  | "users:update:own-data"
  | "users:delete"
  | "users:delete:own-data"
  | "habits:create"
  | "habits:read:all"
  | "habits:read:own-data"
  | "habits:update"
  | "habits:update:own-data"
  | "habits:delete"
  | "habits:delete:own-data"
  | "tags:create"
  | "tags:read"
  | "tags:update"
  | "tags:delete";

type Role = (typeof userRoleEnum.enumValues)[number];

export const rolePermissions: Record<Role, Permission[]> = {
  user: [
    "users:create",
    "users:read:own-data",
    "users:update:own-data",
    "users:delete:own-data",
    "habits:create",
    "habits:read:own-data",
    "habits:update:own-data",
    "habits:delete:own-data",
  ],
  admin: [
    "users:create",
    "users:read:all",
    "users:read:own-data",
    "users:update",
    "users:update:own-data",
    "users:delete",
    "users:delete:own-data",
    "habits:create",
    "habits:read:all",
    "habits:read:own-data",
    "habits:update",
    "habits:update:own-data",
    "habits:delete",
    "habits:delete:own-data",
    "tags:create",
    "tags:read",
    "tags:update",
    "tags:delete",
  ],
};

export const hasPermission = (role: Role, permission: Permission): boolean =>
  rolePermissions[role].includes(permission);
