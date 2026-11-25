import { NextResponse } from "next/server";
import { getDb, getDialect } from "@/db/client";
import { getRuntimeEnvironment } from "@/lib/runtime";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbError: string | null = null;

  try {
    const { db } = await getDb();
    const executable = db as {
      run?: (q: unknown) => Promise<unknown>;
      execute?: (q: unknown) => Promise<unknown>;
    };
    if (typeof executable.run === "function") {
      await executable.run(sql`SELECT 1`);
    } else if (typeof executable.execute === "function") {
      await executable.execute(sql`SELECT 1`);
    }
    dbStatus = "connected";
  } catch (error: unknown) {
    dbStatus = "error";
    dbError = error instanceof Error ? error.message : "Database connection failed";
  }

  const status = dbStatus === "connected" ? "healthy" : "degraded";
  const statusCode = status === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? process.uptime() : undefined,
      version: "0.1.0",
      runtime: getRuntimeEnvironment(),
      database: {
        dialect: getDialect(),
        status: dbStatus,
        error: dbError,
        latencyMs: Date.now() - startTime,
      },
    },
    { status: statusCode }
  );
}
