import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { listTrackedKeywords, getRankHistory } from "@/features/rank-tracking/service";
import { TrackKeywordForm } from "@/components/rank-tracking/track-keyword-form";
import { RankHistoryChart } from "@/components/rank-tracking/rank-history-chart";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";

interface RankTrackingPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ keywordId?: string }>;
}

export default async function RankTrackingPage({ params, searchParams }: RankTrackingPageProps) {
  const { projectId } = await params;
  const { keywordId } = await searchParams;

  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  const trackedKeywords = await listTrackedKeywords(projectId);
  const activeKeyword = keywordId
    ? trackedKeywords.find((k) => k.id === keywordId) || trackedKeywords[0]
    : trackedKeywords[0];

  const history = activeKeyword ? await getRankHistory(activeKeyword.id, projectId) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Rank Tracking
        </h1>
        <p className="text-sm text-neutral-500">
          Daily position history and movement tracking for {project.domain}
        </p>
      </div>

      {/* Add Keyword Form */}
      <TrackKeywordForm projectId={projectId} defaultDomain={project.domain} />

      {/* Chart Section */}
      {activeKeyword ? (
        <Suspense
          fallback={
            <div className="h-56 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
          }
        >
          <RankHistoryChart keyword={activeKeyword.keyword} data={history} />
        </Suspense>
      ) : null}

      {/* Tracked Keywords Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Tracked Keywords ({trackedKeywords.length})</h2>
          <span className="text-xs text-neutral-500">
            Click a keyword to inspect its position history
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead>Current Rank</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trackedKeywords.length > 0 ? (
              trackedKeywords.map((kw) => {
                const isSelected = activeKeyword?.id === kw.id;
                return (
                  <TableRow
                    key={kw.id}
                    className={isSelected ? "bg-emerald-50/50 dark:bg-emerald-950/30" : ""}
                  >
                    <TableCell className="font-medium text-neutral-900 dark:text-neutral-100">
                      {kw.keyword}
                    </TableCell>
                    <TableCell>
                      {kw.latestPosition ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          #{kw.latestPosition}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">100+</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 font-mono">
                      {kw.latestDate || "Never"}
                    </TableCell>
                    <TableCell>
                      {kw.tags ? (
                        <Badge variant="outline" className="text-[10px]">
                          {kw.tags}
                        </Badge>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/projects/${projectId}/rank-tracking?keywordId=${kw.id}`}
                        className="text-xs text-emerald-600 hover:underline font-medium"
                      >
                        {isSelected ? "Viewing Chart" : "View Chart"}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-neutral-500">
                  No keywords tracked yet. Add your first keyword above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
