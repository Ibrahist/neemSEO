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
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  projectId?: string;
  initialProjectId?: string;
}

export function Sidebar({ projectId, initialProjectId }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();

  // Resolve active project ID from props, URL path params, or initial project fallback
  const activeProjectId = projectId || (params?.projectId as string) || initialProjectId;

  const navItems = [
    {
      label: "Overview",
      href: activeProjectId ? `/projects/${activeProjectId}/overview` : "/projects",
      icon: LayoutDashboard,
    },
    {
      label: "Keyword Research",
      href: activeProjectId ? `/projects/${activeProjectId}/keywords` : "/keywords",
      icon: Search,
    },
    {
      label: "Rank Tracking",
      href: activeProjectId ? `/projects/${activeProjectId}/rank-tracking` : "/rank-tracking",
      icon: TrendingUp,
    },
    {
      label: "Competitors",
      href: activeProjectId ? `/projects/${activeProjectId}/competitors` : "/competitors",
      icon: Users,
    },
    {
      label: "Backlinks",
      href: activeProjectId ? `/projects/${activeProjectId}/backlinks` : "/backlinks",
      icon: Link2,
    },
    {
      label: "Site Audits",
      href: activeProjectId ? `/projects/${activeProjectId}/audits` : "/audits",
      icon: FileCheck2,
    },
    {
      label: "AI Visibility",
      href: activeProjectId ? `/projects/${activeProjectId}/ai-visibility` : "/ai-visibility",
      icon: Bot,
    },
    {
      label: "AI SEO Agent",
      href: activeProjectId ? `/projects/${activeProjectId}/agent` : "/agent",
      icon: Sparkles,
    },
    {
      label: "Settings",
      href: activeProjectId ? `/projects/${activeProjectId}/settings` : "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-[#ded9d2] bg-[#f5f1ec] flex flex-col select-none shrink-0 min-h-full">
      {/* Brand Header with Official Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#ded9d2] bg-[#f5f1ec]">
        <Link href="/" className="hover:opacity-90 transition-opacity flex items-center">
          <Logo size={28} showText={true} />
        </Link>
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
                "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all",
                isActive
                  ? "bg-[#0F3D2E] text-white shadow-xs"
                  : "text-neutral-700 hover:text-neutral-950 hover:bg-[#ebe7e1]/90"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-[#8CC63F]" : "text-neutral-500"
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
