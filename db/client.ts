import "server-only";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { createClient } from "@libsql/client";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import * as sqliteSchema from "./schema/sqlite";
import * as pgSchema from "./schema/pg";
import { getEnv } from "@/lib/env";
import { getCloudflareEnv, getRuntimeEnvironment } from "@/lib/runtime";

export type Dialect = "sqlite" | "postgres";

let sqliteInstance: ReturnType<typeof drizzleLibsql<typeof sqliteSchema>> | null = null;
let pgInstance: ReturnType<typeof drizzlePg<typeof pgSchema>> | null = null;
let d1Instance: ReturnType<typeof drizzleD1<typeof sqliteSchema>> | null = null;

export function getDialect(): Dialect {
  const env = getEnv();
  if (
    env.DATABASE_URL &&
    (env.DATABASE_URL.startsWith("postgres://") || env.DATABASE_URL.startsWith("postgresql://"))
  ) {
    return "postgres";
  }
  return "sqlite";
}

export async function getDb() {
  const runtime = getRuntimeEnvironment();

  if (runtime === "cloudflare") {
    const cfEnv = await getCloudflareEnv();
    if (cfEnv?.DB) {
      if (!d1Instance) {
        d1Instance = drizzleD1(cfEnv.DB, { schema: sqliteSchema });
      }
      return { db: d1Instance, dialect: "sqlite" as const, schema: sqliteSchema };
    }
  }

  const dialect = getDialect();

  if (dialect === "postgres") {
    if (!pgInstance) {
      const env = getEnv();
      const pool = new pg.Pool({
        connectionString: env.DATABASE_URL,
      });
      pgInstance = drizzlePg(pool, { schema: pgSchema });
    }
    return { db: pgInstance, dialect: "postgres" as const, schema: pgSchema };
  }

  if (!sqliteInstance) {
    const env = getEnv();
    const dbPath = env.SQLITE_FILE_PATH;
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const client = createClient({
      url: `file:${path.resolve(process.cwd(), dbPath)}`,
    });
    sqliteInstance = drizzleLibsql(client, { schema: sqliteSchema });
  }

  return { db: sqliteInstance, dialect: "sqlite" as const, schema: sqliteSchema };
}
