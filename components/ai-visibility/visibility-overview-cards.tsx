import { Card, CardContent } from "@/components/ui/card";
import { AiVisibilitySummary } from "@/features/ai-visibility/service";
import { Bot, MessageSquare, Link2, Sparkles } from "lucide-react";

interface VisibilityOverviewCardsProps {
  summary: AiVisibilitySummary;
}

export function VisibilityOverviewCards({ summary }: VisibilityOverviewCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Brand Mention Rate</span>
              <MessageSquare className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-500">
              {summary.brandMentionRate}%
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Across all queried answer engines
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Domain Citation Rate
              </span>
              <Link2 className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-500">
              {summary.domainCitationRate}%
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Direct domain links in model outputs
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Prompts Tested</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold">{summary.totalPrompts}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {summary.totalChecks} total engine queries
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Engine Performance</span>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex flex-col gap-1 text-xs">
              {Object.entries(summary.engineBreakdown).map(([engine, stats]) => {
                const rate =
                  stats.checks > 0 ? Math.round((stats.mentions / stats.checks) * 100) : 0;
                return (
                  <div key={engine} className="flex items-center justify-between">
                    <span className="capitalize font-mono text-[11px]">{engine}</span>
                    <span className="font-semibold text-foreground">{rate}% mention</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
