import "server-only";
import { parse } from "tldts";
import {
  AuditsRepository,
  SiteAuditRecord,
  CrawledPageRecord,
  AuditIssueRecord,
} from "./repository";
import { safeFetch } from "@/lib/crawler/ssrf";
import { getRobotsTxt } from "@/lib/crawler/robots";
import { parseHtmlPage, calculateHealthScore } from "@/lib/crawler/parser";

export interface AuditSummary {
  audit: SiteAuditRecord;
  pages: CrawledPageRecord[];
  issues: AuditIssueRecord[];
}

export class AuditsService {
  constructor(private repo = new AuditsRepository()) {}

  async listAudits(projectId: string) {
    return this.repo.listAudits(projectId);
  }

  async runAudit(projectId: string, startUrl: string, maxPages = 15): Promise<AuditSummary> {
    const auditId = `audit_${crypto.randomUUID()}`;
    const parsedStart = new URL(startUrl);
    const startDomain = parse(parsedStart.hostname).domain || parsedStart.hostname;

    // 1. Create initial audit record
    let audit = await this.repo.createAudit({
      id: auditId,
      projectId,
      startUrl,
      status: "crawling",
      startedAt: new Date(),
    });

    const queue: string[] = [startUrl];
    const visited = new Set<string>();
    const crawledPages: CrawledPageRecord[] = [];
    const auditIssues: AuditIssueRecord[] = [];

    // Enforce overall time budget: 45 seconds max
    const MAX_AUDIT_TIME_MS = 45_000;
    const startTime = Date.now();

    try {
      // 2. Fetch robots.txt if reachable
      const robots = await getRobotsTxt(startUrl);
      const crawlDelaySeconds = robots.crawlDelay || 0;
      const crawlDelayMs = Math.min(crawlDelaySeconds * 1000, 3000);

      while (
        queue.length > 0 &&
        visited.size < maxPages &&
        Date.now() - startTime < MAX_AUDIT_TIME_MS
      ) {
        const currentUrl = queue.shift()!;
        if (visited.has(currentUrl)) continue;
        visited.add(currentUrl);

        // Enforce robots.txt crawl-delay between requests
        if (crawlDelayMs > 0 && visited.size > 1) {
          await new Promise((r) => setTimeout(r, crawlDelayMs));
        }

        // Check robots.txt rules
        if (!robots.isAllowed(currentUrl)) {
          const pageId = `page_${crypto.randomUUID()}`;
          crawledPages.push({
            id: pageId,
            auditId,
            projectId,
            url: currentUrl,
            statusCode: 403,
            title: null,
            metaDescription: null,
            h1: null,
            canonicalUrl: null,
            isIndexable: false,
            loadTimeMs: 0,
            createdAt: new Date(),
          });

          auditIssues.push({
            id: `issue_${crypto.randomUUID()}`,
            auditId,
            projectId,
            pageId,
            issueType: "blocked_by_robots",
            severity: "warning",
            message: `URL is disallowed by robots.txt rules.`,
            recommendation: "Review robots.txt disallow directives if this page should be crawled.",
            createdAt: new Date(),
          });
          continue;
        }

        try {
          const fetchRes = await safeFetch(currentUrl, { timeoutMs: 8_000 });
          const parsed = parseHtmlPage(
            currentUrl,
            fetchRes.status,
            fetchRes.body,
            fetchRes.loadTimeMs,
            fetchRes.headers
          );

          const pageId = `page_${crypto.randomUUID()}`;
          crawledPages.push({
            id: pageId,
            auditId,
            projectId,
            url: currentUrl,
            statusCode: parsed.statusCode,
            title: parsed.title,
            metaDescription: parsed.metaDescription,
            h1: parsed.h1,
            canonicalUrl: parsed.canonicalUrl,
            isIndexable: parsed.isIndexable,
            loadTimeMs: parsed.loadTimeMs,
            createdAt: new Date(),
          });

          for (const issue of parsed.issues) {
            auditIssues.push({
              id: `issue_${crypto.randomUUID()}`,
              auditId,
              projectId,
              pageId,
              issueType: issue.issueType,
              severity: issue.severity,
              message: issue.message,
              recommendation: issue.recommendation,
              createdAt: new Date(),
            });
          }

          // Enqueue discovered internal links
          for (const link of parsed.links) {
            try {
              const linkUrl = new URL(link);
              const linkDomain = parse(linkUrl.hostname).domain || linkUrl.hostname;

              // Only stay within same target domain
              if (linkDomain === startDomain && !visited.has(link) && !queue.includes(link)) {
                queue.push(link);
              }
            } catch {
              // Ignore invalid link URLs
            }
          }
        } catch (fetchErr: unknown) {
          const pageId = `page_${crypto.randomUUID()}`;
          const errMsg = fetchErr instanceof Error ? fetchErr.message : "Fetch failed";

          crawledPages.push({
            id: pageId,
            auditId,
            projectId,
            url: currentUrl,
            statusCode: 0,
            title: null,
            metaDescription: null,
            h1: null,
            canonicalUrl: null,
            isIndexable: false,
            loadTimeMs: 0,
            createdAt: new Date(),
          });

          auditIssues.push({
            id: `issue_${crypto.randomUUID()}`,
            auditId,
            projectId,
            pageId,
            issueType: "fetch_failed",
            severity: "critical",
            message: `Could not crawl page: ${errMsg}`,
            recommendation:
              "Verify page URL accessibility, DNS settings, and network reachability.",
            createdAt: new Date(),
          });
        }
      }

      if (crawledPages.length === 0) {
        await this.repo.updateAudit(projectId, auditId, {
          status: "failed",
          pagesCrawled: 0,
          completedAt: new Date(),
        });
        throw new Error(`Audit failed: unable to crawl start URL ${startUrl}`);
      }

      const healthScore = calculateHealthScore(
        crawledPages.length,
        auditIssues as { severity: "critical" | "warning" | "info" }[]
      );

      // Persist crawled pages and issues
      await this.repo.saveCrawledPages(crawledPages);
      await this.repo.saveAuditIssues(auditIssues);

      await this.repo.updateAudit(projectId, auditId, {
        status: "completed",
        pagesCrawled: crawledPages.length,
        healthScore,
        completedAt: new Date(),
      });

      audit = {
        ...audit,
        status: "completed",
        pagesCrawled: crawledPages.length,
        healthScore,
        completedAt: new Date(),
      };

      return {
        audit,
        pages: crawledPages,
        issues: auditIssues,
      };
    } catch (err: unknown) {
      await this.repo
        .updateAudit(projectId, auditId, {
          status: "failed",
          completedAt: new Date(),
        })
        .catch(() => {});
      throw err;
    }
  }

  async getLatestAuditSummary(projectId: string): Promise<AuditSummary | null> {
    const audit = await this.repo.getLatestAudit(projectId);
    if (!audit) return null;

    const [pages, issues] = await Promise.all([
      this.repo.listCrawledPages(projectId, audit.id),
      this.repo.listAuditIssues(projectId, audit.id),
    ]);

    return {
      audit,
      pages,
      issues,
    };
  }

  async getAuditIssues(
    projectId: string,
    auditId: string,
    severity?: "critical" | "warning" | "info"
  ): Promise<AuditIssueRecord[]> {
    return this.repo.listAuditIssues(projectId, auditId, severity);
  }
}
