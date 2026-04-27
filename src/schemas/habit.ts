import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { habits } from "../db/schema.ts";

const createHabitSchema = createInsertSchema(habits);

export type CreateHabitInput = z.infer<typeof createHabitSchema>;

export default createHabitSchema;
