import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/pg/index.ts",
  out: "./db/migrations/pg",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/neemseo",
  },
});
