import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  targetCount: integer("target_count").default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const entries = pgTable("habit_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  habit_id: uuid("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  completion: timestamp("completion_data").defaultNow().notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  color: varchar("color", { length: 7 }).notNull().default("#000000"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habitTags = pgTable("habit_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  habitId: uuid("habit_id")
    .references(() => habits.id, { onDelete: "cascade" })
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  habits: many(habits),
}));

export const habitRelations = relations(habits, ({ one, many }) => ({
  user: one(users, { fields: [habits.userId], references: [users.id] }),
  entries: many(entries),
  tags: many(habitTags),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  habit: one(habits, {
    fields: [entries.habit_id],
    references: [habits.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  habits: many(habitTags),
}));

export const habitTagsRelations = relations(habitTags, ({ one }) => ({
  habit: one(habits, {
    fields: [habitTags.habitId],
    references: [habits.id],
  }),
  tag: one(tags, { fields: [habitTags.tagId], references: [tags.id] }),
}));

export type User = typeof users.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type HabitTag = typeof habitTags.$inferSelect;
