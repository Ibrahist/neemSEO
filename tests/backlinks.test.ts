import { describe, it, expect, vi } from "vitest";
import * as backlinkService from "@/features/backlinks/service";
import * as backlinkRepo from "@/features/backlinks/repository";

describe("Backlinks Service", () => {
  it("should retrieve and snapshot backlinks overview with anchors and trend", async () => {
    const mockSnapshot = {
      id: "blsnap_1",
      projectId: "proj_1",
      domain: "neemseo.com",
      totalBacklinks: 15000,
      referringDomainsCount: 500,
      rank: 45,
      snapshotDate: "2026-11-26",
      createdAt: new Date(),
    };

    const mockReferring = [
      {
        id: "ref_1",
        projectId: "proj_1",
        targetDomain: "neemseo.com",
        referringDomain: "github.com",
        backlinksCount: 120,
        rank: 95,
        firstSeen: "2024-01-01",
        lastSeen: "2026-11-26",
      },
    ];

    const spyGetLatest = vi
      .spyOn(backlinkRepo, "getLatestBacklinkSnapshot")
      .mockResolvedValue(mockSnapshot);
    const spyGetRef = vi
      .spyOn(backlinkRepo, "getReferringDomains")
      .mockResolvedValue(mockReferring);

    const result = await backlinkService.getBacklinksOverview({
      projectId: "proj_1",
      domain: "neemseo.com",
    });

    expect(result.snapshot.domain).toBe("neemseo.com");
    expect(result.referringDomains[0].referringDomain).toBe("github.com");
    expect(result.anchors.length).toBeGreaterThan(0);
    expect(result.anchors[0].anchor).toBe("neemseo.com");
    expect(result.newLostTrend.length).toBe(14);

    spyGetLatest.mockRestore();
    spyGetRef.mockRestore();
  });
});
