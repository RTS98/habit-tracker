import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // Automatically clean up after each test to ensure isolation
    clearMocks: true,
    restoreMocks: true,
    pool: "threads",
    globalSetup: "./src/tests/globalSetup.ts",
    include: ["**/*.test.ts"],
    // Ensure tests run sequentially to avoid database conflicts
    fileParallelism: false,
  },
  plugins: [],
});
