import "server-only";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface ApiUsageLogRecord {
  id: string;
  projectId: string;
  userId: string | null;
  endpoint: string;
  costUsd: number;
  creditsUsed: number;
  durationMs: number;
  status: string;
  createdAt: Date;
}

export interface CreateUsageLogInput {
  projectId: string;
  userId?: string | null;
  endpoint: string;
  costUsd: number;
  creditsUsed?: number;
  durationMs: number;
  status?: string;
}

export async function insertUsageLog(data: CreateUsageLogInput): Promise<void> {
  const { db, schema } = await getDb();
  const id = `usage_${crypto.randomUUID()}`;
  const now = new Date();

  await (db as any).insert((schema as any).apiUsageLogs).values({
    id,
    projectId: data.projectId,
    userId: data.userId || null,
    endpoint: data.endpoint,
    costUsd: data.costUsd,
    creditsUsed: data.creditsUsed ?? data.costUsd,
    durationMs: data.durationMs,
    status: data.status || "success",
    createdAt: now,
  });
}

export async function getUsageLogsByProject(
  projectId: string,
  limit = 50
): Promise<ApiUsageLogRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).apiUsageLogs)
    .where(eq((schema as any).apiUsageLogs.projectId, projectId))
    .orderBy(desc((schema as any).apiUsageLogs.createdAt))
    .limit(limit);

  return rows as ApiUsageLogRecord[];
}
