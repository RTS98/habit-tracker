import db from "./connection.ts";
import { habits, users } from "./schema.ts";
import { faker } from "@faker-js/faker";

const HABIT_COUNT = 5000;
const CHUNK_SIZE = 500;
const FREQUENCIES = ["daily", "weekly", "monthly"] as const;

async function seedHabits() {
  console.log(`🌱 Seeding ${HABIT_COUNT} habits...`);

  // habits.userId is a NOT NULL FK — every habit must point at a real user.
  // Pull existing ids once and distribute habits randomly across them.
  const existingUsers = await db.select({ id: users.id }).from(users);
  if (existingUsers.length === 0) {
    throw new Error("No users found. Run `npm run db:seed:users` first.");
  }
  const userIds = existingUsers.map((u) => u.id);
  console.log(`  distributing across ${userIds.length} users`);

  const rows = Array.from({ length: HABIT_COUNT }, () => ({
    userId: faker.helpers.arrayElement(userIds),
    name: faker.hacker.verb() + " " + faker.hacker.noun(), // varchar(100)
    description: faker.lorem.sentence(),
    frequency: faker.helpers.arrayElement(FREQUENCIES),
    targetCount: faker.number.int({ min: 1, max: 10 }),
    isActive: faker.datatype.boolean(0.8), // ~80% active
  }));

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    await db.insert(habits).values(chunk);
    console.log(
      `  inserted ${Math.min(i + CHUNK_SIZE, rows.length)}/${rows.length}`,
    );
  }

  console.log("✅ Done seeding habits.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedHabits()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

export default seedHabits;
