import "server-only";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface BacklinkSnapshotRecord {
  id: string;
  projectId: string;
  domain: string;
  totalBacklinks: number;
  referringDomainsCount: number;
  rank: number;
  snapshotDate: string;
  createdAt: Date;
}

export interface ReferringDomainRecord {
  id: string;
  projectId: string;
  targetDomain: string;
  referringDomain: string;
  backlinksCount: number;
  rank: number;
  firstSeen: string | null;
  lastSeen: string | null;
}

export async function insertBacklinkSnapshot(data: {
  projectId: string;
  domain: string;
  totalBacklinks: number;
  referringDomainsCount: number;
  rank: number;
  snapshotDate: string;
}): Promise<BacklinkSnapshotRecord> {
  const { db, schema } = await getDb();
  const id = `blsnap_${crypto.randomUUID()}`;
  const now = new Date();

  const record: BacklinkSnapshotRecord = {
    id,
    projectId: data.projectId,
    domain: data.domain.toLowerCase().trim(),
    totalBacklinks: data.totalBacklinks,
    referringDomainsCount: data.referringDomainsCount,
    rank: data.rank,
    snapshotDate: data.snapshotDate,
    createdAt: now,
  };

  await (db as any).insert((schema as any).backlinkSnapshots).values(record);
  return record;
}

export async function getLatestBacklinkSnapshot(
  projectId: string,
  domain: string
): Promise<BacklinkSnapshotRecord | null> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).backlinkSnapshots)
    .where(
      and(
        eq((schema as any).backlinkSnapshots.projectId, projectId),
        eq((schema as any).backlinkSnapshots.domain, domain.toLowerCase().trim())
      )
    )
    .orderBy(desc((schema as any).backlinkSnapshots.snapshotDate))
    .limit(1);

  return (rows[0] as BacklinkSnapshotRecord) || null;
}

export async function insertReferringDomains(
  items: Array<{
    projectId: string;
    targetDomain: string;
    referringDomain: string;
    backlinksCount: number;
    rank: number;
    firstSeen?: string;
    lastSeen?: string;
  }>
): Promise<void> {
  if (items.length === 0) return;
  const { db, schema } = await getDb();

  for (const item of items) {
    const id = `refd_${crypto.randomUUID()}`;
    await (db as any).insert((schema as any).referringDomains).values({
      id,
      projectId: item.projectId,
      targetDomain: item.targetDomain.toLowerCase().trim(),
      referringDomain: item.referringDomain.toLowerCase().trim(),
      backlinksCount: item.backlinksCount,
      rank: item.rank,
      firstSeen: item.firstSeen || null,
      lastSeen: item.lastSeen || null,
    });
  }
}

export async function getReferringDomains(
  projectId: string,
  targetDomain: string,
  limit = 50
): Promise<ReferringDomainRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).referringDomains)
    .where(
      and(
        eq((schema as any).referringDomains.projectId, projectId),
        eq((schema as any).referringDomains.targetDomain, targetDomain.toLowerCase().trim())
      )
    )
    .orderBy(desc((schema as any).referringDomains.rank))
    .limit(limit);

  return rows as ReferringDomainRecord[];
}
