import Router from "express";
import { validateBody } from "../middleware/validation.ts";
import { insertUserSchema, loginSchema } from "../schemas/user.ts";
import { login, register } from "../controllers/authController.ts";

const router = Router();

router.post("/register", validateBody(insertUserSchema), register);

router.post("/login", validateBody(loginSchema), login);

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "User logged out" });
});

router.post("/refresh", (req, res) => {
  res.json({ message: "Token refreshed" });
});

export default router;
