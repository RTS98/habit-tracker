import z from "zod";

const createHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(100, "Name too long"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"], {
    error: "Frequency must be one of: daily, weekly, monthly",
  }),
  targetCount: z.number().int().positive().optional().default(1),
  tagIds: z.array(z.uuid()).optional(),
});

const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  targetCount: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

const uuidSchema = z.object({
  id: z.uuid("Invalid habit ID format"),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type HabitIdInput = z.infer<typeof uuidSchema>;

export { createHabitSchema, updateHabitSchema, uuidSchema };
