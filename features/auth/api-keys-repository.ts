import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyHash: string;
  userId: string;
  organizationId: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export async function getApiKeyByHash(keyHash: string): Promise<ApiKeyRecord | null> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).apiKeys)
    .where(eq((schema as any).apiKeys.keyHash, keyHash));
  return (rows[0] as ApiKeyRecord) || null;
}
