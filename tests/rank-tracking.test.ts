import { describe, it, expect, vi } from "vitest";
import * as rankService from "@/features/rank-tracking/service";
import * as rankRepo from "@/features/rank-tracking/repository";

describe("Rank Tracking Service", () => {
  it("should add keyword to tracking and return null initialPosition when unconfigured (no random fabrication)", async () => {
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
    // Without DataForSEO key, position is null ("not in top 100"), never a random fabricated number
    expect(result.initialPosition).toBeNull();

    spyInsertTracked.mockRestore();
    spyInsertSnapshot.mockRestore();
  });
});
