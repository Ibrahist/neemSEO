import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listProjects, createProject } from "./service";
import type { ProjectRecord } from "./repository";

export async function redirectToProjectWorkflow(workflowSlug: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let projects: ProjectRecord[] = [];
  try {
    projects = await listProjects(user.organizationId);
  } catch {
    projects = [];
  }

  let targetProjectId: string | undefined = projects[0]?.id;

  if (!targetProjectId) {
    try {
      const starter = await createProject(user.organizationId, {
        name: "neemSEO Demo",
        domain: "neemseo.com",
        description: "Default workspace for SEO intelligence and rank monitoring",
      });
      targetProjectId = starter.id;
    } catch {
      targetProjectId = undefined;
    }
  }

  if (targetProjectId) {
    redirect(`/projects/${targetProjectId}/${workflowSlug}`);
  } else {
    redirect("/projects/new");
  }
}
