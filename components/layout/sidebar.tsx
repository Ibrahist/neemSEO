"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  Search,
  TrendingUp,
  Users,
  Link2,
  FileCheck2,
  Bot,
  Sparkles,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectSwitcher } from "./project-switcher";
import type { ProjectRecord } from "@/features/projects/repository";

interface SidebarProps {
  projectId?: string;
  projects?: ProjectRecord[];
}

export function Sidebar({ projectId, projects = [] }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();

  // Resolve active project ID from props or URL path params. Do not force any default!
  const activeProjectId = projectId || (params?.projectId as string) || undefined;

  const navItems = [
    {
      label: "Overview",
      href: activeProjectId ? `/projects/${activeProjectId}/overview` : "/projects/new",
      icon: LayoutDashboard,
    },
    {
      label: "Keyword Research",
      href: activeProjectId ? `/projects/${activeProjectId}/keywords` : "/projects/new",
      icon: Search,
    },
    {
      label: "Rank Tracking",
      href: activeProjectId ? `/projects/${activeProjectId}/rank-tracking` : "/projects/new",
      icon: TrendingUp,
    },
    {
      label: "Competitors",
      href: activeProjectId ? `/projects/${activeProjectId}/competitors` : "/projects/new",
      icon: Users,
    },
    {
      label: "Backlinks",
      href: activeProjectId ? `/projects/${activeProjectId}/backlinks` : "/projects/new",
      icon: Link2,
    },
    {
      label: "Site Audits",
      href: activeProjectId ? `/projects/${activeProjectId}/audits` : "/projects/new",
      icon: FileCheck2,
    },
    {
      label: "AI Visibility",
      href: activeProjectId ? `/projects/${activeProjectId}/ai-visibility` : "/projects/new",
      icon: Bot,
    },
    {
      label: "AI SEO Agent",
      href: activeProjectId ? `/projects/${activeProjectId}/agent` : "/projects/new",
      icon: Sparkles,
    },
    {
      label: "Settings",
      href: activeProjectId ? `/projects/${activeProjectId}/settings` : "/projects/new",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-[#ded9d2] bg-[#f5f1ec] flex flex-col select-none shrink-0 min-h-full">
      {/* Active Project Switcher at Top of Sidebar */}
      <div className="p-3 border-b border-[#ded9d2] bg-[#f5f1ec]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#0F3D2E]/70 px-1 mb-1.5 flex items-center justify-between">
          <span>Active Project</span>
          <span className="text-[10px] font-bold bg-[#8CC63F]/20 text-[#0F3D2E] px-1.5 py-0.5 rounded border border-[#8CC63F]/30">
            Free
          </span>
        </div>
        <ProjectSwitcher projects={projects} />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#0F3D2E] px-3 py-1.5 opacity-80">
          Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/projects" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all border",
                isActive
                  ? "bg-white text-[#0F3D2E] border-[#ded9d2] shadow-xs font-bold ring-1 ring-[#8CC63F]/40"
                  : "border-transparent text-neutral-700 hover:text-neutral-950 hover:bg-white/70"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-[#0F3D2E]" : "text-neutral-500"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* BYOK Pricing Transparency Badge */}
      <div className="p-4 border-t border-[#ded9d2] bg-[#f5f1ec]">
        <div className="rounded-xl bg-white border border-[#ded9d2] p-3 text-xs text-neutral-600 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[#0F3D2E]">DataForSEO</span>
            <span className="text-[10px] font-bold bg-[#8CC63F]/20 text-[#0F3D2E] px-2 py-0.5 rounded-full border border-[#8CC63F]/30">
              BYOK
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight">
            Wholesale DataForSEO rates with 0% software markup.
          </p>
        </div>
      </div>
    </aside>
  );
}
