import { describe, it, expect } from "vitest";
import { hashRequest } from "@/features/cache/service";

describe("Cache Service & Request Hashing", () => {
  it("should produce deterministic SHA-256 hashes regardless of JSON key order", () => {
    const endpoint = "keywords_data/google/search_volume/live";
    const payloadA = { keyword: "seo audit", location_code: 2840, language_code: "en" };
    const payloadB = { language_code: "en", location_code: 2840, keyword: "seo audit" };

    const hashA = hashRequest(endpoint, payloadA);
    const hashB = hashRequest(endpoint, payloadB);

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should produce different hashes for different endpoints", () => {
    const payload = { keyword: "seo audit" };
    const hashA = hashRequest("endpoint_1", payload);
    const hashB = hashRequest("endpoint_2", payload);

    expect(hashA).not.toBe(hashB);
  });
});
