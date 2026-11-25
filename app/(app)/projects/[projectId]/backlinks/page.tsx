import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { getBacklinksOverview } from "@/features/backlinks/service";
import { ReferringDomainsTable } from "@/components/backlinks/referring-domains-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { Link2, Globe, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BacklinksPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function BacklinksPage({ params }: BacklinksPageProps) {
  const { projectId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  const { snapshot, referringDomains } = await getBacklinksOverview({
    projectId,
    userId: user.id,
    domain: project.domain,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Backlink Profile
          </h1>
          <p className="text-sm text-neutral-500">
            Referring domains, total backlinks, and authority metrics for {project.domain}
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-2 text-xs h-9 self-start sm:self-auto">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Profile
        </Button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-emerald-600" /> Total Backlinks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {formatNumber(snapshot?.totalBacklinks ?? 0)}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">External inbound hyperlinks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-emerald-600" /> Referring Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {formatNumber(snapshot?.referringDomainsCount ?? 0)}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Unique root domains linking in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-600" /> Domain Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {snapshot?.rank ?? 0}
              <span className="text-xs font-normal text-neutral-400">/100</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">DataForSEO logarithmic authority</p>
          </CardContent>
        </Card>
      </div>

      {/* Referring Domains Table */}
      <Suspense
        fallback={
          <div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
        }
      >
        <ReferringDomainsTable targetDomain={project.domain} domains={referringDomains} />
      </Suspense>
    </div>
  );
}
