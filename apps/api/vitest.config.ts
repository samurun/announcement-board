import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/vitest.setup.ts"],
    globals: false,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 15000,
  },
})
