import "server-only";
import * as keywordRepo from "./repository";
import { executeDataForSEOQuery } from "@/lib/dataforseo/client";
import { getEnv } from "@/lib/env";

export type SearchIntent = "informational" | "navigational" | "commercial" | "transactional";

export function detectSearchIntent(keyword: string): SearchIntent {
  const kw = keyword.toLowerCase();

  // Transactional signals
  if (
    /\b(buy|price|cost|pricing|cheap|discount|coupon|deal|order|purchase|shop|store)\b/.test(kw)
  ) {
    return "transactional";
  }

  // Commercial investigation signals
  if (
    /\b(best|top|review|reviews|vs|versus|compare|comparison|alternative|alternatives)\b/.test(kw)
  ) {
    return "commercial";
  }

  // Navigational signals
  if (/\b(login|signin|sign in|portal|official|account|app|dashboard)\b/.test(kw)) {
    return "navigational";
  }

  // Default to informational (how to, what is, guide, tips, etc.)
  return "informational";
}

interface DataForSEOKeywordItem {
  keyword: string;
  search_volume?: number;
  cpc?: number;
  competition?: number;
  keyword_difficulty?: number;
  search_intent_info?: {
    main_intent?: string;
  };
}

/**
 * Generates deterministic fallback keyword variations when running in dev/demo mode without DataForSEO key.
 */
function generateDevKeywordFixtures(seedKeyword: string): DataForSEOKeywordItem[] {
  const seed = seedKeyword.toLowerCase().trim();
  const variations = [
    { suffix: "", vol: 18100, cpc: 2.45, comp: 0.72, kd: 65, intent: "informational" },
    { suffix: " tools", vol: 9900, cpc: 3.1, comp: 0.81, kd: 58, intent: "commercial" },
    { suffix: " audit", vol: 6600, cpc: 4.25, comp: 0.65, kd: 52, intent: "commercial" },
    { suffix: " checklist", vol: 5400, cpc: 1.8, comp: 0.45, kd: 38, intent: "informational" },
    { suffix: " software", vol: 4400, cpc: 5.6, comp: 0.88, kd: 71, intent: "commercial" },
    { suffix: " for beginners", vol: 3600, cpc: 1.1, comp: 0.3, kd: 26, intent: "informational" },
    { suffix: " pricing", vol: 2900, cpc: 4.8, comp: 0.78, kd: 49, intent: "transactional" },
    { suffix: " best practices", vol: 2400, cpc: 2.1, comp: 0.4, kd: 42, intent: "informational" },
    { suffix: " agency", vol: 1900, cpc: 7.2, comp: 0.85, kd: 63, intent: "commercial" },
    { suffix: " cost", vol: 1600, cpc: 3.9, comp: 0.6, kd: 45, intent: "transactional" },
    { suffix: " platform", vol: 1300, cpc: 4.5, comp: 0.75, kd: 55, intent: "commercial" },
    { suffix: " vs semrush", vol: 1100, cpc: 3.8, comp: 0.55, kd: 41, intent: "commercial" },
  ];

  return variations.map((v) => ({
    keyword: `${seed}${v.suffix}`,
    search_volume: v.vol,
    cpc: v.cpc,
    competition: v.comp,
    keyword_difficulty: v.kd,
    search_intent_info: {
      main_intent: v.intent,
    },
  }));
}

export async function searchKeywords(params: {
  projectId: string;
  userId?: string | null;
  seedKeyword: string;
  locationCode?: number;
  languageCode?: string;
  customApiKey?: string;
}) {
  const {
    projectId,
    userId,
    seedKeyword,
    locationCode = 2840,
    languageCode = "en",
    customApiKey,
  } = params;

  if (!projectId) {
    throw new Error("projectId is required");
  }
  if (!seedKeyword || seedKeyword.trim().length === 0) {
    throw new Error("seedKeyword cannot be empty");
  }

  // Record the search entry
  const searchRecord = await keywordRepo.insertKeywordSearch({
    projectId,
    seedKeyword,
    locationCode,
    languageCode,
  });

  const env = getEnv();
  const apiKey = customApiKey || env.DATAFORSEO_API_KEY;

  let keywordItems: DataForSEOKeywordItem[] = [];

  if (apiKey) {
    const endpoint = "keywords_data/google/keywords_for_keywords/live";
    const payload = [
      {
        keywords: [seedKeyword.trim()],
        location_code: locationCode,
        language_code: languageCode,
        include_serp_info: false,
        limit: 100,
      },
    ];

    const response = await executeDataForSEOQuery<DataForSEOKeywordItem>(endpoint, payload, {
      projectId,
      userId,
      customApiKey,
    });

    const task = response.tasks?.[0];
    if (task?.result && Array.isArray(task.result)) {
      keywordItems = task.result;
    }
  } else if (process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "test") {
    // Demo / test mode: generate structured realistic suggestions
    keywordItems = generateDevKeywordFixtures(seedKeyword);
  } else {
    throw new Error(
      "DataForSEO credentials are required. Please configure DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD or provide a custom API key in settings."
    );
  }

  // Format and save keywords
  const createItems = keywordItems.map((item) => {
    const rawIntent = item.search_intent_info?.main_intent?.toLowerCase();
    const intent: SearchIntent =
      rawIntent === "transactional" ||
      rawIntent === "commercial" ||
      rawIntent === "navigational" ||
      rawIntent === "informational"
        ? (rawIntent as SearchIntent)
        : detectSearchIntent(item.keyword);

    return {
      searchId: searchRecord.id,
      projectId,
      keyword: item.keyword,
      searchVolume: item.search_volume ?? 0,
      cpc: Number(item.cpc ?? 0),
      competition: Number(item.competition ?? 0),
      keywordDifficulty: item.keyword_difficulty ?? null,
      intent,
      rawDataJson: JSON.stringify(item),
    };
  });

  await keywordRepo.insertKeywords(createItems);

  const keywords = await keywordRepo.getKeywordsBySearchId(searchRecord.id, projectId);

  return {
    search: searchRecord,
    keywords,
  };
}

export async function getKeywordsForSearch(searchId: string, projectId: string) {
  return await keywordRepo.getKeywordsBySearchId(searchId, projectId);
}

export async function getRecentKeywordSearches(projectId: string, limit = 5) {
  return await keywordRepo.getLatestKeywordSearches(projectId, limit);
}
