import Router from "express";
import { validateBody } from "../middleware/validation.ts";
import { insertUserSchema, loginSchema } from "../schemas/user.ts";
import {
  login,
  refreshToken,
  register,
} from "../controllers/authController.ts";
import cookieParser from "cookie-parser";
import { authenticateRefreshToken } from "../middleware/auth.ts";

const router = Router();

router.post("/register", validateBody(insertUserSchema), register);

router.post("/login", validateBody(loginSchema), login);

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "User logged out" });
});

router.post("/refresh", cookieParser(), authenticateRefreshToken, refreshToken);

export default router;
