import z from "zod";
import { users } from "../db/schema.ts";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

const insertUserSchema = createInsertSchema(users);
const updateUserSchema = createUpdateSchema(users);

const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const userIdSchema = z.object({
  id: z.uuid("Invalid user ID format"),
});

export type CreateUserInput = z.infer<typeof insertUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export { insertUserSchema, userIdSchema, updateUserSchema, loginSchema };
