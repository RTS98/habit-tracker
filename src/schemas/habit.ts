import z from "zod";

const createHabitSchema = z.object({
  name: z.string(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;

export default createHabitSchema;
 