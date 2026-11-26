import { describe, it, expect, vi, beforeEach } from "vitest";
import { AiVisibilityService } from "@/features/ai-visibility/service";
import { AiVisibilityRepository } from "@/features/ai-visibility/repository";

describe("AiVisibilityService", () => {
  let mockRepo: AiVisibilityRepository;
  let service: AiVisibilityService;

  beforeEach(() => {
    process.env.DEMO_MODE = "true";
    mockRepo = new AiVisibilityRepository();
    vi.spyOn(mockRepo, "savePrompt").mockResolvedValue();
    vi.spyOn(mockRepo, "saveResults").mockResolvedValue();

    service = new AiVisibilityService(mockRepo);
  });

  it("checks prompt visibility across AI engines and evaluates brand mentions and citations", async () => {
    const res = await service.checkPromptVisibility({
      projectId: "proj_1",
      prompt: "What is the best SEO platform for developers?",
      brandName: "neemSEO",
      targetDomain: "neemseo.com",
      engines: ["chatgpt", "claude"],
    });

    expect(res.prompt).toBeDefined();
    expect(res.prompt.brandName).toBe("neemSEO");
    expect(res.prompt.targetDomain).toBe("neemseo.com");
    expect(res.results.length).toBe(2);

    for (const r of res.results) {
      expect(["chatgpt", "claude"]).toContain(r.engine);
      expect(typeof r.isBrandMentioned).toBe("boolean");
      expect(typeof r.isDomainCited).toBe("boolean");
      expect(r.responseText.length).toBeGreaterThan(0);
    }
  });

  it("calculates visibility summary metrics across prompts and engines", async () => {
    vi.spyOn(mockRepo, "listPrompts").mockResolvedValue([
      {
        id: "p1",
        projectId: "proj_1",
        prompt: "best seo tool",
        brandName: "neemSEO",
        targetDomain: "neemseo.com",
        createdAt: new Date(),
      },
    ]);

    vi.spyOn(mockRepo, "listResultsForProject").mockResolvedValue([
      {
        id: "r1",
        promptId: "p1",
        projectId: "proj_1",
        engine: "chatgpt",
        responseText: "neemSEO is great at neemseo.com",
        isBrandMentioned: true,
        isDomainCited: true,
        citationUrlsJson: JSON.stringify(["https://neemseo.com"]),
        checkedAt: new Date(),
      },
    ]);

    const summary = await service.getVisibilitySummary("proj_1");
    expect(summary.totalPrompts).toBe(1);
    expect(summary.totalChecks).toBe(1);
    expect(summary.brandMentionRate).toBe(100);
    expect(summary.domainCitationRate).toBe(100);
  });
});
