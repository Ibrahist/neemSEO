import { describe, it, expect, vi } from "vitest";
import { detectSearchIntent, searchKeywords } from "@/features/keywords/service";
import * as keywordRepo from "@/features/keywords/repository";
import Papa from "papaparse";

describe("Keyword Service & Intent Classification", () => {
  it("should classify transactional search intents accurately", () => {
    expect(detectSearchIntent("buy seo software")).toBe("transactional");
    expect(detectSearchIntent("ahrefs pricing plans")).toBe("transactional");
    expect(detectSearchIntent("cheap backlink tool order")).toBe("transactional");
  });

  it("should classify commercial investigation intents accurately", () => {
    expect(detectSearchIntent("best seo tools for small business")).toBe("commercial");
    expect(detectSearchIntent("semrush vs ahrefs comparison")).toBe("commercial");
    expect(detectSearchIntent("neemseo review")).toBe("commercial");
  });

  it("should classify navigational intents accurately", () => {
    expect(detectSearchIntent("dataforseo login portal")).toBe("navigational");
    expect(detectSearchIntent("google search console sign in")).toBe("navigational");
  });

  it("should default to informational intents for informational queries", () => {
    expect(detectSearchIntent("how to do a site audit")).toBe("informational");
    expect(detectSearchIntent("what is keyword difficulty")).toBe("informational");
  });

  it("should execute search and store keywords in repository", async () => {
    const mockSearch = {
      id: "search_123",
      projectId: "proj_abc",
      seedKeyword: "seo audit",
      locationCode: 2840,
      languageCode: "en",
      createdAt: new Date(),
    };

    const mockKeywords = [
      {
        id: "kw_1",
        searchId: "search_123",
        projectId: "proj_abc",
        keyword: "seo audit",
        searchVolume: 18100,
        cpc: 2.45,
        competition: 0.72,
        keywordDifficulty: 65,
        intent: "informational" as const,
        rawDataJson: null,
        updatedAt: new Date(),
      },
    ];

    const spyInsertSearch = vi
      .spyOn(keywordRepo, "insertKeywordSearch")
      .mockResolvedValue(mockSearch as any);
    const spyInsertKeywords = vi.spyOn(keywordRepo, "insertKeywords").mockResolvedValue(undefined);
    const spyGetKeywords = vi
      .spyOn(keywordRepo, "getKeywordsBySearchId")
      .mockResolvedValue(mockKeywords as any);

    const result = await searchKeywords({
      projectId: "proj_abc",
      seedKeyword: "seo audit",
    });

    expect(spyInsertSearch).toHaveBeenCalled();
    expect(spyInsertKeywords).toHaveBeenCalled();
    expect(spyGetKeywords).toHaveBeenCalled();
    expect(result.keywords.length).toBeGreaterThan(0);
    expect(result.search.seedKeyword).toBe("seo audit");

    spyInsertSearch.mockRestore();
    spyInsertKeywords.mockRestore();
    spyGetKeywords.mockRestore();
  });

  it("should generate valid CSV structure", () => {
    const sample = [
      {
        Keyword: "seo audit",
        "Search Volume": 18100,
        "Keyword Difficulty (KD)": 65,
        "Cost Per Click (USD)": "2.45",
        Competition: "0.72",
        Intent: "informational",
      },
    ];

    const csv = Papa.unparse(sample);
    expect(csv).toContain(
      "Keyword,Search Volume,Keyword Difficulty (KD),Cost Per Click (USD),Competition,Intent"
    );
    expect(csv).toContain("seo audit,18100,65,2.45,0.72,informational");
  });
});
