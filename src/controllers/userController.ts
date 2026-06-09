import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import db from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { withUserContext } from "../db/userContext.ts";

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    res.json({ users: allUsers });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id as string;

    const [user] = await db
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
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const userId = req.user!.id;
    const hashedPassword = await bcrypt.hash(password, 12);
    const [newUser] = await withUserContext(userId, async (tx) =>
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
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.id;
    const userToUpdateId = req.params.id as string;
    const { firstName, lastName } = req.body;
    const [updatedUser] = await withUserContext(userId, async (tx) =>
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
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const [user] = await withUserContext(userId, async (tx) =>
      tx.select().from(users).where(eq(users.id, userId)),
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await withUserContext(userId, async (tx) =>
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
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userToDeleteId = req.params.id as string;
    const userId = req.user!.id;
    const [deletedUser] = await withUserContext(userId, async (tx) =>
      tx.delete(users).where(eq(users.id, userToDeleteId)).returning(),
    );

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
