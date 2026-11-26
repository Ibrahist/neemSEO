import "server-only";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface KeywordSearchRecord {
  id: string;
  projectId: string;
  seedKeyword: string;
  locationCode: number;
  languageCode: string;
  createdAt: Date;
}

export interface KeywordRecord {
  id: string;
  searchId: string;
  projectId: string;
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  keywordDifficulty: number | null;
  intent: "informational" | "navigational" | "commercial" | "transactional";
  rawDataJson: string | null;
  updatedAt: Date;
}

export interface CreateKeywordSearchInput {
  projectId: string;
  seedKeyword: string;
  locationCode?: number;
  languageCode?: string;
}

export interface CreateKeywordInput {
  searchId: string;
  projectId: string;
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  keywordDifficulty: number | null;
  intent: "informational" | "navigational" | "commercial" | "transactional";
  rawDataJson?: string | null;
}

export async function insertKeywordSearch(
  data: CreateKeywordSearchInput
): Promise<KeywordSearchRecord> {
  const { db, schema } = await getDb();
  const id = `search_${crypto.randomUUID()}`;
  const now = new Date();

  await (db as any).insert((schema as any).keywordSearches).values({
    id,
    projectId: data.projectId,
    seedKeyword: data.seedKeyword.trim().toLowerCase(),
    locationCode: data.locationCode ?? 2840,
    languageCode: data.languageCode ?? "en",
    createdAt: now,
  });

  return {
    id,
    projectId: data.projectId,
    seedKeyword: data.seedKeyword.trim().toLowerCase(),
    locationCode: data.locationCode ?? 2840,
    languageCode: data.languageCode ?? "en",
    createdAt: now,
  };
}

export async function insertKeywords(items: CreateKeywordInput[]): Promise<void> {
  if (items.length === 0) return;
  const { db, schema } = await getDb();
  const now = new Date();

  for (const item of items) {
    const id = `kw_${crypto.randomUUID()}`;
    await (db as any).insert((schema as any).keywords).values({
      id,
      searchId: item.searchId,
      projectId: item.projectId,
      keyword: item.keyword,
      searchVolume: item.searchVolume,
      cpc: item.cpc,
      competition: item.competition,
      keywordDifficulty: item.keywordDifficulty,
      intent: item.intent,
      rawDataJson: item.rawDataJson || null,
      updatedAt: now,
    });
  }
}

export async function getKeywordsBySearchId(
  searchId: string,
  projectId: string
): Promise<KeywordRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).keywords)
    .where(
      and(
        eq((schema as any).keywords.searchId, searchId),
        eq((schema as any).keywords.projectId, projectId)
      )
    )
    .orderBy(desc((schema as any).keywords.searchVolume));

  return rows as KeywordRecord[];
}

export async function getLatestKeywordSearches(
  projectId: string,
  limit = 10
): Promise<KeywordSearchRecord[]> {
  const { db, schema } = await getDb();
  const rows = await (db as any)
    .select()
    .from((schema as any).keywordSearches)
    .where(eq((schema as any).keywordSearches.projectId, projectId))
    .orderBy(desc((schema as any).keywordSearches.createdAt))
    .limit(limit);

  return rows as KeywordSearchRecord[];
}
