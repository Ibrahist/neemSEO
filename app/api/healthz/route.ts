import { NextResponse } from "next/server";
import { getSystemHealth } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getSystemHealth();

  return NextResponse.json(
    {
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: health.uptimeSeconds,
      version: health.version,
      runtime: health.runtime,
      database: {
        dialect: health.database.dialect,
        status: health.database.status,
        latencyMs: health.database.latencyMs,
      },
      services: health.services,
    },
    { status: health.statusCode }
  );
}
