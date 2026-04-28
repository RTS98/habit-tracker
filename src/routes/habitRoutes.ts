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

const router = Router();

router.use(authenticateToken);

router.get("/", getUserHabits);
router.get("/:id", validateParams(uuidSchema), getHabitById);
router.post("/", validateBody(createHabitSchema), createHabit);
router.put(
  "/:id",
  validateParams(uuidSchema),
  validateBody(updateHabitSchema),
  updateHabit,
);
router.delete("/:id", validateParams(uuidSchema), deleteHabit);

export default router;
