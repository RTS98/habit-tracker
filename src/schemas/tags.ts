import z from "zod";

// Validation schemas
const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50, "Name too long"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional(),
});

const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional(),
});

const uuidSchema = z.object({
  id: z.uuid("Invalid tag ID format"),
});

export { createTagSchema, updateTagSchema, uuidSchema };

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type TagIdInput = z.infer<typeof uuidSchema>;
