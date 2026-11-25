import "server-only";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface CompetitorDomainRecord {
  id: string;
  projectId: string;
  competitorDomain: string;
  createdAt: Date;
}

export interface CompetitorMetricsRecord {
  id: string;
  projectId: string;
  domain: string;
  organicKeywordsCount: number;
  organicTrafficEst: number;
  rank: number;
  snapshotDate: string;
  createdAt: Date;
}

export async function insertCompetitorDomain(
  projectId: string,
  competitorDomain: string
): Promise<CompetitorDomainRecord> {
  const { db, schema } = await getDb();
  const id = `comp_${crypto.randomUUID()}`;
  const now = new Date();
  const cleanDomain = competitorDomain
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase()
    .trim();

  await (db as any).insert((schema as any).competitorDomains).values({
    id,
    projectId,
    competitorDomain: cleanDomain,
    createdAt: now,
  });

  return {
    id,
    projectId,
    competitorDomain: cleanDomain,
    createdAt: now,
  };
}

export async function getCompetitorDomainsByProject(
  projectId: string
): Promise<CompetitorDomainRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).competitorDomains)
    .where(eq((schema as any).competitorDomains.projectId, projectId));

  return rows as CompetitorDomainRecord[];
}

export async function insertCompetitorMetrics(data: {
  projectId: string;
  domain: string;
  organicKeywordsCount: number;
  organicTrafficEst: number;
  rank: number;
  snapshotDate: string;
}): Promise<void> {
  const { db, schema } = await getDb();
  const id = `cmet_${crypto.randomUUID()}`;
  const now = new Date();

  await (db as any).insert((schema as any).competitorMetrics).values({
    id,
    projectId: data.projectId,
    domain: data.domain.toLowerCase().trim(),
    organicKeywordsCount: data.organicKeywordsCount,
    organicTrafficEst: data.organicTrafficEst,
    rank: data.rank,
    snapshotDate: data.snapshotDate,
    createdAt: now,
  });
}

export async function getLatestCompetitorMetrics(
  projectId: string
): Promise<CompetitorMetricsRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).competitorMetrics)
    .where(eq((schema as any).competitorMetrics.projectId, projectId))
    .orderBy(desc((schema as any).competitorMetrics.snapshotDate));

  // Deduplicate by domain, keeping newest snapshot
  const seen = new Set<string>();
  const latest: CompetitorMetricsRecord[] = [];
  for (const r of rows as CompetitorMetricsRecord[]) {
    if (!seen.has(r.domain)) {
      seen.add(r.domain);
      latest.push(r);
    }
  }

  return latest;
}
