import "server-only";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { listProjects } from "./service";
import type { ProjectRecord } from "./repository";

export async function redirectToProjectWorkflow(workflowSlug: string) {
  const user = await requireAuth();

  let projects: ProjectRecord[] = [];
  try {
    projects = await listProjects(user.organizationId);
  } catch {
    projects = [];
  }

  // If no project exists yet, send user directly to create a new project
  if (projects.length === 0) {
    redirect("/projects/new");
  }

  // Use the active project (most recent or first)
  const targetProjectId = projects[0]?.id;
  redirect(`/projects/${targetProjectId}/${workflowSlug}`);
}
