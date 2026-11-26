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

  it("retrieves GSC connection status and performance data", async () => {
    vi.spyOn(service, "getConnectionStatus").mockResolvedValue({
      isConnected: true,
      siteUrl: "https://example.com",
      lastSyncedAt: new Date(),
    });

    const status = await service.getConnectionStatus("proj_1");
    expect(status.isConnected).toBe(true);
    expect(status.siteUrl).toBe("https://example.com");

    const performance = await service.getPerformanceData("proj_1", "example.com");
    expect(performance.totalClicks).toBeGreaterThan(0);
    expect(performance.totalImpressions).toBeGreaterThan(0);
    expect(performance.rows.length).toBeGreaterThan(0);
    expect(performance.rows[0].query).toBeDefined();
    expect(performance.rows[0].ctr).toBeGreaterThan(0);
  });
});
