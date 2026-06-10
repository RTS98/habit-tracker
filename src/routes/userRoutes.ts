import { Router } from "express";
import {
  changePasswordSchema,
  insertUserSchema,
  updateUserSchema,
  userIdSchema,
} from "../schemas/user.ts";
import { validateBody, validateParams } from "../middleware/validation.ts";
import { authenticateToken } from "../middleware/auth.ts";
import {
  changePassword,
  createUser,
  deleteUser,
  getAllUsers,
  getProfile,
  updateProfile,
} from "../controllers/userController.ts";
import validatePermissions from "../middleware/permissions.ts";

const router = Router();

router.use(authenticateToken);

router.get("/", validatePermissions("users:read:all"), getAllUsers);

router.get(
  "/:id",
  validateParams(userIdSchema),
  validatePermissions("users:read:own-data"),
  getProfile,
);

router.post(
  "/",
  validateBody(insertUserSchema),
  validatePermissions("users:create"),
  createUser,
);

router.put(
  "/:id",
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  validatePermissions("users:update:own-data"),
  updateProfile,
);

router.post(
  "/change-password",
  validateBody(changePasswordSchema),
  validatePermissions("users:update:own-data"),
  changePassword,
);

router.delete(
  "/:id",
  validateParams(userIdSchema),
  validatePermissions("users:delete:own-data"),
  deleteUser,
);

export default router;
