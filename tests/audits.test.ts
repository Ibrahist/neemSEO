import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditsService } from "@/features/audits/service";
import { AuditsRepository } from "@/features/audits/repository";

describe("AuditsService", () => {
  let mockRepo: AuditsRepository;
  let service: AuditsService;

  beforeEach(() => {
    mockRepo = new AuditsRepository();
    vi.spyOn(mockRepo, "createAudit").mockImplementation(async (data) => ({
      ...data,
      pagesCrawled: 0,
      healthScore: 100,
      completedAt: null,
    }));
    vi.spyOn(mockRepo, "updateAudit").mockResolvedValue();
    vi.spyOn(mockRepo, "saveCrawledPages").mockResolvedValue();
    vi.spyOn(mockRepo, "saveAuditIssues").mockResolvedValue();

    service = new AuditsService(mockRepo);
  });

  it("executes an audit run and returns health score with ranked issues", async () => {
    const summary = await service.runAudit("proj_1", "https://example.com", 5);

    expect(summary).toBeDefined();
    expect(summary.audit.status).toBe("completed");
    expect(summary.audit.projectId).toBe("proj_1");
    expect(summary.audit.healthScore).toBeGreaterThanOrEqual(0);
    expect(summary.audit.healthScore).toBeLessThanOrEqual(100);
    expect(summary.pages.length).toBeGreaterThan(0);
  });

  it("retrieves audit issues scoped by severity", async () => {
    vi.spyOn(mockRepo, "listAuditIssues").mockResolvedValue([
      {
        id: "issue_1",
        auditId: "audit_1",
        projectId: "proj_1",
        pageId: "page_1",
        issueType: "missing_title",
        severity: "critical",
        message: "Missing title",
        recommendation: "Add title",
        createdAt: new Date(),
      },
    ]);

    const issues = await service.getAuditIssues("proj_1", "audit_1", "critical");
    expect(issues.length).toBe(1);
    expect(issues[0].severity).toBe("critical");
  });

  it("retrieves latest audit summary for a project", async () => {
    vi.spyOn(mockRepo, "getLatestAudit").mockResolvedValue({
      id: "audit_latest",
      projectId: "proj_1",
      startUrl: "https://example.com",
      status: "completed",
      pagesCrawled: 4,
      healthScore: 92,
      startedAt: new Date(),
      completedAt: new Date(),
    });
    vi.spyOn(mockRepo, "listCrawledPages").mockResolvedValue([]);
    vi.spyOn(mockRepo, "listAuditIssues").mockResolvedValue([]);

    const summary = await service.getLatestAuditSummary("proj_1");
    expect(summary).not.toBeNull();
    expect(summary?.audit.id).toBe("audit_latest");
    expect(summary?.audit.healthScore).toBe(92);
  });
});
