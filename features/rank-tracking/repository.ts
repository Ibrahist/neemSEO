import "server-only";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface TrackedKeywordRecord {
  id: string;
  projectId: string;
  keyword: string;
  targetDomain: string;
  locationCode: number;
  languageCode: string;
  tags: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface RankHistoryRecord {
  id: string;
  trackedKeywordId: string;
  projectId: string;
  position: number | null;
  url: string | null;
  serpFeaturesJson: string | null;
  checkDate: string;
  createdAt: Date;
}

export async function insertTrackedKeyword(data: {
  projectId: string;
  keyword: string;
  targetDomain: string;
  locationCode?: number;
  languageCode?: string;
  tags?: string | null;
}): Promise<TrackedKeywordRecord> {
  const { db, schema } = await getDb();
  const id = `trk_${crypto.randomUUID()}`;
  const now = new Date();

  await (db as any).insert((schema as any).trackedKeywords).values({
    id,
    projectId: data.projectId,
    keyword: data.keyword.trim().toLowerCase(),
    targetDomain: data.targetDomain.trim().toLowerCase(),
    locationCode: data.locationCode ?? 2840,
    languageCode: data.languageCode ?? "en",
    tags: data.tags || null,
    isActive: true,
    createdAt: now,
  });

  return {
    id,
    projectId: data.projectId,
    keyword: data.keyword.trim().toLowerCase(),
    targetDomain: data.targetDomain.trim().toLowerCase(),
    locationCode: data.locationCode ?? 2840,
    languageCode: data.languageCode ?? "en",
    tags: data.tags || null,
    isActive: true,
    createdAt: now,
  };
}

export async function getTrackedKeywordsByProject(
  projectId: string
): Promise<TrackedKeywordRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).trackedKeywords)
    .where(eq((schema as any).trackedKeywords.projectId, projectId))
    .orderBy(desc((schema as any).trackedKeywords.createdAt));

  return rows as TrackedKeywordRecord[];
}

export async function insertRankSnapshot(data: {
  trackedKeywordId: string;
  projectId: string;
  position: number | null;
  url?: string | null;
  serpFeaturesJson?: string | null;
  checkDate: string;
}): Promise<void> {
  const { db, schema } = await getDb();
  const id = `rnk_${crypto.randomUUID()}`;
  const now = new Date();

  await (db as any).insert((schema as any).rankHistory).values({
    id,
    trackedKeywordId: data.trackedKeywordId,
    projectId: data.projectId,
    position: data.position,
    url: data.url || null,
    serpFeaturesJson: data.serpFeaturesJson || null,
    checkDate: data.checkDate,
    createdAt: now,
  });
}

export async function getRankHistory(
  trackedKeywordId: string,
  projectId: string,
  limit = 30
): Promise<RankHistoryRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).rankHistory)
    .where(
      and(
        eq((schema as any).rankHistory.trackedKeywordId, trackedKeywordId),
        eq((schema as any).rankHistory.projectId, projectId)
      )
    )
    .orderBy(desc((schema as any).rankHistory.checkDate))
    .limit(limit);

  return rows as RankHistoryRecord[];
}

export async function getLatestProjectRankSnapshots(
  projectId: string
): Promise<
  Array<TrackedKeywordRecord & { latestPosition: number | null; latestDate: string | null }>
> {
  const keywords = await getTrackedKeywordsByProject(projectId);
  const result = [];

  for (const kw of keywords) {
    const history = await getRankHistory(kw.id, projectId, 1);
    result.push({
      ...kw,
      latestPosition: history[0]?.position ?? null,
      latestDate: history[0]?.checkDate ?? null,
    });
  }

  return result;
}
