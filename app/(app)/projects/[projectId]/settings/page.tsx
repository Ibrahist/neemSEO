import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { GscService } from "@/features/integrations/gsc/service";
import { GscCard } from "@/components/integrations/gsc-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KeyRound, ShieldAlert } from "lucide-react";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  const gscService = new GscService();
  const gscStatus = await gscService.getConnectionStatus(projectId);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage configuration, domain scopes, and search engine integrations for {project.name}.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">General Details</CardTitle>
          <CardDescription>Primary domain and tenant boundary configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
              <Input defaultValue={project.name} readOnly />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Primary Domain</label>
              <Input defaultValue={project.domain} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <GscCard projectId={projectId} defaultDomain={project.domain} status={gscStatus} />

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">DataForSEO & AI API Keys</CardTitle>
          </div>
          <CardDescription>
            Bring Your Own Key architecture guarantees direct vendor pricing and complete data
            ownership.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-muted-foreground">
          <p>
            API keys are configured through environment variables or organization settings to ensure
            zero leakage.
          </p>
          <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] space-y-1">
            <div>DATAFORSEO_LOGIN=your_login</div>
            <div>DATAFORSEO_PASSWORD=your_password</div>
            <div>OPENROUTER_API_KEY=sk-or-v1-...</div>
            <div>BETTER_AUTH_SECRET=**************************** (AES-256 Key)</div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-500">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>
              Third-party tokens and search console credentials are encrypted at rest with
              AES-256-GCM.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
