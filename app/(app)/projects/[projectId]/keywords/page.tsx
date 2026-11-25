import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { getRecentKeywordSearches, getKeywordsForSearch } from "@/features/keywords/service";
import { KeywordSearchForm } from "@/components/keywords/keyword-search-form";
import { KeywordTable } from "@/components/keywords/keyword-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface KeywordsPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ searchId?: string }>;
}

export default async function KeywordsPage({ params, searchParams }: KeywordsPageProps) {
  const { projectId } = await params;
  const { searchId } = await searchParams;

  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  const recentSearches = await getRecentKeywordSearches(projectId, 6);
  const activeSearch = searchId
    ? recentSearches.find((s) => s.id === searchId) || recentSearches[0]
    : recentSearches[0];

  const keywords = activeSearch ? await getKeywordsForSearch(activeSearch.id, projectId) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Keyword Research
        </h1>
        <p className="text-sm text-neutral-500">
          Analyze search volumes, competition, keyword difficulty, and intent for {project.domain}
        </p>
      </div>

      {/* Search Input Form */}
      <KeywordSearchForm projectId={projectId} />

      {/* Recent Searches Pills */}
      {recentSearches.length > 0 ? (
        <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-500">
          <span className="font-medium text-neutral-600 dark:text-neutral-400">Recent:</span>
          {recentSearches.map((s) => (
            <Link
              key={s.id}
              href={`/projects/${projectId}/keywords?searchId=${s.id}`}
              className="inline-block"
            >
              <Badge
                variant={activeSearch?.id === s.id ? "default" : "secondary"}
                className="cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                {s.seedKeyword}
              </Badge>
            </Link>
          ))}
        </div>
      ) : null}

      {/* Results Table with Suspense */}
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-sm text-neutral-400">
            Loading keywords...
          </div>
        }
      >
        {activeSearch ? (
          <KeywordTable
            searchId={activeSearch.id}
            projectId={projectId}
            seedKeyword={activeSearch.seedKeyword}
            keywords={keywords}
          />
        ) : (
          <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-12 text-center text-sm text-neutral-500">
            Enter a seed keyword above to generate keyword suggestions, volume metrics, and intent
            analysis.
          </div>
        )}
      </Suspense>
    </div>
  );
}
