import { describe, it, expect, vi } from "vitest";
import * as compService from "@/features/competitors/service";
import * as compRepo from "@/features/competitors/repository";

describe("Competitor Insights Service", () => {
  it("should normalize competitor domain when adding", async () => {
    const mockComp = {
      id: "comp_123",
      projectId: "proj_1",
      competitorDomain: "ahrefs.com",
      createdAt: new Date(),
    };

    const spyInsert = vi.spyOn(compRepo, "insertCompetitorDomain").mockResolvedValue(mockComp);
    const spyMetrics = vi.spyOn(compRepo, "insertCompetitorMetrics").mockResolvedValue(undefined);

    const result = await compService.addCompetitor({
      projectId: "proj_1",
      competitorDomain: "https://AHREFS.com/blog",
    });

    expect(spyInsert).toHaveBeenCalledWith("proj_1", "ahrefs.com");
    expect(result.competitorDomain).toBe("ahrefs.com");

    spyInsert.mockRestore();
    spyMetrics.mockRestore();
  });

  it("should return empty keyword gap opportunities when unconfigured (no fabricated keywords)", async () => {
    const gaps = await compService.getKeywordGap("proj_1", "ahrefs.com");
    expect(gaps).toEqual([]);
  });
});
