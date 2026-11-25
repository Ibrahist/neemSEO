import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Users, Link2, FileCheck2, Bot } from "lucide-react";
import Link from "next/link";

interface OverviewProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: OverviewProps) {
  const { projectId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  const workflows = [
    {
      title: "Keyword Research",
      description: "Search volumes, keyword difficulty, CPC, and search intent.",
      href: `/projects/${projectId}/keywords`,
      icon: Search,
      count: "Explore",
    },
    {
      title: "Rank Tracking",
      description: "Monitor daily keyword rankings and SERP movement over time.",
      href: `/projects/${projectId}/rank-tracking`,
      icon: TrendingUp,
      count: "Track",
    },
    {
      title: "Competitor Insights",
      description: "Analyze competitor rankings, organic traffic, and keyword gaps.",
      href: `/projects/${projectId}/competitors`,
      icon: Users,
      count: "Compare",
    },
    {
      title: "Backlinks",
      description: "Track referring domains, anchor text, and link velocity.",
      href: `/projects/${projectId}/backlinks`,
      icon: Link2,
      count: "Inspect",
    },
    {
      title: "Site Audits",
      description: "SSRF-safe technical crawler reporting health score and ranked issues.",
      href: `/projects/${projectId}/audits`,
      icon: FileCheck2,
      count: "Audit",
    },
    {
      title: "AI Visibility",
      description: "Check if your brand is cited by ChatGPT, Claude, and Perplexity.",
      href: `/projects/${projectId}/ai-visibility`,
      icon: Bot,
      count: "Analyze",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Project Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {project.name}
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {project.domain}
            </Badge>
          </div>
          {project.description ? (
            <p className="mt-1 text-sm text-neutral-500">{project.description}</p>
          ) : null}
        </div>
        <div className="text-xs text-neutral-500">
          Created on {new Date(project.createdAt).toLocaleDateString()}
        </div>
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
                      className="group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950"
                    >
                      {wf.count}
                    </Badge>
                  </div>
                  <CardTitle className="text-base group-hover:text-emerald-600 transition-colors">
                    {wf.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {wf.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  Open workflow &rarr;
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
