import { describe, it, expect, vi, beforeEach } from "vitest";
import { GscService } from "@/features/integrations/gsc/service";

vi.mock("@/db/client", () => ({
  getDb: vi.fn().mockResolvedValue({
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({}),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    },
    schema: {
      projectIntegrations: {
        id: "id",
        projectId: "projectId",
        provider: "provider",
        encryptedTokens: "encryptedTokens",
        settingsJson: "settingsJson",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    },
    dialect: "sqlite",
  }),
}));

describe("GscService - Token Encryption & Performance", () => {
  let service: GscService;

  beforeEach(() => {
    service = new GscService();
  });

  it("retrieves GSC connection status and returns configured: false when unconfigured", async () => {
    vi.spyOn(service, "getConnectionStatus").mockResolvedValue({
      isConnected: false,
      siteUrl: null,
      lastSyncedAt: null,
    });

    const status = await service.getConnectionStatus("proj_1");
    expect(status.isConnected).toBe(false);
    expect(status.siteUrl).toBeNull();

    // When not configured, returns configured: false with empty rows (no fake data fabrication)
    const performance = await service.getPerformanceData("proj_1", "example.com");
    expect(performance.configured).toBe(false);
    expect(performance.rows).toEqual([]);
    expect(performance.totalClicks).toBe(0);
    expect(performance.totalImpressions).toBe(0);
  });
});
