import db from "./connection.ts";
import { users } from "./schema.ts";
import { hashPassword } from "../utils/password.ts";
import { faker } from "@faker-js/faker";

const USER_COUNT = 1000;
const CHUNK_SIZE = 500;
const SHARED_PASSWORD = "password123";

async function seedUsers() {
  console.log(`🌱 Seeding ${USER_COUNT} users...`);

  // Hash ONCE and reuse — seed users all share a password, so there's no
  // reason to pay the bcrypt cost 1000 times.
  const passwordHash = await hashPassword(SHARED_PASSWORD);

  const rows = Array.from({ length: USER_COUNT }, (_, i) => {
    const n = i + 1;
    return {
      email: faker.internet.email(),
      username: faker.internet.username(),
      passwordHash,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
  });

  // Insert in chunks to keep each statement well under Postgres's bind-param
  // limit and to avoid one giant statement.
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    await db.insert(users).values(chunk).onConflictDoNothing();
    console.log(
      `  inserted ${Math.min(i + CHUNK_SIZE, rows.length)}/${rows.length}`,
    );
  }

  console.log("✅ Done seeding users.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

export default seedUsers;
