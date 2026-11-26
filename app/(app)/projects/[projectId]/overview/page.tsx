import { notFound } from "next/navigation";
import { requireProjectAccess } from "@/lib/auth/session";
import { AuditsService } from "@/features/audits/service";
import { listTrackedKeywords } from "@/features/rank-tracking/service";
import { getStoredBacklinkSnapshot } from "@/features/backlinks/service";
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
  let access;
  try {
    access = await requireProjectAccess(projectId);
  } catch {
    notFound();
  }
  const { project } = access;

  const auditsService = new AuditsService();
  const aiVisibilityService = new AiVisibilityService();

  const [auditSummary, trackedKeywords, storedBacklinks, aiVisibility] = await Promise.all([
    auditsService.getLatestAuditSummary(projectId).catch(() => null),
    listTrackedKeywords(projectId).catch(() => []),
    getStoredBacklinkSnapshot(projectId, project.domain).catch(() => null),
    aiVisibilityService.getVisibilitySummary(projectId).catch(() => null),
  ]);

  // Compute metrics dynamically for THIS specific project
  const healthScore = auditSummary?.audit?.healthScore ?? null;
  const trackedCount = trackedKeywords?.length ?? 0;
  const avgPosition =
    trackedCount > 0
      ? (
          trackedKeywords.reduce((acc, k) => acc + (k.latestPosition ?? 50), 0) / trackedCount
        ).toFixed(1)
      : null;

  const domainRank = storedBacklinks?.rank ?? null;
  const totalBacklinks = storedBacklinks?.totalBacklinks ?? 0;
  const referringCount = storedBacklinks?.referringDomainsCount ?? 0;
  const brandMentionRate =
    aiVisibility && aiVisibility.totalChecks > 0 ? aiVisibility.brandMentionRate : null;

  const workflows = [
    {
      title: "Keyword Research",
      description: "Search volumes, keyword difficulty, CPC, and intent exploration.",
      href: `/projects/${projectId}/keywords`,
      icon: Search,
      tag: "Live Data",
      stat: `Explore keywords for ${project.domain}`,
    },
    {
      title: "Rank Tracking",
      description: "Monitor daily keyword positions and SERP trends over time.",
      href: `/projects/${projectId}/rank-tracking`,
      icon: TrendingUp,
      tag: trackedCount > 0 ? `${trackedCount} Keywords` : "0 Tracked",
      stat: avgPosition ? `Avg Pos #${avgPosition}` : "Start tracking positions",
    },
    {
      title: "Competitor Insights",
      description: "Analyze organic overlap and keyword gaps against competitors.",
      href: `/projects/${projectId}/competitors`,
      icon: Users,
      tag: "Gap Analysis",
      stat: `Compare against ${project.domain} rivals`,
    },
    {
      title: "Backlink Profile",
      description: "Referring domains, anchor text distribution, and link velocity.",
      href: `/projects/${projectId}/backlinks`,
      icon: Link2,
      tag: domainRank !== null ? `Rank ${domainRank}/100` : "Profile Ready",
      stat:
        domainRank !== null
          ? `${formatNumber(totalBacklinks)} links from ${formatNumber(referringCount)} domains`
          : "Analyze inbound links",
    },
    {
      title: "Site Audits",
      description: "SSRF-safe technical crawler with health score & ranked issues.",
      href: `/projects/${projectId}/audits`,
      icon: FileCheck2,
      tag: healthScore !== null ? `Score ${healthScore}/100` : "Not Crawled",
      stat: auditSummary
        ? `${auditSummary.pages.length} pages (${auditSummary.issues.length} issues)`
        : `Run crawler on ${project.domain}`,
    },
    {
      title: "AI Visibility",
      description: "Track brand citations across ChatGPT, Claude, Perplexity & Gemini.",
      href: `/projects/${projectId}/ai-visibility`,
      icon: Bot,
      tag: brandMentionRate !== null ? `${brandMentionRate}% Mentioned` : "4 AI Engines",
      stat:
        aiVisibility && aiVisibility.totalChecks > 0
          ? `${aiVisibility.totalChecks} checks logged`
          : `Query prompts for ${project.domain}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Project Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#ded9d2] bg-white shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F3D2E]">{project.name}</h1>
            <Badge
              variant="outline"
              className="font-mono text-xs text-[#0F3D2E] bg-[#8CC63F]/20 border border-[#8CC63F]/30"
            >
              {project.domain}
            </Badge>
          </div>
          {project.description ? (
            <p className="text-sm text-[#57534e]">{project.description}</p>
          ) : (
            <p className="text-sm text-[#57534e]">
              Executive SEO dashboard and agent control center.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}/agent`}>
            <Button className="bg-[#0F3D2E] hover:bg-[#0A291F] text-white gap-2 text-xs h-9 rounded-xl shadow-xs">
              <Sparkles className="h-4 w-4 text-[#8CC63F]" /> Ask neemSEO Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Site Health */}
        <Link href={`/projects/${projectId}/audits`} className="group block">
          <Card className="h-full bg-white border border-[#ded9d2] rounded-2xl shadow-xs transition-all group-hover:border-[#0F3D2E]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#57534e] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#8CC63F]" /> Site Health
                </span>
                <span className="text-[11px] text-[#0F3D2E] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold">
                  Audit <ArrowRight className="h-3 w-3" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F3D2E]">
                {healthScore !== null ? `${healthScore}/100` : "—"}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {auditSummary
                  ? `${auditSummary.issues.length} issues across ${auditSummary.pages.length} pages`
                  : "No audit run yet · Click to crawl"}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Avg Position */}
        <Link href={`/projects/${projectId}/rank-tracking`} className="group block">
          <Card className="h-full bg-white border border-[#ded9d2] rounded-2xl shadow-xs transition-all group-hover:border-[#0F3D2E]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#57534e] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#8CC63F]" /> Avg Position
                </span>
                <span className="text-[11px] text-[#0F3D2E] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold">
                  Track <ArrowRight className="h-3 w-3" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F3D2E]">
                {avgPosition ? `#${avgPosition}` : "—"}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {trackedCount > 0
                  ? `Across ${trackedCount} tracked ${trackedCount === 1 ? "keyword" : "keywords"}`
                  : "0 keywords tracked · Click to add"}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Domain Rank */}
        <Link href={`/projects/${projectId}/backlinks`} className="group block">
          <Card className="h-full bg-white border border-[#ded9d2] rounded-2xl shadow-xs transition-all group-hover:border-[#0F3D2E]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#57534e] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Link2 className="h-4 w-4 text-[#8CC63F]" /> Domain Rank
                </span>
                <span className="text-[11px] text-[#0F3D2E] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold">
                  Profile <ArrowRight className="h-3 w-3" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F3D2E]">
                {domainRank !== null ? (
                  <>
                    {domainRank}
                    <span className="text-xs font-normal text-neutral-400">/100</span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {referringCount > 0
                  ? `${formatNumber(referringCount)} referring domains`
                  : "No backlink data yet · Click to view"}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* AI Citation */}
        <Link href={`/projects/${projectId}/ai-visibility`} className="group block">
          <Card className="h-full bg-white border border-[#ded9d2] rounded-2xl shadow-xs transition-all group-hover:border-[#0F3D2E]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-[#57534e] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Bot className="h-4 w-4 text-[#8CC63F]" /> AI Citation
                </span>
                <span className="text-[11px] text-[#0F3D2E] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold">
                  Test <ArrowRight className="h-3 w-3" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F3D2E]">
                {brandMentionRate !== null ? `${brandMentionRate}%` : "—"}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {aiVisibility && aiVisibility.totalChecks > 0
                  ? `Across ${aiVisibility.totalChecks} engine checks`
                  : "No AI tests run · Click to test"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 6 Core Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => {
          const Icon = wf.icon;
          return (
            <Link key={wf.title} href={wf.href} className="group">
              <Card className="h-full rounded-2xl border border-[#ded9d2] bg-white shadow-xs transition-all group-hover:border-[#0F3D2E] group-hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-xl bg-[#8CC63F]/20 text-[#0F3D2E] flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="border border-[#ded9d2] bg-[#f5f1ec] text-[#0F3D2E] text-[11px] font-semibold"
                    >
                      {wf.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-[#0F3D2E] group-hover:text-[#0A291F] transition-colors">
                    {wf.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-[#57534e]">
                    {wf.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs font-medium text-neutral-500 flex items-center justify-between">
                  <span>{wf.stat}</span>
                  <span className="text-[#0F3D2E] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open <ArrowRight className="h-3 w-3 text-[#8CC63F]" />
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
