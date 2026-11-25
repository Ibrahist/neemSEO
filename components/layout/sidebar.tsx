"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

interface SidebarProps {
  projectId?: string;
}

export function Sidebar({ projectId }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: projectId ? `/projects/${projectId}/overview` : "/projects",
      icon: LayoutDashboard,
    },
    {
      label: "Keyword Research",
      href: projectId ? `/projects/${projectId}/keywords` : "/keywords",
      icon: Search,
    },
    {
      label: "Rank Tracking",
      href: projectId ? `/projects/${projectId}/rank-tracking` : "/rank-tracking",
      icon: TrendingUp,
    },
    {
      label: "Competitors",
      href: projectId ? `/projects/${projectId}/competitors` : "/competitors",
      icon: Users,
    },
    {
      label: "Backlinks",
      href: projectId ? `/projects/${projectId}/backlinks` : "/backlinks",
      icon: Link2,
    },
    {
      label: "Site Audits",
      href: projectId ? `/projects/${projectId}/audits` : "/audits",
      icon: FileCheck2,
    },
    {
      label: "AI Visibility",
      href: projectId ? `/projects/${projectId}/ai-visibility` : "/ai-visibility",
      icon: Bot,
    },
    {
      label: "AI SEO Agent",
      href: projectId ? `/projects/${projectId}/agent` : "/agent",
      icon: Sparkles,
    },
    {
      label: "Settings",
      href: projectId ? `/projects/${projectId}/settings` : "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col h-screen select-none dark:border-neutral-800 dark:bg-neutral-950">
      <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            N
          </div>
          <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-neutral-50">
            neem<span className="text-emerald-600">SEO</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-3 py-2">
          Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">DataForSEO</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded dark:bg-emerald-950 dark:text-emerald-400">
              BYOK
            </span>
          </div>
          <p className="text-[11px] leading-tight">
            Pay only for what you query. Zero subscription markup.
          </p>
        </div>
      </div>
    </aside>
  );
}
