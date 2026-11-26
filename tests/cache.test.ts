import { describe, it, expect } from "vitest";
import { hashRequest, stableStringify } from "@/features/cache/service";

describe("Cache Service & Request Hashing", () => {
  it("should produce deterministic SHA-256 hashes with v2 prefix regardless of JSON key order", () => {
    const endpoint = "keywords_data/google/search_volume/live";
    const payloadA = { keyword: "seo audit", location_code: 2840, language_code: "en" };
    const payloadB = { language_code: "en", location_code: 2840, keyword: "seo audit" };

    const hashA = hashRequest(endpoint, payloadA);
    const hashB = hashRequest(endpoint, payloadB);

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^v2:[a-f0-9]{64}$/);
  });

  it("should produce different hashes for different endpoints", () => {
    const payload = { keyword: "seo audit" };
    const hashA = hashRequest("endpoint_1", payload);
    const hashB = hashRequest("endpoint_2", payload);

    expect(hashA).not.toBe(hashB);
  });

  it("should preserve nested object keys and differentiate nested variations (fixes collision bug)", () => {
    const endpoint = "keywords_data/google/search_volume/live";
    const payload1 = { target: { keyword: "pizza", location: "US" } };
    const payload2 = { target: { keyword: "running shoes", location: "DE" } };

    const hash1 = hashRequest(endpoint, payload1);
    const hash2 = hashRequest(endpoint, payload2);

    expect(hash1).not.toBe(hash2);
    expect(stableStringify(payload1)).toContain("pizza");
    expect(stableStringify(payload2)).toContain("running shoes");
  });

  it("should preserve array elements and ordering correctly", () => {
    const endpoint = "backlinks/summary/live";
    const payload1 = [{ target: "a.com" }];
    const payload2 = [{ target: "b.com" }];

    const hash1 = hashRequest(endpoint, payload1);
    const hash2 = hashRequest(endpoint, payload2);

    expect(hash1).not.toBe(hash2);
  });
});
