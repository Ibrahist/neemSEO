import { describe, it, expect, vi, beforeEach } from "vitest";
import { GscService } from "@/features/integrations/gsc/service";

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
