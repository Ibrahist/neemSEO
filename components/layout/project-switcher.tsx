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

  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center justify-between w-full bg-white px-3 py-2 rounded-xl border border-[#ded9d2] text-xs shadow-2xs">
        <span className="text-neutral-500 font-medium">No projects yet</span>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1 font-bold text-[#0F3D2E] hover:text-[#8CC63F] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </Link>
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-[#ded9d2] text-sm shadow-2xs flex-1 min-w-0">
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
          className="bg-transparent font-semibold text-[#0F3D2E] focus:outline-none cursor-pointer pr-1 text-xs truncate flex-1"
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
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#ded9d2] bg-white text-[#0F3D2E] hover:bg-neutral-50 transition-colors shadow-2xs"
        title="Add new project"
      >
        <Plus className="h-4 w-4" />
      </Link>
    </div>
  );
}
