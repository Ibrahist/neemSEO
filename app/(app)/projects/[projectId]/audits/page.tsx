import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { AuditsService } from "@/features/audits/service";
import { StartAuditForm } from "@/components/audits/start-audit-form";
import { AuditHealthCard } from "@/components/audits/audit-health-card";
import { AuditIssuesTable } from "@/components/audits/audit-issues-table";
import { CrawledPagesTable } from "@/components/audits/crawled-pages-table";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ShieldCheck } from "lucide-react";

interface AuditsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AuditsPage({ params }: AuditsPageProps) {
  const { projectId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  if (!project) {
    notFound();
  }

  const auditsService = new AuditsService();
  const summary = await auditsService.getLatestAuditSummary(projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Technical Site Audits
          </h1>
          <p className="text-sm text-muted-foreground">
            Full-site crawler checking titles, meta tags, heading hierarchies, status codes,
            canonicals, and indexability.
          </p>
        </div>
      </div>

      <StartAuditForm projectId={projectId} defaultDomain={project.domain} />

      {summary ? (
        <div className="space-y-6">
          <AuditHealthCard audit={summary.audit} issues={summary.issues} />
          <div className="grid grid-cols-1 gap-6">
            <AuditIssuesTable issues={summary.issues} />
            <CrawledPagesTable pages={summary.pages} />
          </div>
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <ShieldCheck className="h-12 w-12 text-primary/60 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No Site Audits Yet</h3>
            <p className="mt-1 max-w-md text-sm">
              Launch a crawl on <strong className="text-foreground">{project.domain}</strong> above
              to identify broken links, crawl errors, and technical SEO bottlenecks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
