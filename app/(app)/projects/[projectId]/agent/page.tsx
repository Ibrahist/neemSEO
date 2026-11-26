import { notFound } from "next/navigation";
import { requireProjectAccess } from "@/lib/auth/session";
import { ChatInterface } from "@/components/agent/chat-interface";

interface AgentPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { projectId } = await params;
  let access;
  try {
    access = await requireProjectAccess(projectId);
  } catch {
    notFound();
  }
  const { project } = access;

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
