import type { Request, Response, NextFunction } from "express";
import {
  verifyRefreshToken,
  verifyToken,
  type JwtPayload,
} from "../utils/jwt.ts";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface RefreshTokenRequest extends Request {
  id?: string;
  role?: "user" | "admin";
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const authenticateRefreshToken = async (
  req: RefreshTokenRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const payload = await verifyRefreshToken(refreshToken);
    req.id = payload.id;
    req.role = payload.role;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};
