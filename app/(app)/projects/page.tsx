import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listProjects } from "@/features/projects/service";
import type { ProjectRecord } from "@/features/projects/repository";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Globe } from "lucide-react";

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

  if (projects.length > 0) {
    redirect(`/projects/${projects[0].id}/overview`);
  }

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mb-4">
        <Globe className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to neemSEO</h1>
      <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
        Every piece of SEO data belongs to a project. Create your first project to start keyword
        research, audits, and rank tracking.
      </p>

      <Card className="text-left border-dashed border-2">
        <CardHeader>
          <CardTitle>Create your first project</CardTitle>
          <CardDescription>Track keywords, backlinks, and health for your domain</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/projects/new">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
