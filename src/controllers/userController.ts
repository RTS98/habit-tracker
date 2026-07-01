import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { users } from "../db/schema.ts";
import { eq, or, gt, and, asc } from "drizzle-orm";
import bcrypt from "bcrypt";
import { withUserContext } from "../db/userContext.ts";

type Cursor = {
  id: string;
  createdAt: string;
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const cursor = (req.query.cursor as string) || null;
  let decodedCursor: Cursor | null = null;
  if (cursor) {
    decodedCursor = JSON.parse(
      Buffer.from(cursor, "base64").toString("utf-8"),
    ) as Cursor;
  }

  try {
    const { id, role } = req.user!;
    const allUsers = await withUserContext(id, role, async (tx) =>
      tx
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(
          decodedCursor
            ? or(
                gt(users.createdAt, new Date(decodedCursor.createdAt)),
                and(
                  eq(users.createdAt, new Date(decodedCursor.createdAt)),
                  gt(users.id, decodedCursor.id),
                ),
              )
            : undefined,
        )
        .limit(limit)
        .orderBy(asc(users.createdAt), asc(users.id)),
    );

    res.json({
      users: allUsers,
      cursor: Buffer.from(
        JSON.stringify({
          id: allUsers[allUsers.length - 1]?.id,
          createdAt: allUsers[allUsers.length - 1]?.createdAt?.toISOString(),
        }),
      ).toString("base64"),
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch users");
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.id as string;
  const { id, role } = req.user!;

  try {
    const [user] = await withUserContext(id, role, async (tx) =>
      tx
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId)),
    );

    if (!user) {
      req.log.warn({ userId }, "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    req.log.error({ err: error, userId }, "Failed to fetch profile");
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const { id: userId, role } = req.user!;
    const hashedPassword = await bcrypt.hash(password, 12);
    const [newUser] = await withUserContext(userId, role, async (tx) =>
      tx
        .insert(users)
        .values({
          email,
          username,
          passwordHash: hashedPassword,
        })
        .returning({
          id: users.id,
          email: users.email,
          username: users.username,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }),
    );

    res.status(201).json({ user: newUser });
  } catch (error) {
    req.log.error({ err: error }, "Failed to create user");
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id: userId, role } = req.user!;
  const userToUpdateId = req.params.id as string;
  const { firstName, lastName } = req.body;

  try {
    const [updatedUser] = await withUserContext(userId, role, async (tx) =>
      tx
        .update(users)
        .set({
          firstName,
          lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userToUpdateId))
        .returning({
          id: users.id,
          email: users.email,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          updatedAt: users.updatedAt,
        }),
    );

    if (!updatedUser) {
      req.log.warn(
        { userId: userToUpdateId },
        "Attempt to update non-existent user",
      );
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    req.log.error(
      { err: error, userId: userToUpdateId },
      "Failed to update profile",
    );
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id: userId, role } = req.user!;
  const { currentPassword, newPassword } = req.body;

  try {
    // Get current user with password
    const [user] = await withUserContext(userId, role, async (tx) =>
      tx.select().from(users).where(eq(users.id, userId)),
    );

    if (!user) {
      req.log.warn(
        { userId },
        "User not found when attempting to change password",
      );
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isValidPassword) {
      req.log.warn({ userId }, "Incorrect current password provided");
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await withUserContext(userId, role, async (tx) =>
      tx
        .update(users)
        .set({
          passwordHash: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId)),
    );

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    req.log.error({ err: error, userId }, "Failed to change password");
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const userToDeleteId = req.params.id as string;
  const { id: userId, role } = req.user!;

  try {
    const [deletedUser] = await withUserContext(userId, role, async (tx) =>
      tx.delete(users).where(eq(users.id, userToDeleteId)).returning(),
    );

    if (!deletedUser) {
      req.log.warn(
        { userId: userToDeleteId },
        "Attempt to delete non-existent user",
      );
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).json({ message: "User deleted successfully" });
  } catch (error) {
    req.log.error(
      { err: error, userId: userToDeleteId },
      "Failed to delete user",
    );
    res.status(500).json({ error: "Failed to delete user" });
  }
};
