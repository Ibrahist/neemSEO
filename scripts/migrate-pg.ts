import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "../db/schema/pg";

async function runPgMigrations() {
  const connectionString =
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/neemseo";
  const pool = new pg.Pool({ connectionString });
  const db = drizzle(pool, { schema });

  const migrationsFolder = path.resolve(process.cwd(), "db/migrations/pg");
  if (fs.existsSync(migrationsFolder)) {
    console.log(`Applying PostgreSQL migrations from ${migrationsFolder}...`);
    await migrate(db, { migrationsFolder });
    console.log("PostgreSQL migrations applied successfully.");
  } else {
    console.log("No PostgreSQL migrations directory found yet. Run `pnpm db:generate` first.");
  }
  await pool.end();
}

runPgMigrations().catch((err) => {
  console.error("Failed to run PostgreSQL migrations:", err);
  process.exit(1);
});
