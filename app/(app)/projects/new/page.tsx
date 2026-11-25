"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProjectAction } from "@/features/projects/actions";
import { toast } from "sonner";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;
    const description = (formData.get("description") as string) || undefined;

    try {
      const res = await createProjectAction({ name, domain, description });
      if (res?.project?.id) {
        toast.success(`Project "${res.project.name}" created`);
        router.push(`/projects/${res.project.id}/overview`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Enter the name and target domain for the site you want to monitor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Project Name
              </label>
              <Input name="name" placeholder="e.g. My SaaS Company" required disabled={loading} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Primary Domain
              </label>
              <Input name="domain" placeholder="e.g. example.com" required disabled={loading} />
              <p className="text-[11px] text-neutral-500">
                Enter domain without http:// or https:// (e.g. neemseo.com)
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Description (Optional)
              </label>
              <Input
                name="description"
                placeholder="Notes or business context"
                disabled={loading}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
