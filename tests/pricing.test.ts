import { describe, it, expect } from "vitest";
import { estimateQueryCost, DATAFORSEO_PRICING } from "@/lib/dataforseo/pricing";

describe("DataForSEO Pricing Schedule", () => {
  it("should estimate cost correctly for keyword search volume", () => {
    const cost = estimateQueryCost("keywords_data/google/search_volume/live", 100);
    // Base $0.002 + (100 * $0.00005) = $0.007
    expect(cost).toBe(0.007);
  });

  it("should return base cost for flat-rate endpoints", () => {
    const cost = estimateQueryCost("keywords_data/google/keywords_for_keywords/live");
    expect(cost).toBe(0.01);
  });

  it("should provide safe conservative estimate for unknown endpoints", () => {
    const cost = estimateQueryCost("unknown/endpoint/test");
    expect(cost).toBe(0.01);
  });

  it("should have pricing rules configured for core workflows", () => {
    expect(DATAFORSEO_PRICING["keywords_data/google/search_volume/live"]).toBeDefined();
    expect(DATAFORSEO_PRICING["serp/google/organic/live/advanced"]).toBeDefined();
    expect(DATAFORSEO_PRICING["dataforseo_labs/google/ranked_keywords/live"]).toBeDefined();
    expect(DATAFORSEO_PRICING["backlinks/summary/live"]).toBeDefined();
  });
});
