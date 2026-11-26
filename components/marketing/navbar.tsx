"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  ChevronDown,
  Search,
  TrendingUp,
  Users,
  Link2,
  FileCheck2,
  Bot,
  Sparkles,
  ShieldCheck,
  Server,
  Terminal,
  Cpu,
  Github,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [featuresOpen, setFeaturesOpen] = React.useState(false);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ded9d2] bg-[#f5f1ec]/95 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-8">
        <nav
          aria-label="Main navigation"
          className="flex h-16 md:h-20 items-center justify-between"
        >
          {/* Left: Logo & Site Name */}
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/" className="hover:opacity-90 transition-opacity flex items-center">
              <Logo size={34} showText={true} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Features Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setFeaturesOpen(true)}
                onMouseLeave={() => setFeaturesOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950 cursor-pointer"
                >
                  Features
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>

                {featuresOpen && (
                  <div className="absolute left-0 top-[calc(100%-4px)] z-30 w-[640px] pt-2">
                    <div className="rounded-2xl border border-[#ded9d2] bg-white p-6 shadow-2xl shadow-neutral-900/10">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {/* Keyword Research */}
                        <Link
                          href="/keywords"
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                            <Search className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900">
                              Keyword Research
                            </span>
                            <span className="block text-xs text-neutral-500 leading-snug">
                              Search volume, KD, CPC, intent classification & CSV exports.
                            </span>
                          </div>
                        </Link>

                        {/* Rank Tracking */}
                        <Link
                          href="/rank-tracking"
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900">
                              Rank Tracking
                            </span>
                            <span className="block text-xs text-neutral-500 leading-snug">
                              Domain keyword positions, history movement & SERP charts.
                            </span>
                          </div>
                        </Link>

                        {/* Competitor Insights */}
                        <Link
                          href="/competitors"
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900">
                              Competitor Insights
                            </span>
                            <span className="block text-xs text-neutral-500 leading-snug">
                              Domain overview, organic overlap & keyword gap analysis.
                            </span>
                          </div>
                        </Link>

                        {/* Backlink Profile */}
                        <Link
                          href="/backlinks"
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                            <Link2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900">
                              Backlinks Intelligence
                            </span>
                            <span className="block text-xs text-neutral-500 leading-snug">
                              Referring domains, domain rank, anchors & link velocity.
                            </span>
                          </div>
                        </Link>

                        {/* Site Audits */}
                        <Link
                          href="/audits"
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                            <FileCheck2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900">
                              Technical Site Audits
                            </span>
                            <span className="block text-xs text-neutral-500 leading-snug">
                              SSRF-safe crawler, robots.txt, 0-100 score & ranked issues.
                            </span>
                          </div>
                        </Link>

                        {/* AI Visibility */}
                        <Link
                          href="/ai-visibility"
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900">
                              AI Search Visibility
                            </span>
                            <span className="block text-xs text-neutral-500 leading-snug">
                              Brand citation checks across ChatGPT, Claude, Perplexity & Gemini.
                            </span>
                          </div>
                        </Link>

                        {/* In-App AI Agent */}
                        <Link
                          href="/agent"
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900">
                              In-App AI Agent
                            </span>
                            <span className="block text-xs text-neutral-500 leading-snug">
                              Autonomous SEO chat streaming with internal MCP tools.
                            </span>
                          </div>
                        </Link>

                        {/* GSC Integration */}
                        <Link
                          href="/projects"
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-neutral-900">
                              Google Search Console
                            </span>
                            <span className="block text-xs text-neutral-500 leading-snug">
                              AES-256-GCM encrypted tokens & verified performance data.
                            </span>
                          </div>
                        </Link>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#ded9d2] flex items-center justify-between text-xs">
                        <Link
                          href="/projects"
                          className="font-semibold text-[#0F3D2E] hover:text-[#8CC63F] transition-colors"
                        >
                          Launch all 6 core workflows &rarr;
                        </Link>
                        <span className="text-neutral-500">BYOK DataForSEO · Zero Markups</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950 cursor-pointer"
                >
                  Resources
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>

                {resourcesOpen && (
                  <div className="absolute left-0 top-[calc(100%-4px)] z-30 w-[380px] pt-2">
                    <div className="rounded-2xl border border-[#ded9d2] bg-white p-5 shadow-2xl shadow-neutral-900/10 space-y-2">
                      <Link
                        href="/api/mcp"
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Terminal className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-neutral-900">
                            neemSEO MCP Server
                          </span>
                          <span className="block text-xs text-neutral-500 leading-snug">
                            Connect Claude Code, Cursor, Codex & agents at <code>/api/mcp</code>.
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/agent"
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-neutral-900">
                            Agent Skills Plugin
                          </span>
                          <span className="block text-xs text-neutral-500 leading-snug">
                            Reusable agent skills in <code>plugins/neemseo/skills/</code>.
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/projects"
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Server className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-neutral-900">
                            Self-Hosting Guides
                          </span>
                          <span className="block text-xs text-neutral-500 leading-snug">
                            Cloudflare Workers (OpenNext) & Docker standalone instructions.
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/api/healthz"
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-neutral-900">
                            Healthcheck Endpoint
                          </span>
                          <span className="block text-xs text-neutral-500 leading-snug">
                            Automated database and runtime health probe at <code>/api/healthz</code>
                            .
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/projects"
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950"
              >
                Pricing & Wholesale Rates
              </Link>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#0F3D2E] text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
              <span>100% Free · No Login</span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#ded9d2] bg-white px-3 text-xs font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <Github className="h-4 w-4" />
              <span>★ Star on GitHub</span>
            </a>

            <Link
              href="/projects"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-[#0F3D2E] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#0A291F] transition-all"
            >
              Launch Platform
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-neutral-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#ded9d2] space-y-3 bg-[#f5f1ec]">
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-white rounded-lg"
            >
              Features & Workflows
            </Link>
            <Link
              href="/api/mcp"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-white rounded-lg"
            >
              MCP Server
            </Link>
            <div className="px-3 py-2 text-xs font-semibold text-[#0F3D2E] bg-[#8CC63F]/20 rounded-lg inline-flex items-center gap-1.5 w-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
              <span>100% Free · No Login Required</span>
            </div>
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-center text-xs font-semibold text-white bg-[#0F3D2E] rounded-lg"
            >
              Launch Platform
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
