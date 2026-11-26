import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { listProjects } from "@/features/projects/service";
import type { ProjectRecord } from "@/features/projects/repository";

export default async function ProjectsIndexPage() {
  const user = await requireAuth();

  let projects: ProjectRecord[] = [];
  try {
    projects = await listProjects(user.organizationId);
  } catch {
    projects = [];
  }

  // If no projects exist yet, send user directly to create a new project
  if (projects.length === 0) {
    redirect("/projects/new");
  }

  // Redirect to first active project overview
  redirect(`/projects/${projects[0].id}/overview`);
}
