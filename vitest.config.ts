import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test-setup.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 3,
        minForks: 1,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", ".next/", ".open-next/", "scripts/", "**/*.d.ts", "**/*.config.*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "server-only": path.resolve(__dirname, "./test-server-only.ts"),
    },
  },
});
