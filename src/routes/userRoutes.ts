import { Router } from "express";
import {
  insertUserSchema,
  updateUserSchema,
  userIdSchema,
} from "../schemas/user.ts";
import { validateBody, validateParams } from "../middleware/validation.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = Router();

router.use(authenticateToken);

router.get("/", (req, res) => {
  res.json({ message: "Get all users" });
});

router.get("/:id", validateParams(userIdSchema), (req, res) => {
  res.json({ message: `Get user with ID ${req.params.id}` });
});

router.post("/", validateBody(insertUserSchema), (req, res) => {
  res.status(201).json({ message: "Created a new user" });
});

router.put(
  "/:id",
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  (req, res) => {
    res.json({ message: `Updated user with ID ${req.params.id}` });
  },
);

router.delete("/:id", validateParams(userIdSchema), (req, res) => {
  res.json({ message: `Deleted user with ID ${req.params.id}` });
});

export default router;
