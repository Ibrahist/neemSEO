import { describe, it, expect, vi, beforeEach } from "vitest";
import * as cacheService from "@/features/cache/service";
import * as usageService from "@/features/usage/service";
import { executeDataForSEOQuery } from "@/lib/dataforseo/client";

describe("DataForSEO Client Execution & Caching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return cached response without calling fetch when cache exists", async () => {
    const cachedData = {
      version: "0.1.0",
      status_code: 20000,
      status_message: "Ok",
      time: "0.01",
      cost: 0,
      tasks_count: 1,
      tasks_error: 0,
      tasks: [
        {
          id: "mock-task",
          status_code: 20000,
          status_message: "Ok",
          time: "0.01",
          cost: 0,
          result_count: 1,
          path: [],
          data: {},
          result: [],
        },
      ],
    };

    const spyCache = vi.spyOn(cacheService, "getFromCache").mockResolvedValue(cachedData as any);
    const spyUsage = vi.spyOn(usageService, "logUsage").mockResolvedValue(undefined as any);
    const spyFetch = vi.spyOn(globalThis, "fetch");

    const result = await executeDataForSEOQuery(
      "keywords_data/google/search_volume/live",
      [{ keyword: "test" }],
      { projectId: "proj_test" }
    );

    expect(spyCache).toHaveBeenCalled();
    expect(spyFetch).not.toHaveBeenCalled();
    expect(spyUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "proj_test",
        costUsd: 0,
        creditsUsed: 0,
      })
    );
    expect(result).toEqual(cachedData);

    spyCache.mockRestore();
    spyUsage.mockRestore();
    spyFetch.mockRestore();
  });

  it("should throw error if projectId is missing", async () => {
    await expect(
      executeDataForSEOQuery("keywords_data/google/search_volume/live", [], { projectId: "" })
    ).rejects.toThrow("A projectId is required");
  });
});
