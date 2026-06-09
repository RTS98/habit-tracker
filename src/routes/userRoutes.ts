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

const router = Router();

router.use(authenticateToken);

router.get("/", getAllUsers);

router.get("/:id", validateParams(userIdSchema), getProfile);

router.post("/", validateBody(insertUserSchema), createUser);

router.put(
  "/:id",
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  updateProfile,
);

router.post(
  "/change-password",
  validateBody(changePasswordSchema),
  changePassword,
);

router.delete("/:id", validateParams(userIdSchema), deleteUser);

export default router;
