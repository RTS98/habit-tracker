import db from "./connection.ts";
import { tags } from "./schema.ts";
import { faker } from "@faker-js/faker";

const TAG_COUNT = 500;
const CHUNK_SIZE = 500;

async function seedTags() {
  console.log(`🌱 Seeding ${TAG_COUNT} tags...`);

  // tags.name is UNIQUE, so we need TAG_COUNT distinct names. Faker words
  // collide well before 500, so collect into a Set and top up until full.
  // A numeric suffix fallback guarantees the loop always terminates.
  const names = new Set<string>();
  while (names.size < TAG_COUNT) {
    const base = faker.word.adjective();
    const name = names.has(base) ? `${base}-${names.size}` : base;
    names.add(name.slice(0, 50)); // varchar(50)
  }

  const rows = Array.from(names, (name) => ({
    name,
    color: faker.color.rgb({ format: "hex" }), // "#rrggbb" → 7 chars
  }));

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    await db.insert(tags).values(chunk).onConflictDoNothing();
    console.log(
      `  inserted ${Math.min(i + CHUNK_SIZE, rows.length)}/${rows.length}`,
    );
  }

  console.log("✅ Done seeding tags.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedTags()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

export default seedTags;
