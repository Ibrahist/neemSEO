import "server-only";
import { getDb, getDialect } from "@/db/client";
import { getRuntimeEnvironment } from "@/lib/runtime";
import { getEnv } from "@/lib/env";
import { sql } from "drizzle-orm";

export interface HealthCheckResult {
  status: "healthy" | "degraded";
  statusCode: number;
  database: {
    dialect: string;
    status: "connected" | "error";
    latencyMs: number;
  };
  services: {
    dataforseo: {
      configured: boolean;
      status: "configured" | "missing_credentials";
    };
    aiAgent: {
      configured: boolean;
      model: string;
    };
  };
  runtime: string;
  uptimeSeconds: number;
  version: string;
}

export async function getSystemHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  let dbConnected = false;

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
    dbConnected = true;
  } catch (err: unknown) {
    console.error("Healthcheck DB ping error:", err instanceof Error ? err.message : err);
    dbConnected = false;
  }

  const latencyMs = Date.now() - startTime;
  const env = getEnv();
  const hasDataForSeo = Boolean(
    env.DATAFORSEO_API_KEY || (env.DATAFORSEO_LOGIN && env.DATAFORSEO_PASSWORD)
  );
  const hasOpenRouter = Boolean(env.OPENROUTER_API_KEY);

  return {
    status: dbConnected ? "healthy" : "degraded",
    statusCode: dbConnected ? 200 : 503,
    database: {
      dialect: getDialect(),
      status: dbConnected ? "connected" : "error",
      latencyMs,
    },
    services: {
      dataforseo: {
        configured: hasDataForSeo,
        status: hasDataForSeo ? "configured" : "missing_credentials",
      },
      aiAgent: {
        configured: hasOpenRouter,
        model: env.OPENROUTER_MODEL,
      },
    },
    runtime: getRuntimeEnvironment(),
    uptimeSeconds: process.uptime ? Math.floor(process.uptime()) : 0,
    version: "0.1.0",
  };
}
