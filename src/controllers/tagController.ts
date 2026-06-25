import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import db from "../db/connection.ts";
import { tags } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { withUserContext } from "../db/userContext.ts";

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  const { name, color } = req.body;
  const { id: userId, role } = req.user!;

  try {
    // Check if tag with same name already exists
    const existingTag = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    });

    if (existingTag) {
      req.log.warn({ name }, "Attempt to create duplicate tag");
      return res
        .status(409)
        .json({ error: "Tag with this name already exists" });
    }

    const [newTag] = await withUserContext(userId, role, async (tx) => {
      return tx
        .insert(tags)
        .values({
          name,
          color: color || "#6B7280", // Default gray color
        })
        .returning();
    });

    res.status(201).json({
      message: "Tag created successfully",
      tag: newTag,
    });
  } catch (error) {
    req.log.error({ err: error, userId }, "Failed to create tag");
    res.status(500).json({ error: "Failed to create tag" });
  }
};

export const getTags = async (req: Request, res: Response) => {
  try {
    const allTags = await db.select().from(tags).orderBy(tags.name);

    res.json({
      tags: allTags,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch tags");
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

export const getTagById = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, id),
      with: {
        habits: {
          with: {
            habit: {
              columns: {
                id: true,
                name: true,
                description: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      req.log.warn({ tagId: id }, "Tag not found");
      return res.status(404).json({ error: "Tag not found" });
    }

    // Transform the data
    const tagWithHabits = {
      ...tag,
      habits: tag.habits.map((ht) => ht.habit),
    };

    res.json({
      tag: tagWithHabits,
    });
  } catch (error) {
    req.log.error({ err: error, tagId: id }, "Failed to fetch tag");
    res.status(500).json({ error: "Failed to fetch tag" });
  }
};

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { name, color } = req.body;
  const { id: userId, role } = req.user!;

  try {
    // If updating name, check if new name already exists
    if (name) {
      const existingTag = await db.query.tags.findFirst({
        where: eq(tags.name, name),
      });

      if (existingTag && existingTag.id !== id) {
        req.log.warn({ name }, "Attempt to update tag to duplicate name");
        return res
          .status(409)
          .json({ error: "Tag with this name already exists" });
      }
    }

    const [updatedTag] = await withUserContext(userId, role, async (tx) => {
      return tx
        .update(tags)
        .set({
          ...(name && { name }),
          ...(color && { color }),
          updatedAt: new Date(),
        })
        .where(eq(tags.id, id))
        .returning();
    });

    if (!updatedTag) {
      req.log.warn({ tagId: id }, "Attempt to update non-existent tag");
      return res.status(404).json({ error: "Tag not found" });
    }

    res.json({
      message: "Tag updated successfully",
      tag: updatedTag,
    });
  } catch (error) {
    req.log.error({ err: error, tagId: id }, "Failed to update tag");
    res.status(500).json({ error: "Failed to update tag" });
  }
};

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { id: userId, role } = req.user!;

  try {
    const [deletedTag] = await withUserContext(userId, role, async (tx) => {
      return tx.delete(tags).where(eq(tags.id, id)).returning();
    });

    if (!deletedTag) {
      req.log.warn({ tagId: id }, "Attempt to delete non-existent tag");
      return res.status(404).json({ error: "Tag not found" });
    }

    res.json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    req.log.error({ err: error, tagId: id }, "Failed to delete tag");
    res.status(500).json({ error: "Failed to delete tag" });
  }
};

export const getPopularTags = async (req: Request, res: Response) => {
  try {
    // Get all tags with their usage count
    const tagsWithCount = await db.query.tags.findMany({
      with: {
        habits: true,
      },
    });

    // Transform and sort by usage count
    const popularTags = tagsWithCount
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        usageCount: tag.habits.length,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10); // Top 10 most popular tags

    res.json({
      tags: popularTags,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch popular tags");
    res.status(500).json({ error: "Failed to fetch popular tags" });
  }
};
