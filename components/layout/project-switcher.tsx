"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { FolderGit2, Plus } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  domain: string;
}

interface ProjectSwitcherProps {
  projects: Project[];
}

export function ProjectSwitcher({ projects }: ProjectSwitcherProps) {
  const router = useRouter();
  const params = useParams();
  const currentProjectId = params?.projectId as string;

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm">
        <FolderGit2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <select
          value={currentProject?.id || ""}
          onChange={(e) => {
            const nextId = e.target.value;
            if (nextId === "new") {
              router.push("/projects/new");
            } else if (nextId) {
              router.push(`/projects/${nextId}/overview`);
            }
          }}
          className="bg-transparent font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer pr-1"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="dark:bg-neutral-900">
              {p.name} ({p.domain})
            </option>
          ))}
          <option value="new" className="dark:bg-neutral-900 font-semibold text-emerald-600">
            + New Project...
          </option>
        </select>
      </div>
      <Link
        href="/projects/new"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-neutral-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors dark:border-neutral-700"
        title="Add new project"
      >
        <Plus className="h-4 w-4" />
      </Link>
    </div>
  );
}
