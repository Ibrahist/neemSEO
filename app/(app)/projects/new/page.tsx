"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProjectAction } from "@/features/projects/actions";
import { toast } from "sonner";
import { Globe } from "lucide-react";

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
        router.refresh();
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
      <Card className="border border-[#ded9d2] bg-white rounded-2xl shadow-sm">
        <CardHeader>
          <div className="h-10 w-10 rounded-xl bg-[#8CC63F]/20 text-[#0F3D2E] flex items-center justify-center mb-2">
            <Globe className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-bold text-[#0F3D2E]">Create New Project</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[#57534e]">
            Enter the name and target domain for the site you want to monitor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F3D2E]">Project Name</label>
              <Input
                name="name"
                placeholder="e.g. My SaaS Company"
                required
                disabled={loading}
                className="rounded-xl border border-[#ded9d2] focus-visible:ring-[#0F3D2E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F3D2E]">Primary Domain</label>
              <Input
                name="domain"
                placeholder="e.g. example.com"
                required
                disabled={loading}
                className="rounded-xl border border-[#ded9d2] focus-visible:ring-[#0F3D2E]"
              />
              <p className="text-[11px] text-neutral-500">
                Enter domain without http:// or https:// (e.g. neemseo.com)
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F3D2E]">Description (Optional)</label>
              <Input
                name="description"
                placeholder="Notes or business context"
                disabled={loading}
                className="rounded-xl border border-[#ded9d2] focus-visible:ring-[#0F3D2E]"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3">
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
