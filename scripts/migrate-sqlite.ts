import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "../db/schema/sqlite";

async function runSqliteMigrations() {
  const dbPath = process.env.SQLITE_FILE_PATH || "./data/neemseo.sqlite";
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const client = createClient({
    url: `file:${path.resolve(process.cwd(), dbPath)}`,
  });
  const db = drizzle(client, { schema });

  const migrationsFolder = path.resolve(process.cwd(), "db/migrations/sqlite");
  if (fs.existsSync(migrationsFolder)) {
    console.log(`Applying SQLite migrations from ${migrationsFolder}...`);
    await migrate(db, { migrationsFolder });
    console.log("SQLite migrations applied successfully.");
  } else {
    console.log("No SQLite migrations directory found yet. Run `pnpm db:generate` first.");
  }
}

runSqliteMigrations().catch((err) => {
  console.error("Failed to run SQLite migrations:", err);
  process.exit(1);
});
