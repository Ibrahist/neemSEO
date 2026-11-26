import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireProjectAccess } from "@/lib/auth/session";
import { getCompetitorOverview, getKeywordGap } from "@/features/competitors/service";
import { AddCompetitorForm } from "@/components/competitors/add-competitor-form";
import { KeywordGapTable } from "@/components/competitors/keyword-gap-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { Users, TrendingUp, Key } from "lucide-react";

interface CompetitorsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function CompetitorsPage({ params }: CompetitorsPageProps) {
  const { projectId } = await params;
  let access;
  try {
    access = await requireProjectAccess(projectId);
  } catch {
    notFound();
  }
  const { project } = access;

  const { domains, metrics } = await getCompetitorOverview(projectId);
  const activeCompetitor = domains[0]?.competitorDomain || "";
  const gapItems = activeCompetitor
    ? await getKeywordGap(projectId, activeCompetitor, project.domain)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Competitor Insights
        </h1>
        <p className="text-sm text-neutral-500">
          Domain benchmarking and organic keyword gap analysis for {project.domain}
        </p>
      </div>

      {/* Add Competitor Form */}
      <AddCompetitorForm projectId={projectId} />

      {/* Competitor Metrics Summary Cards */}
      {metrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{m.domain}</CardTitle>
                  <Badge variant="outline">Competitor</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 flex items-center gap-1">
                    <Key className="h-3.5 w-3.5" /> Organic Keywords
                  </span>
                  <span className="font-bold">{formatNumber(m.organicKeywordsCount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> Est. Monthly Traffic
                  </span>
                  <span className="font-bold text-emerald-600">
                    {formatNumber(m.organicTrafficEst)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-8 text-center text-sm text-neutral-500">
          <Users className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
          Add competitor domains above to benchmark organic traffic and rankings.
        </div>
      )}

      {/* Keyword Gap Table */}
      <Suspense
        fallback={
          <div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
        }
      >
        <KeywordGapTable competitorDomain={activeCompetitor} items={gapItems} />
      </Suspense>
    </div>
  );
}
