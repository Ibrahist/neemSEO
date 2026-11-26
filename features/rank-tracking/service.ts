import "server-only";
import * as rankRepo from "./repository";
import { executeDataForSEOQuery } from "@/lib/dataforseo/client";
import { getEnv } from "@/lib/env";

export async function trackKeyword(params: {
  projectId: string;
  userId?: string | null;
  keyword: string;
  targetDomain: string;
  locationCode?: number;
  languageCode?: string;
  tags?: string;
  customApiKey?: string;
}) {
  const {
    projectId,
    userId,
    keyword,
    targetDomain,
    locationCode = 2840,
    languageCode = "en",
    tags,
    customApiKey,
  } = params;

  if (!projectId || !keyword || !targetDomain) {
    throw new Error("projectId, keyword, and targetDomain are required");
  }

  // 1. Add tracked keyword
  const tracked = await rankRepo.insertTrackedKeyword({
    projectId,
    keyword,
    targetDomain,
    locationCode,
    languageCode,
    tags,
  });

  const today = new Date().toISOString().split("T")[0];
  let position: number | null = null;
  let rankingUrl: string | null = null;

  const env = getEnv();
  const apiKey = customApiKey || env.DATAFORSEO_API_KEY;

  if (apiKey) {
    try {
      const endpoint = "serp/google/organic/live/advanced";
      const payload = [
        {
          keyword,
          location_code: locationCode,
          language_code: languageCode,
          depth: 100,
        },
      ];

      const response = await executeDataForSEOQuery<any>(endpoint, payload, {
        projectId,
        userId,
        customApiKey,
      });

      const items = response.tasks?.[0]?.result?.[0]?.items || [];
      const cleanTarget = targetDomain.replace(/^www\./, "").toLowerCase();

      for (const item of items) {
        if (item.type === "organic" && item.domain) {
          const itemDomain = item.domain.replace(/^www\./, "").toLowerCase();
          if (itemDomain.includes(cleanTarget) || cleanTarget.includes(itemDomain)) {
            position = item.rank_absolute || item.rank_group;
            rankingUrl = item.url;
            break;
          }
        }
      }
    } catch (error) {
      console.warn("Live SERP check failed:", error);
      position = null;
      rankingUrl = null;
    }
  } else {
    // No DataForSEO key configured: position is unranked / not in top 100
    position = null;
    rankingUrl = null;
  }

  // Record today's position snapshot (no fabricated history)
  await rankRepo.insertRankSnapshot({
    trackedKeywordId: tracked.id,
    projectId,
    position,
    url: rankingUrl,
    checkDate: today,
  });

  return {
    trackedKeyword: tracked,
    initialPosition: position,
    rankingUrl,
  };
}

export async function listTrackedKeywords(projectId: string) {
  return await rankRepo.getLatestProjectRankSnapshots(projectId);
}

export async function getRankHistory(trackedKeywordId: string, projectId: string) {
  const history = await rankRepo.getRankHistory(trackedKeywordId, projectId, 30);
  // Return sorted chronologically for charting
  return history.reverse();
}
