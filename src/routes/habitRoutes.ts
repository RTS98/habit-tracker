import Router from "express";
import { validateBody, validateParams } from "../middleware/validation.ts";
import {
  createHabitSchema,
  updateHabitSchema,
  uuidSchema,
} from "../schemas/habit.ts";
import { authenticateToken } from "../middleware/auth.ts";
import {
  createHabit,
  deleteHabit,
  getHabitById,
  getUserHabits,
  updateHabit,
} from "../controllers/habitController.ts";
import validatePermissions from "../middleware/permissions.ts";

const router = Router();

router.use(authenticateToken);

router.get("/", getUserHabits, validatePermissions("habits:read:all"));
router.get(
  "/:id",
  validateParams(uuidSchema),
  validatePermissions("habits:read:own-data"),
  getHabitById,
);
router.post(
  "/",
  validateBody(createHabitSchema),
  validatePermissions("habits:create"),
  createHabit,
);
router.put(
  "/:id",
  validateParams(uuidSchema),
  validateBody(updateHabitSchema),
  validatePermissions("habits:update:own-data"),
  updateHabit,
);
router.delete(
  "/:id",
  validateParams(uuidSchema),
  validatePermissions("habits:delete:own-data"),
  deleteHabit,
);

export default router;
