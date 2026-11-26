import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireProjectAccess } from "@/lib/auth/session";
import { getBacklinksOverview } from "@/features/backlinks/service";
import { ReferringDomainsTable } from "@/components/backlinks/referring-domains-table";
import { AnchorTextTable } from "@/components/backlinks/anchor-text-table";
import { NewLostLinksChart } from "@/components/backlinks/new-lost-links-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/utils";
import { Link2, Globe, Shield } from "lucide-react";

interface BacklinksPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function BacklinksPage({ params }: BacklinksPageProps) {
  const { projectId } = await params;
  let access;
  try {
    access = await requireProjectAccess(projectId);
  } catch {
    notFound();
  }
  const { user, project } = access;

  const { snapshot, referringDomains, anchors, newLostTrend } = await getBacklinksOverview({
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
            Referring domains, total backlinks, anchor text, and authority metrics for{" "}
            {project.domain}
          </p>
        </div>
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

      {/* Navigation Tabs */}
      <Tabs defaultValue="domains" className="w-full">
        <TabsList>
          <TabsTrigger value="domains">Referring Domains ({referringDomains.length})</TabsTrigger>
          <TabsTrigger value="anchors">Anchor Text ({anchors.length})</TabsTrigger>
          <TabsTrigger value="velocity">Link Velocity</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="mt-4">
          <Suspense
            fallback={
              <div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
            }
          >
            <ReferringDomainsTable targetDomain={project.domain} domains={referringDomains} />
          </Suspense>
        </TabsContent>

        <TabsContent value="anchors" className="mt-4">
          <AnchorTextTable targetDomain={project.domain} anchors={anchors} />
        </TabsContent>

        <TabsContent value="velocity" className="mt-4">
          <NewLostLinksChart data={newLostTrend} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
