import { describe, it, expect, vi } from "vitest";
import * as backlinkService from "@/features/backlinks/service";
import * as backlinkRepo from "@/features/backlinks/repository";
import { refreshBacklinksAction } from "@/features/backlinks/actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireAuth: vi
    .fn()
    .mockResolvedValue({ id: "user_1", email: "user@example.com", organizationId: "org_1" }),
  requireProjectAccess: vi.fn().mockResolvedValue({
    user: { id: "user_1", email: "user@example.com", organizationId: "org_1" },
    project: { id: "proj_1", name: "neemSEO", domain: "neemseo.com", organizationId: "org_1" },
  }),
}));

describe("Backlinks Service & Actions", () => {
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

  it("should retrieve and snapshot backlinks overview with anchors and trend", async () => {
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

    expect(result.snapshot?.domain).toBe("neemseo.com");
    expect(result.referringDomains[0].referringDomain).toBe("github.com");
    // Without API key, no fabricated fake anchors or fake sin/cos trend
    expect(result.anchors).toEqual([]);
    expect(result.newLostTrend).toEqual([]);

    spyGetLatest.mockRestore();
    spyGetRef.mockRestore();
  });

  it("should execute refreshBacklinksAction and return success", async () => {
    const spyGetLatest = vi
      .spyOn(backlinkRepo, "getLatestBacklinkSnapshot")
      .mockResolvedValue(mockSnapshot);
    const spyGetRef = vi.spyOn(backlinkRepo, "getReferringDomains").mockResolvedValue([]);

    const res = await refreshBacklinksAction({
      projectId: "proj_1",
      domain: "neemseo.com",
    });

    expect(res.success).toBe(true);
    expect(res.data.snapshot?.domain).toBe("neemseo.com");

    spyGetLatest.mockRestore();
    spyGetRef.mockRestore();
  });
});
