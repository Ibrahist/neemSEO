import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getProject } from "@/features/projects/service";
import { ChatInterface } from "@/components/agent/chat-interface";

interface AgentPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { projectId } = await params;
  const user = await requireAuth();
  const project = await getProject(projectId, user.organizationId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <ChatInterface
        projectId={projectId}
        projectName={project.name}
        projectDomain={project.domain}
      />
    </div>
  );
}
