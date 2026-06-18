import type { Request, Response } from "express";
import { refreshTokens, users } from "../db/schema.ts";
import { comparePassword, hashPassword } from "../utils/password.ts";
import { generateRefreshToken, generateToken } from "../utils/jwt.ts";
import { eq } from "drizzle-orm";
import authDb from "../db/auth-connection.ts";
import type { RefreshTokenRequest } from "../middleware/auth.ts";
import { withUserContext } from "../db/userContext.ts";
import { hashToken } from "../utils/token.ts";
import { AuthenticationError } from "../errors/errors.ts";

type RefreshTokenResult = {
  newAccessToken?: string;
  newRefreshToken?: string;
  isReused?: boolean;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Create user in database
    const [newUser] = await authDb
      .insert(users)
      .values({
        email,
        username,
        passwordHash: await hashPassword(password), // Store hash, not plain text!
        firstName,
        lastName,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      });

    // Generate JWT for auto-login
    const token = await generateToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: "user", // Default role for new users
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
      token, // User is logged in immediately
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Step 1: Find user by email
    const [user] = await authDb
      .select()
      .from(users)
      .where(eq(email, users.email));

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Step 2: Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Step 3: Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken({
      id: user.id,
      role: user.role,
    });

    await withUserContext(user.id, user.role, async (tx) =>
      tx.insert(refreshTokens).values({
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        familyId: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      }),
    );

    // Step 4: Return user data and token
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

export const refreshToken = async (req: RefreshTokenRequest, res: Response) => {
  try {
    const id = req.id!;
    const role = req.role!;
    const { refreshToken } = req.cookies;
    const result: RefreshTokenResult = await withUserContext(
      id,
      role,
      async (tx) => {
        const refreshTokenHash = hashToken(refreshToken);
        const [existingToken] = await tx
          .select({
            familyId: refreshTokens.familyId,
            rotatedAt: refreshTokens.rotatedAt,
            revokedAt: refreshTokens.revokedAt,
          })
          .from(refreshTokens)
          .where(eq(refreshTokens.tokenHash, refreshTokenHash));

        if (!existingToken) {
          throw new AuthenticationError("Invalid or expired refresh token");
        }

        if (
          existingToken.rotatedAt != null ||
          existingToken.revokedAt != null
        ) {
          await tx
            .update(refreshTokens)
            .set({ reusedAt: new Date() })
            .where(eq(refreshTokens.tokenHash, refreshTokenHash));

          await tx
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.familyId, existingToken.familyId));

          return { isReused: true };
        }

        const [user] = await tx
          .select({
            id: users.id,
            role: users.role,
            email: users.email,
            username: users.username,
          })
          .from(users)
          .where(eq(users.id, id));

        if (!user) {
          throw new AuthenticationError("User not found");
        }

        const newAccessToken = await generateToken(user);
        const newRefreshToken = await generateRefreshToken(user);
        const [token] = await tx
          .update(refreshTokens)
          .set({ rotatedAt: new Date() })
          .where(eq(refreshTokens.tokenHash, refreshTokenHash))
          .returning({ familyId: refreshTokens.familyId });

        await tx.insert(refreshTokens).values({
          userId: user.id,
          tokenHash: hashToken(newRefreshToken),
          familyId: token.familyId,
          expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        });

        return { newAccessToken, newRefreshToken };
      },
    );

    if (result.isReused) {
      throw new AuthenticationError(
        "Token reuse detected. Please login again.",
      );
    }

    res
      .cookie("refreshToken", result.newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken: result.newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (error instanceof AuthenticationError) {
      return res.status(401).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to refresh token" });
  }
};
