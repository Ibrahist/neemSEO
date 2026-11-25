import { describe, it, expect, vi } from "vitest";
import * as rankService from "@/features/rank-tracking/service";
import * as rankRepo from "@/features/rank-tracking/repository";

describe("Rank Tracking Service", () => {
  it("should add keyword to tracking and capture position snapshot", async () => {
    const mockTracked = {
      id: "trk_123",
      projectId: "proj_1",
      keyword: "open source seo",
      targetDomain: "neemseo.com",
      locationCode: 2840,
      languageCode: "en",
      tags: "core",
      isActive: true,
      createdAt: new Date(),
    };

    const spyInsertTracked = vi
      .spyOn(rankRepo, "insertTrackedKeyword")
      .mockResolvedValue(mockTracked);
    const spyInsertSnapshot = vi.spyOn(rankRepo, "insertRankSnapshot").mockResolvedValue(undefined);

    const result = await rankService.trackKeyword({
      projectId: "proj_1",
      keyword: "open source seo",
      targetDomain: "neemseo.com",
      tags: "core",
    });

    expect(spyInsertTracked).toHaveBeenCalled();
    expect(spyInsertSnapshot).toHaveBeenCalled();
    expect(result.trackedKeyword.keyword).toBe("open source seo");
    expect(result.initialPosition).toBeGreaterThan(0);

    spyInsertTracked.mockRestore();
    spyInsertSnapshot.mockRestore();
  });
});
