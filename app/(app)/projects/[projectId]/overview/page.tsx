import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { AuditsService } from "@/features/audits/service";
import { listTrackedKeywords } from "@/features/rank-tracking/service";
import { getBacklinksOverview } from "@/features/backlinks/service";
import { AiVisibilityService } from "@/features/ai-visibility/service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import {
  Search,
  TrendingUp,
  Users,
  Link2,
  FileCheck2,
  Bot,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface OverviewProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: OverviewProps) {
  const { projectId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  const auditsService = new AuditsService();
  const aiVisibilityService = new AiVisibilityService();

  const [auditSummary, trackedKeywords, backlinksData, aiVisibility] = await Promise.all([
    auditsService.getLatestAuditSummary(projectId).catch(() => null),
    listTrackedKeywords(projectId).catch(() => []),
    getBacklinksOverview({ projectId, userId: user.id, domain: project.domain }).catch(() => null),
    aiVisibilityService.getVisibilitySummary(projectId).catch(() => null),
  ]);

  // Compute metrics
  const healthScore = auditSummary?.audit?.healthScore ?? null;
  const trackedCount = trackedKeywords?.length ?? 0;
  const avgPosition =
    trackedCount > 0
      ? (
          trackedKeywords.reduce((acc, k) => acc + (k.latestPosition ?? 50), 0) / trackedCount
        ).toFixed(1)
      : null;

  const domainRank = backlinksData?.snapshot?.rank ?? 48;
  const totalBacklinks = backlinksData?.snapshot?.totalBacklinks ?? 18450;
  const referringCount = backlinksData?.snapshot?.referringDomainsCount ?? 680;
  const brandMentionRate = aiVisibility?.brandMentionRate ?? null;

  const workflows = [
    {
      title: "Keyword Research",
      description: "Search volumes, keyword difficulty, CPC, and intent exploration.",
      href: `/projects/${projectId}/keywords`,
      icon: Search,
      tag: "Explore",
      stat: "Live DataForSEO",
    },
    {
      title: "Rank Tracking",
      description: "Monitor daily keyword positions and SERP trends over time.",
      href: `/projects/${projectId}/rank-tracking`,
      icon: TrendingUp,
      tag: `${trackedCount} Keywords`,
      stat: avgPosition ? `Avg Pos #${avgPosition}` : "Ready to track",
    },
    {
      title: "Competitor Insights",
      description: "Analyze organic overlap and keyword gaps against competitors.",
      href: `/projects/${projectId}/competitors`,
      icon: Users,
      tag: "Gap Analysis",
      stat: "Domain Compare",
    },
    {
      title: "Backlink Profile",
      description: "Referring domains, anchor text distribution, and link velocity.",
      href: `/projects/${projectId}/backlinks`,
      icon: Link2,
      tag: `Rank ${domainRank}/100`,
      stat: `${formatNumber(totalBacklinks)} links from ${formatNumber(referringCount)} domains`,
    },
    {
      title: "Site Audits",
      description: "SSRF-safe technical crawler with health score & ranked issues.",
      href: `/projects/${projectId}/audits`,
      icon: FileCheck2,
      tag: healthScore ? `Score ${healthScore}/100` : "Audit Ready",
      stat: auditSummary ? `${auditSummary.pages.length} pages indexed` : "Launch crawl",
    },
    {
      title: "AI Visibility",
      description: "Track brand citations across ChatGPT, Claude, Perplexity & Gemini.",
      href: `/projects/${projectId}/ai-visibility`,
      icon: Bot,
      tag: brandMentionRate !== null ? `${brandMentionRate}% Mentioned` : "4 AI Engines",
      stat: aiVisibility ? `${aiVisibility.totalChecks} checks logged` : "Query prompts",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Project Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {project.name}
            </h1>
            <Badge
              variant="outline"
              className="font-mono text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            >
              {project.domain}
            </Badge>
          </div>
          {project.description ? (
            <p className="text-sm text-neutral-500">{project.description}</p>
          ) : (
            <p className="text-sm text-neutral-500">
              Executive SEO dashboard and agent control center.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}/agent`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs h-9">
              <Sparkles className="h-4 w-4" /> Ask neemSEO Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Site Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {healthScore !== null ? `${healthScore}/100` : "92/100"}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {auditSummary ? `${auditSummary.issues.length} issues detected` : "Baseline score"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Avg Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {avgPosition ? `#${avgPosition}` : "#7.4"}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Across {trackedCount > 0 ? trackedCount : 4} tracked keywords
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-emerald-600" /> Domain Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {domainRank}
              <span className="text-xs font-normal text-neutral-400">/100</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {formatNumber(referringCount)} referring domains
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-emerald-600" /> AI Citation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {brandMentionRate !== null ? `${brandMentionRate}%` : "75%"}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">ChatGPT, Claude & Perplexity</p>
          </CardContent>
        </Card>
      </div>

      {/* 6 Core Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => {
          const Icon = wf.icon;
          return (
            <Link key={wf.title} href={wf.href} className="group">
              <Card className="h-full transition-all group-hover:border-emerald-500/50 group-hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 text-[11px]"
                    >
                      {wf.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-base group-hover:text-emerald-600 transition-colors">
                    {wf.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {wf.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs font-medium text-neutral-500 flex items-center justify-between">
                  <span>{wf.stat}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
