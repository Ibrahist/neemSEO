import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteAuditRecord, AuditIssueRecord } from "@/features/audits/repository";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface AuditHealthCardProps {
  audit: SiteAuditRecord;
  issues: AuditIssueRecord[];
}

export function AuditHealthCard({ audit, issues }: AuditHealthCardProps) {
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  const score = audit.healthScore;
  let scoreColor = "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
  let scoreLabel = "Healthy";

  if (score < 50) {
    scoreColor = "text-rose-500 border-rose-500/30 bg-rose-500/10";
    scoreLabel = "Critical Attention Needed";
  } else if (score < 80) {
    scoreColor = "text-amber-500 border-amber-500/30 bg-amber-500/10";
    scoreLabel = "Needs Improvement";
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full border-4 text-3xl font-extrabold ${scoreColor}`}
          >
            {score}
          </div>
          <div className="mt-3 font-semibold text-foreground">Health Score</div>
          <div className="text-xs text-muted-foreground">{scoreLabel}</div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Pages Crawled</span>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-bold">{audit.pagesCrawled}</div>
          <div className="mt-1 text-xs text-muted-foreground truncate" title={audit.startUrl}>
            Target: {audit.startUrl}
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="capitalize text-xs">
              Status: {audit.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-rose-500">Critical Issues</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-500">{criticalCount}</div>
          <div className="mt-1 text-xs text-muted-foreground">High priority ranking blockers</div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-500">Warnings & Notices</span>
            <div className="flex gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <Info className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-500">{warningCount}</span>
            <span className="text-sm text-muted-foreground">warnings</span>
            <span className="text-xl font-bold text-blue-500 ml-2">{infoCount}</span>
            <span className="text-sm text-muted-foreground">info</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Optimization opportunities</div>
        </CardContent>
      </Card>
    </div>
  );
}
