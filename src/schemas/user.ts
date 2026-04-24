import z from "zod";

const createUserSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8  characters long"),
  name: z.string().min(1, "Name is required"),
});

const userIdSchema = z.object({
  id: z.uuid("Invalid user ID format"),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export { createUserSchema, userIdSchema, updateUserSchema };
