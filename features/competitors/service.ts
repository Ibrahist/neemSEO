import "server-only";
import * as compRepo from "./repository";
import { executeDataForSEOQuery } from "@/lib/dataforseo/client";
import { getEnv } from "@/lib/env";

export interface KeywordGapItem {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number | null;
  competitorPosition: number;
  targetPosition: number | null; // null if unranked
  opportunityScore: number;
}

export async function addCompetitor(params: {
  projectId: string;
  userId?: string | null;
  competitorDomain: string;
  customApiKey?: string;
}) {
  const { projectId, userId, competitorDomain, customApiKey } = params;
  if (!projectId || !competitorDomain) {
    throw new Error("projectId and competitorDomain are required");
  }

  const cleanDomain = competitorDomain
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase()
    .trim();

  const comp = await compRepo.insertCompetitorDomain(projectId, cleanDomain);
  const today = new Date().toISOString().split("T")[0];

  const env = getEnv();
  const apiKey = customApiKey || env.DATAFORSEO_API_KEY;

  let keywordsCount = 0;
  let trafficEst = 0;
  let rank = 0;

  if (apiKey) {
    try {
      const endpoint = "dataforseo_labs/google/ranked_keywords/live";
      const payload = [
        { target: cleanDomain, location_code: 2840, language_code: "en", limit: 10 },
      ];
      const res = await executeDataForSEOQuery<any>(endpoint, payload, {
        projectId,
        userId,
        customApiKey,
      });
      const metrics = res.tasks?.[0]?.result?.[0]?.metrics?.organic;
      if (metrics) {
        keywordsCount = metrics.count || 0;
        trafficEst = Math.round(metrics.etv || 0);
        rank = metrics.pos_1 || 0;
      }
    } catch (err) {
      console.warn("Failed to fetch live competitor metrics:", err);
    }
  }

  await compRepo.insertCompetitorMetrics({
    projectId,
    domain: cleanDomain,
    organicKeywordsCount: keywordsCount,
    organicTrafficEst: trafficEst,
    rank,
    snapshotDate: today,
  });

  return comp;
}

export async function getCompetitorOverview(projectId: string) {
  const domains = await compRepo.getCompetitorDomainsByProject(projectId);
  const metrics = await compRepo.getLatestCompetitorMetrics(projectId);
  return { domains, metrics };
}

export async function getKeywordGap(
  projectId: string,
  competitorDomain: string,
  targetDomain?: string,
  customApiKey?: string
): Promise<KeywordGapItem[]> {
  const env = getEnv();
  const apiKey = customApiKey || env.DATAFORSEO_API_KEY;

  if (!apiKey || !targetDomain) {
    // Return genuine empty list when unconfigured; never fabricate sample keywords
    return [];
  }

  const cleanComp = competitorDomain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .toLowerCase();
  const cleanTarget = targetDomain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .toLowerCase();

  try {
    const endpoint = "dataforseo_labs/google/domain_intersection/live";
    const payload = [
      {
        target1: cleanComp,
        target2: cleanTarget,
        location_code: 2840,
        language_code: "en",
        limit: 20,
      },
    ];
    const res = await executeDataForSEOQuery<any>(endpoint, payload, {
      projectId,
      customApiKey,
    });
    const items = res.tasks?.[0]?.result?.[0]?.items || [];

    return items.map((item: any) => {
      const keyword = item.keyword_data?.keyword || "unknown";
      const searchVolume = item.keyword_data?.keyword_info?.search_volume || 0;
      const keywordDifficulty = item.keyword_data?.keyword_properties?.keyword_difficulty ?? null;
      const competitorPosition = item.first_domain_serp_element?.rank_group || 100;
      const targetPosition = item.second_domain_serp_element?.rank_group ?? null;

      const opportunityScore = Math.max(
        10,
        Math.min(99, Math.round((searchVolume / 1000) * 10 - (keywordDifficulty ?? 50) * 0.3))
      );

      return {
        keyword,
        searchVolume,
        keywordDifficulty,
        competitorPosition,
        targetPosition,
        opportunityScore,
      };
    });
  } catch (err) {
    console.warn("Failed to fetch domain intersection for keyword gap:", err);
    return [];
  }
}
