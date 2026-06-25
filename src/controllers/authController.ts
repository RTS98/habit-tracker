import type { Request, Response } from "express";
import { refreshTokens, users } from "../db/schema.ts";
import { comparePassword, hashPassword } from "../utils/password.ts";
import { generateRefreshToken, generateToken } from "../utils/jwt.ts";
import { eq } from "drizzle-orm";
import authDb, { authClient } from "../db/auth-connection.ts";
import type { RefreshTokenRequest } from "../middleware/auth.ts";
import { withUserContext } from "../db/userContext.ts";
import { withCancellation } from "../db/withCancellation.ts";
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
    const passwordHash = await hashPassword(password); // Store hash, not plain text!
    const [newUser] = await withCancellation(authDb, authClient, (tx) =>
      tx
        .insert(users)
        .values({
          email,
          username,
          passwordHash,
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
          role: users.role,
        }),
    );

    // Generate JWT for auto-login
    const token = await generateToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: "user", // Default role for new users
    });

    const refreshToken = await generateRefreshToken({
      id: newUser.id,
      role: newUser.role,
    });

    await withUserContext(newUser.id, newUser.role, async (tx) =>
      tx.insert(refreshTokens).values({
        userId: newUser.id,
        tokenHash: hashToken(refreshToken),
        familyId: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      }),
    );

    res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "User created successfully",
        user: newUser,
        token, // User is logged in immediately
      });
  } catch (error) {
    req.log.error({ err: error }, "Failed to register user");
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Step 1: Find user by email
    const [user] = await withCancellation(authDb, authClient, (tx) =>
      tx.select().from(users).where(eq(email, users.email)),
    );

    if (!user) {
      req.log.warn({ email }, "Invalid login attempt");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Step 2: Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      req.log.warn({ email }, "Invalid login attempt");
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
    req.log.error({ err: error }, "Failed to login user");
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
          req.log.warn({ refreshToken }, "Invalid or expired refresh token");
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
          req.log.warn({ id }, "User not found during token refresh");
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
      req.log.warn({ id }, "Token reuse detected during refresh");
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
    if (error instanceof AuthenticationError) {
      req.log.warn({ err: error }, "Authentication error during token refresh");
      return res.status(401).json({ error: error.message });
    }

    req.log.error({ err: error }, "Failed to refresh token");
    res.status(500).json({ error: "Failed to refresh token" });
  }
};
