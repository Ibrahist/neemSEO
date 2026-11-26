"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Users, Link2, TrendingUp, FileCheck2, Bot, CheckCircle2 } from "lucide-react";

export function ToolkitDemo() {
  const [activeTab, setActiveTab] = React.useState("keywords");

  const workflows = [
    {
      id: "keywords",
      title: "Keyword Research",
      desc: "Seed keywords, search volume, KD, CPC, intent classification & CSV export.",
      icon: Search,
    },
    {
      id: "rank",
      title: "Rank Tracking",
      desc: "Track daily keyword positions per project with SERP history charts.",
      icon: TrendingUp,
    },
    {
      id: "competitors",
      title: "Competitor Insights",
      desc: "Domain metrics, organic traffic estimates, and keyword gap analysis.",
      icon: Users,
    },
    {
      id: "backlinks",
      title: "Backlink Profile",
      desc: "Referring domains, authority rank, anchor text & 14-day velocity.",
      icon: Link2,
    },
    {
      id: "audits",
      title: "Technical Site Audits",
      desc: "SSRF-safe crawler, robots.txt, 0-100 health score & ranked issues.",
      icon: FileCheck2,
    },
    {
      id: "visibility",
      title: "AI Search Visibility",
      desc: "Citation and mention checks across ChatGPT, Claude, Perplexity & Gemini.",
      icon: Bot,
    },
  ];

  const workflowLinks: Record<string, string> = {
    keywords: "/keywords",
    rank: "/rank-tracking",
    competitors: "/competitors",
    backlinks: "/backlinks",
    audits: "/audits",
    visibility: "/ai-visibility",
  };

  return (
    <section className="py-16 max-w-[1120px] mx-auto px-6">
      <div className="max-w-2xl mb-10">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0F3D2E]">
          6 Focused Workflows Built In
        </h2>
        <p className="mt-3 text-base text-[#57534e] leading-relaxed">
          Everything you need to grow organic traffic, accessible via modern web UI and AI agents
          over MCP.
        </p>
      </div>

      {/* 6 Workflow Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {workflows.map((wf) => {
          const Icon = wf.icon;
          const isActive = activeTab === wf.id;
          return (
            <button
              key={wf.id}
              onClick={() => setActiveTab(wf.id)}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "border-[#0F3D2E] bg-white shadow-md ring-1 ring-[#0F3D2E]"
                  : "border-[#ded9d2] bg-white/70 hover:bg-white hover:border-neutral-400 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-4 w-4 ${isActive ? "text-[#8CC63F]" : "text-neutral-500"}`} />
                {isActive && <span className="h-2 w-2 rounded-full bg-[#8CC63F]" />}
              </div>
              <p className="text-sm font-bold text-[#0F3D2E]">{wf.title}</p>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">{wf.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Interactive Tool Preview Window */}
      <div className="rounded-2xl border border-[#ded9d2] bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#ded9d2]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h4 className="text-base font-bold text-[#0F3D2E]">
                Workflow Preview: {workflows.find((w) => w.id === activeTab)?.title}
              </h4>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              100% Free Platform · Instant DataForSEO Insights · Project Scoped
            </p>
          </div>

          <Link
            href={workflowLinks[activeTab] || "/projects"}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0F3D2E] px-4 text-xs font-semibold text-white hover:bg-[#0A291F] transition-colors shrink-0"
          >
            Explore Workflow &rarr;
          </Link>
        </div>

        {/* Tab Content Display */}
        <div className="pt-6 overflow-x-auto text-xs">
          {activeTab === "keywords" && (
            <div className="min-w-[550px]">
              <div className="grid grid-cols-5 pb-2 text-neutral-400 font-semibold border-b border-neutral-100">
                <span className="col-span-2">Keyword</span>
                <span className="text-right">Volume</span>
                <span className="text-right">Difficulty</span>
                <span className="text-right">CPC</span>
              </div>
              <div className="grid grid-cols-5 py-2.5 border-b border-neutral-50 text-neutral-800">
                <span className="col-span-2 font-semibold">self hosted seo platform</span>
                <span className="text-right font-mono font-semibold">1,450</span>
                <span className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    12
                  </span>
                </span>
                <span className="text-right font-mono">$1.45</span>
              </div>
              <div className="grid grid-cols-5 py-2.5 border-b border-neutral-50 text-neutral-800">
                <span className="col-span-2 font-semibold">open source rank tracking</span>
                <span className="text-right font-mono font-semibold">720</span>
                <span className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    9
                  </span>
                </span>
                <span className="text-right font-mono">$2.10</span>
              </div>
              <div className="grid grid-cols-5 py-2.5 text-neutral-800">
                <span className="col-span-2 font-semibold">pay as you go ahrefs alternative</span>
                <span className="text-right font-mono font-semibold">480</span>
                <span className="text-right">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    14
                  </span>
                </span>
                <span className="text-right font-mono">$3.40</span>
              </div>
            </div>
          )}

          {activeTab === "rank" && (
            <div className="min-w-[550px]">
              <div className="grid grid-cols-4 pb-2 text-neutral-400 font-semibold border-b border-neutral-100">
                <span>Tracked Keyword</span>
                <span className="text-right">Current Position</span>
                <span className="text-right">7-Day Movement</span>
                <span className="text-right">Ranking URL</span>
              </div>
              <div className="grid grid-cols-4 py-2.5 border-b border-neutral-50 text-neutral-800">
                <span className="font-semibold">open source seo</span>
                <span className="text-right font-bold text-emerald-700">#3</span>
                <span className="text-right font-mono text-emerald-600 font-semibold">+4</span>
                <span className="text-right text-neutral-500 font-mono">/features</span>
              </div>
              <div className="grid grid-cols-4 py-2.5 text-neutral-800">
                <span className="font-semibold">self-hosted rank tracker</span>
                <span className="text-right font-bold text-emerald-700">#5</span>
                <span className="text-right font-mono text-emerald-600 font-semibold">+2</span>
                <span className="text-right text-neutral-500 font-mono">/rank-tracking</span>
              </div>
            </div>
          )}

          {activeTab === "backlinks" && (
            <div className="min-w-[550px]">
              <div className="grid grid-cols-4 pb-2 text-neutral-400 font-semibold border-b border-neutral-100">
                <span>Referring Domain</span>
                <span className="text-right">Domain Rank</span>
                <span className="text-right">Backlinks</span>
                <span className="text-right">Status</span>
              </div>
              <div className="grid grid-cols-4 py-2.5 border-b border-neutral-50 text-neutral-800">
                <span className="font-semibold">github.com</span>
                <span className="text-right font-bold">95/100</span>
                <span className="text-right font-mono">142</span>
                <span className="text-right text-emerald-700 font-semibold">Active</span>
              </div>
              <div className="grid grid-cols-4 py-2.5 text-neutral-800">
                <span className="font-semibold">producthunt.com</span>
                <span className="text-right font-bold">88/100</span>
                <span className="text-right font-mono">89</span>
                <span className="text-right text-emerald-700 font-semibold">Active</span>
              </div>
            </div>
          )}

          {activeTab === "audits" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f5f1ec] border border-[#ded9d2]">
                <div className="h-12 w-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
                  92
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Technical Health Score: 92/100
                  </p>
                  <p className="text-xs text-neutral-600">
                    SSRF-safe crawl evaluated status codes, canonicals, H1 hierarchy, and
                    robots.txt.
                  </p>
                </div>
              </div>
              <div className="text-xs text-neutral-600 space-y-1">
                <p className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> All critical pages
                  return 200 OK with valid canonical tags
                </p>
                <p className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> robots.txt and
                  sitemap.xml parsed cleanly without SSRF risk
                </p>
              </div>
            </div>
          )}

          {activeTab === "competitors" && (
            <div className="min-w-[550px]">
              <div className="grid grid-cols-4 pb-2 text-neutral-400 font-semibold border-b border-neutral-100">
                <span>Target Keyword</span>
                <span className="text-right">Your Rank</span>
                <span className="text-right">Competitor Rank</span>
                <span className="text-right">Search Volume</span>
              </div>
              <div className="grid grid-cols-4 py-2.5 border-b border-neutral-50 text-neutral-800">
                <span className="font-semibold">mcp seo tool</span>
                <span className="text-right font-bold text-neutral-400">—</span>
                <span className="text-right font-bold text-emerald-700">#4</span>
                <span className="text-right font-mono">890</span>
              </div>
              <div className="grid grid-cols-4 py-2.5 text-neutral-800">
                <span className="font-semibold">automated seo agent</span>
                <span className="text-right font-bold text-emerald-700">#2</span>
                <span className="text-right font-bold text-amber-700">#8</span>
                <span className="text-right font-mono">1,200</span>
              </div>
            </div>
          )}

          {activeTab === "visibility" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#f5f1ec] border border-[#ded9d2]">
                <p className="font-semibold text-neutral-900 text-xs">
                  Prompt: &quot;What are the best open-source alternatives to Ahrefs?&quot;
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2 text-[11px]">
                  <span className="px-2 py-1 rounded bg-white font-medium text-emerald-800 border border-emerald-200">
                    ChatGPT: Mentioned
                  </span>
                  <span className="px-2 py-1 rounded bg-white font-medium text-emerald-800 border border-emerald-200">
                    Claude: Cited
                  </span>
                  <span className="px-2 py-1 rounded bg-white font-medium text-emerald-800 border border-emerald-200">
                    Perplexity: Cited
                  </span>
                  <span className="px-2 py-1 rounded bg-white font-medium text-emerald-800 border border-emerald-200">
                    Gemini: Mentioned
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
