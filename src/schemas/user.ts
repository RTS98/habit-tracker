import z from "zod";

const insertUserSchema = z.object({
  email: z.email("Invalid email format"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number",
    ),
});

const updateUserSchema = z.object({
  email: z.email("Invalid email format").optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long")
    .optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number",
    ),
});

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

export {
  insertUserSchema,
  userIdSchema,
  updateUserSchema,
  loginSchema,
  changePasswordSchema,
};
