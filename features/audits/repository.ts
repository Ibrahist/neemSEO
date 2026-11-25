import "server-only";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db/client";

export interface SiteAuditRecord {
  id: string;
  projectId: string;
  startUrl: string;
  status: string;
  pagesCrawled: number;
  healthScore: number;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface CrawledPageRecord {
  id: string;
  auditId: string;
  projectId: string;
  url: string;
  statusCode: number | null;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonicalUrl: string | null;
  isIndexable: boolean;
  loadTimeMs: number;
  createdAt: Date;
}

export interface AuditIssueRecord {
  id: string;
  auditId: string;
  projectId: string;
  pageId: string | null;
  issueType: string;
  severity: string;
  message: string;
  recommendation: string | null;
  createdAt: Date;
}

export class AuditsRepository {
  async createAudit(
    audit: Omit<SiteAuditRecord, "pagesCrawled" | "healthScore" | "completedAt">
  ): Promise<SiteAuditRecord> {
    const { db, schema } = await getDb();

    const newAudit = {
      ...audit,
      pagesCrawled: 0,
      healthScore: 100,
      completedAt: null,
    };

    await (db as any).insert(schema.siteAudits).values(newAudit);
    return newAudit;
  }

  async updateAudit(
    projectId: string,
    auditId: string,
    updates: Partial<
      Pick<SiteAuditRecord, "status" | "pagesCrawled" | "healthScore" | "completedAt">
    >
  ): Promise<void> {
    const { db, schema } = await getDb();

    await (db as any)
      .update(schema.siteAudits)
      .set(updates)
      .where(and(eq(schema.siteAudits.id, auditId), eq(schema.siteAudits.projectId, projectId)));
  }

  async getAuditById(projectId: string, auditId: string): Promise<SiteAuditRecord | null> {
    const { db, schema } = await getDb();

    const rows = await (db as any)
      .select()
      .from(schema.siteAudits)
      .where(and(eq(schema.siteAudits.id, auditId), eq(schema.siteAudits.projectId, projectId)))
      .limit(1);

    return (rows[0] as SiteAuditRecord) ?? null;
  }

  async getLatestAudit(projectId: string): Promise<SiteAuditRecord | null> {
    const { db, schema } = await getDb();

    const rows = await (db as any)
      .select()
      .from(schema.siteAudits)
      .where(eq(schema.siteAudits.projectId, projectId))
      .orderBy(desc(schema.siteAudits.startedAt))
      .limit(1);

    return (rows[0] as SiteAuditRecord) ?? null;
  }

  async listAudits(projectId: string, limit = 10): Promise<SiteAuditRecord[]> {
    const { db, schema } = await getDb();

    const rows = await (db as any)
      .select()
      .from(schema.siteAudits)
      .where(eq(schema.siteAudits.projectId, projectId))
      .orderBy(desc(schema.siteAudits.startedAt))
      .limit(limit);

    return rows as SiteAuditRecord[];
  }

  async saveCrawledPages(pages: CrawledPageRecord[]): Promise<void> {
    if (pages.length === 0) return;
    const { db, schema } = await getDb();

    await (db as any).insert(schema.crawledPages).values(pages);
  }

  async listCrawledPages(projectId: string, auditId: string): Promise<CrawledPageRecord[]> {
    const { db, schema } = await getDb();

    const rows = await (db as any)
      .select()
      .from(schema.crawledPages)
      .where(
        and(eq(schema.crawledPages.auditId, auditId), eq(schema.crawledPages.projectId, projectId))
      )
      .limit(100);

    return rows as CrawledPageRecord[];
  }

  async saveAuditIssues(issues: AuditIssueRecord[]): Promise<void> {
    if (issues.length === 0) return;
    const { db, schema } = await getDb();

    await (db as any).insert(schema.auditIssues).values(issues);
  }

  async listAuditIssues(
    projectId: string,
    auditId: string,
    severity?: string
  ): Promise<AuditIssueRecord[]> {
    const { db, schema } = await getDb();

    const conditions = [
      eq(schema.auditIssues.auditId, auditId),
      eq(schema.auditIssues.projectId, projectId),
    ];

    if (severity) {
      conditions.push(eq(schema.auditIssues.severity, severity));
    }

    const rows = await (db as any)
      .select()
      .from(schema.auditIssues)
      .where(and(...conditions))
      .limit(200);

    return rows as AuditIssueRecord[];
  }
}
