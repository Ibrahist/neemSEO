import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { AiVisibilityService } from "@/features/ai-visibility/service";
import { CheckVisibilityForm } from "@/components/ai-visibility/check-visibility-form";
import { VisibilityOverviewCards } from "@/components/ai-visibility/visibility-overview-cards";
import { PromptsHistoryTable } from "@/components/ai-visibility/prompts-history-table";
import { Sparkles } from "lucide-react";

interface AiVisibilityPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AiVisibilityPage({ params }: AiVisibilityPageProps) {
  const { projectId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  if (!project) {
    notFound();
  }

  const service = new AiVisibilityService();
  const summary = await service.getVisibilitySummary(projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Answer Engine Visibility
          </h1>
          <p className="text-sm text-muted-foreground">
            Track brand presence, share of voice, and citation URLs across ChatGPT, Claude,
            Perplexity, and Gemini.
          </p>
        </div>
      </div>

      <CheckVisibilityForm
        projectId={projectId}
        defaultBrand={project.name}
        defaultDomain={project.domain}
      />

      <VisibilityOverviewCards summary={summary} />

      <PromptsHistoryTable prompts={summary.recentPrompts} />
    </div>
  );
}
