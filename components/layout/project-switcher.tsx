"use client";

import * as React from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
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

export function ProjectSwitcher({ projects = [] }: ProjectSwitcherProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentProjectId = params?.projectId as string | undefined;

  // If no projects exist in the organization, display ONLY a clean "New Project" button
  if (!projects || projects.length === 0) {
    return (
      <Link
        href="/projects/new"
        className="flex items-center justify-center gap-2 w-full bg-white hover:bg-neutral-50 px-3 py-2 rounded-xl border border-[#ded9d2] text-xs font-bold text-[#0F3D2E] shadow-2xs transition-all hover:border-[#0F3D2E]/40"
      >
        <Plus className="h-4 w-4 text-[#8CC63F]" />
        <span>New Project</span>
      </Link>
    );
  }

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const isCreatingNew = pathname === "/projects/new";

  // When on the New Project page or when no project is actively selected
  if (isCreatingNew || !currentProject) {
    return (
      <div className="flex items-center gap-1.5 w-full">
        <Link
          href="/projects/new"
          className="flex items-center justify-center gap-1.5 flex-1 bg-white hover:bg-neutral-50 px-3 py-1.5 rounded-xl border border-[#0F3D2E]/30 text-xs font-bold text-[#0F3D2E] shadow-2xs transition-all ring-1 ring-[#8CC63F]/30"
        >
          <Plus className="h-4 w-4 text-[#8CC63F]" />
          <span>New Project</span>
        </Link>
        {projects.length > 0 && (
          <select
            aria-label="Switch project"
            value=""
            onChange={(e) => {
              const nextId = e.target.value;
              if (nextId) {
                router.push(`/projects/${nextId}/overview`);
              }
            }}
            className="h-8 px-2 rounded-xl border border-[#ded9d2] bg-white text-xs font-semibold text-neutral-700 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>
              Projects ({projects.length})
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  // When a project is active, display the switcher with the current project and a + button
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-[#ded9d2] text-sm shadow-2xs flex-1 min-w-0">
        <FolderGit2 className="h-4 w-4 text-[#8CC63F] shrink-0" />
        <select
          aria-label="Select active project"
          value={currentProject.id}
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
        title="Create new project"
      >
        <Plus className="h-4 w-4" />
      </Link>
    </div>
  );
}
