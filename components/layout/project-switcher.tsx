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
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#ded9d2] text-sm shadow-2xs">
        <FolderGit2 className="h-4 w-4 text-[#8CC63F] shrink-0" />
        <select
          aria-label="Select active project"
          value={currentProject?.id || ""}
          onChange={(e) => {
            const nextId = e.target.value;
            if (nextId === "new") {
              router.push("/projects/new");
            } else if (nextId) {
              router.push(`/projects/${nextId}/overview`);
            }
          }}
          className="bg-transparent font-semibold text-[#0F3D2E] focus:outline-none cursor-pointer pr-1 text-xs sm:text-sm"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id} className="text-neutral-900 bg-white">
              {p.name} ({p.domain})
            </option>
          ))}
          <option value="new" className="font-bold text-[#0F3D2E] bg-white">
            + New Project...
          </option>
        </select>
      </div>
      <Link
        href="/projects/new"
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#ded9d2] bg-white text-[#0F3D2E] hover:bg-neutral-50 transition-colors shadow-2xs"
        title="Add new project"
      >
        <Plus className="h-4 w-4" />
      </Link>
    </div>
  );
}
