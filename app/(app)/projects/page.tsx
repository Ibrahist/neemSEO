import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listProjects, createProject } from "@/features/projects/service";
import type { ProjectRecord } from "@/features/projects/repository";

export default async function ProjectsIndexPage() {
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

  if (projects.length === 0) {
    let starter: ProjectRecord | null = null;
    try {
      starter = await createProject(user.organizationId, {
        name: "neemSEO Demo",
        domain: "neemseo.com",
        description: "Default workspace for SEO intelligence and rank monitoring",
      });
    } catch {
      starter = null;
    }

    if (starter) {
      redirect(`/projects/${starter.id}/overview`);
    } else {
      redirect("/projects/new");
    }
  }

  redirect(`/projects/${projects[0].id}/overview`);
}
