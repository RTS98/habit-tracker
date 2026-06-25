import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { habits, entries, habitTags } from "../db/schema.ts";
import { eq, and, desc } from "drizzle-orm";
import { withUserContext } from "../db/userContext.ts";

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body;
    const { id: userId, role } = req.user!;

    const result = await withUserContext(userId, role, async (tx) => {
      // Create the habit
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning();

      // If tags are provided, create the associations
      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId,
        }));
        await tx.insert(habitTags).values(habitTagValues);
      }

      return newHabit;
    });

    res.status(201).json({
      message: "Habit created successfully",
      habit: result,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to create habit");
    res.status(500).json({ error: "Failed to create habit" });
  }
};

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id: userId, role } = req.user!;
    // Query habits with their tags using relations
    const userHabitsWithTags = await withUserContext(
      userId,
      role,
      async (tx) => {
        return tx.query.habits.findMany({
          where: eq(habits.userId, userId),
          with: {
            tags: {
              with: {
                tag: true,
              },
            },
          },
          orderBy: [desc(habits.createdAt)],
        });
      },
    );

    // Transform the data to include tags directly
    const habitsWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.tags.map((ht) => ht.tag),
      habitTags: undefined, // Remove intermediate relation
    }));

    res.json({
      habits: habitsWithTags,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch habits");
    res.status(500).json({ error: "Failed to fetch habits" });
  }
};

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const id = req.params.id as string;
  const { id: userId, role } = req.user!;

  try {
    const habit = await withUserContext(userId, role, async (tx) => {
      return tx.query.habits.findFirst({
        where: and(eq(habits.id, id), eq(habits.userId, userId)),
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
          entries: {
            orderBy: [desc(entries.completion)],
            limit: 10, // Recent entries only
          },
        },
      });
    });

    if (!habit) {
      req.log.warn({ habitId: id, userId }, "Habit not found");
      return res.status(404).json({ error: "Habit not found" });
    }

    // Transform the data
    const habitWithTags = {
      ...habit,
      tags: habit.tags.map((ht) => ht.tag),
      habitTags: undefined,
    };

    res.json({
      habit: habitWithTags,
    });
  } catch (error) {
    req.log.error(
      { err: error, habitId: id, userId },
      `Failed to fetch habit with id ${id}`,
    );
    res.status(500).json({ error: "Failed to fetch habit" });
  }
};

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { id: userId, role } = req.user!;
  const { tagIds, ...updates } = req.body;

  try {
    const result = await withUserContext(userId, role, async (tx) => {
      // Update the habit
      const [updatedHabit] = await tx
        .update(habits)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
        .returning();

      if (!updatedHabit) {
        throw new Error("Habit not found");
      }

      // If tagIds are provided, update the associations
      if (tagIds !== undefined) {
        // Remove existing tags
        await tx.delete(habitTags).where(eq(habitTags.habitId, id));

        // Add new tags
        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId: string) => ({
            habitId: id,
            tagId,
          }));
          await tx.insert(habitTags).values(habitTagValues);
        }
      }

      return updatedHabit;
    });

    res.json({
      message: "Habit updated successfully",
      habit: result,
    });
  } catch (error: any) {
    if (error.message === "Habit not found") {
      req.log.warn({ habitId: id, userId }, "Habit not found for update");
      return res.status(404).json({ error: "Habit not found" });
    }
    req.log.error(
      { err: error, habitId: id, userId },
      "Failed to update habit",
    );
    res.status(500).json({ error: "Failed to update habit" });
  }
};

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { id: userId, role } = req.user!;

  try {
    const [deletedHabit] = await withUserContext(userId, role, async (tx) => {
      return tx
        .delete(habits)
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
        .returning();
    });

    if (!deletedHabit) {
      req.log.warn({ habitId: id, userId }, "Habit not found for deletion");
      return res.status(404).json({ error: "Habit not found" });
    }

    res.json({
      message: "Habit deleted successfully",
    });
  } catch (error) {
    req.log.error(
      { err: error, habitId: id, userId },
      "Failed to delete habit",
    );
    res.status(500).json({ error: "Failed to delete habit" });
  }
};
