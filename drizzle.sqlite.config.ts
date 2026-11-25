import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/sqlite/index.ts",
  out: "./db/migrations/sqlite",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SQLITE_FILE_PATH || "./data/neemseo.sqlite",
  },
});
