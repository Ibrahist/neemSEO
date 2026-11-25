import "server-only";
import { eq, and, gt } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface ApiCacheRecord {
  id: string;
  endpoint: string;
  requestHash: string;
  responseJson: string;
  costUsd: number;
  expiresAt: Date;
  createdAt: Date;
}

export async function getCachedRow(requestHash: string): Promise<ApiCacheRecord | null> {
  const { db, schema } = await getDb();
  const now = new Date();

  const rows = await (db as any)
    .select()
    .from((schema as any).apiCache)
    .where(
      and(
        eq((schema as any).apiCache.requestHash, requestHash),
        gt((schema as any).apiCache.expiresAt, now)
      )
    );

  return (rows[0] as ApiCacheRecord) || null;
}

export async function insertOrUpdateCache(
  endpoint: string,
  requestHash: string,
  responseJson: string,
  costUsd: number,
  expiresAt: Date
): Promise<void> {
  const { db, schema } = await getDb();
  const id = `cache_${crypto.randomUUID()}`;
  const now = new Date();

  const existing = await (db as any)
    .select()
    .from((schema as any).apiCache)
    .where(eq((schema as any).apiCache.requestHash, requestHash));

  if (existing.length > 0) {
    await (db as any)
      .update((schema as any).apiCache)
      .set({
        responseJson,
        costUsd,
        expiresAt,
      })
      .where(eq((schema as any).apiCache.requestHash, requestHash));
  } else {
    await (db as any).insert((schema as any).apiCache).values({
      id,
      endpoint,
      requestHash,
      responseJson,
      costUsd,
      expiresAt,
      createdAt: now,
    });
  }
}
