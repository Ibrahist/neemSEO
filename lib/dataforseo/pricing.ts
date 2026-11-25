/**
 * DataForSEO Endpoint Pricing Schedule & Cost Estimator.
 * Costs are defined in USD per item or per task according to official DataForSEO pricing.
 */

export interface PricingRule {
  endpoint: string;
  costPerRequest: number; // Flat cost per call in USD
  costPerItem?: number; // Additional cost per returned item
  description: string;
}

export const DATAFORSEO_PRICING: Record<string, PricingRule> = {
  // Keywords Data API
  "keywords_data/google/search_volume/live": {
    endpoint: "keywords_data/google/search_volume/live",
    costPerRequest: 0.002, // $0.002 per request (up to 700 keywords)
    costPerItem: 0.00005,
    description: "Google Keyword Search Volume (Live)",
  },
  "keywords_data/google/keywords_for_keywords/live": {
    endpoint: "keywords_data/google/keywords_for_keywords/live",
    costPerRequest: 0.01, // $0.01 per search
    description: "Related Keywords & Suggestions",
  },
  "keywords_data/google/keyword_performance/live": {
    endpoint: "keywords_data/google/keyword_performance/live",
    costPerRequest: 0.005,
    description: "Historical Keyword Performance & CPC",
  },

  // SERP API (Rank Tracking)
  "serp/google/organic/live/advanced": {
    endpoint: "serp/google/organic/live/advanced",
    costPerRequest: 0.002, // $0.002 per live SERP query
    description: "Live SERP Rank Check (Advanced)",
  },

  // DataForSEO Labs (Competitor Insights & Keyword Gap)
  "dataforseo_labs/google/ranked_keywords/live": {
    endpoint: "dataforseo_labs/google/ranked_keywords/live",
    costPerRequest: 0.01,
    description: "Domain Ranked Keywords",
  },
  "dataforseo_labs/google/domain_intersection/live": {
    endpoint: "dataforseo_labs/google/domain_intersection/live",
    costPerRequest: 0.02,
    description: "Competitor Keyword Gap / Intersection",
  },
  "dataforseo_labs/google/competitors_domain/live": {
    endpoint: "dataforseo_labs/google/competitors_domain/live",
    costPerRequest: 0.01,
    description: "Competitor Domain Discovery",
  },

  // Backlinks API
  "backlinks/summary/live": {
    endpoint: "backlinks/summary/live",
    costPerRequest: 0.02,
    description: "Backlinks Domain Overview & Summary",
  },
  "backlinks/backlinks/live": {
    endpoint: "backlinks/backlinks/live",
    costPerRequest: 0.02,
    costPerItem: 0.0001,
    description: "Referring Pages & Backlinks List",
  },
  "backlinks/referring_domains/live": {
    endpoint: "backlinks/referring_domains/live",
    costPerRequest: 0.02,
    description: "Referring Domains List",
  },
  "backlinks/anchors/live": {
    endpoint: "backlinks/anchors/live",
    costPerRequest: 0.02,
    description: "Backlinks Anchor Text Distribution",
  },
};

/**
 * Estimates the DataForSEO API cost before executing an outbound request.
 */
export function estimateQueryCost(endpoint: string, itemCount = 1): number {
  const rule = DATAFORSEO_PRICING[endpoint];
  if (!rule) {
    // Default safe conservative fallback ($0.01 per unknown call)
    return 0.01;
  }

  const baseCost = rule.costPerRequest;
  const itemCost = rule.costPerItem ? rule.costPerItem * Math.max(0, itemCount) : 0;
  const total = baseCost + itemCost;

  // Round to 5 decimal places for currency precision
  return Math.round(total * 100000) / 100000;
}
