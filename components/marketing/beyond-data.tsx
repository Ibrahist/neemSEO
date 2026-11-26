"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, FileText, ShieldCheck } from "lucide-react";

export function BeyondData() {
  return (
    <section className="py-16 max-w-[1120px] mx-auto px-6">
      <div className="max-w-2xl mb-10">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0F3D2E]">
          Beyond raw SEO data
        </h2>
        <p className="mt-3 text-base text-[#57534e] leading-relaxed">
          An SEO tool is nothing without quality data. That&apos;s why neemSEO connects directly to
          DataForSEO APIs with zero subscription markups, while automating agency workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: GSC Integration */}
        <div className="p-7 rounded-2xl border border-[#ded9d2] bg-white shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E]">Google Search Console</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Connect Google Search Console with AES-256-GCM token encryption so your autonomous
              agent inspects verified impressions, clicks, CTR, and SERP positions.
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2E] hover:text-[#8CC63F] transition-colors"
          >
            <span>Connect Search Console</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Card 2: Persistent Project Context */}
        <div className="p-7 rounded-2xl border border-[#ded9d2] bg-white shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Bookmark className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E]">Persistent Project Context</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              As you run keyword research and audits, neemSEO saves historical rankings and domain
              parameters. Your AI agent never starts from scratch.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2E] hover:text-[#8CC63F] transition-colors"
          >
            <span>Explore project workspaces</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Card 3: Autonomous Agent Reports */}
        <div className="p-7 rounded-2xl border border-[#ded9d2] bg-white shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E]">Autonomous Agent Chat</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Use our in-app AI SEO agent powered by OpenRouter or connect external clients like
              Claude and Cursor over MCP. Research is rendered as clean interactive reports.
            </p>
          </div>
          <Link
            href="/agent"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2E] hover:text-[#8CC63F] transition-colors"
          >
            <span>Chat with AI agent</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
