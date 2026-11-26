import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("SEO Routes (sitemap and robots)", () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://custom.neemseo.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it("generates sitemap with custom base url including docs and health", () => {
    const map = sitemap();
    const urls = map.map((entry) => entry.url);

    expect(urls).toContain("https://custom.neemseo.com");
    expect(urls).toContain("https://custom.neemseo.com/docs");
    expect(urls).toContain("https://custom.neemseo.com/health");
    expect(urls).toContain("https://custom.neemseo.com/login");
    expect(urls).toContain("https://custom.neemseo.com/register");
  });

  it("generates robots with host and dynamic sitemap", () => {
    const rob = robots();
    expect(rob.host).toBe("https://custom.neemseo.com");
    expect(rob.sitemap).toBe("https://custom.neemseo.com/sitemap.xml");
  });
});
