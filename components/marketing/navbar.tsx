"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
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
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [featuresOpen, setFeaturesOpen] = React.useState(false);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);
  const navRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setFeaturesOpen(false);
        setResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            <div ref={navRef} className="hidden lg:flex items-center gap-6">
              {/* Features Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setFeaturesOpen(true)}
                onMouseLeave={() => setFeaturesOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setFeaturesOpen((v) => !v);
                    setResourcesOpen(false);
                  }}
                  className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950 cursor-pointer"
                >
                  Features
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 opacity-60 transition-transform",
                      featuresOpen && "rotate-180"
                    )}
                  />
                </button>

                {featuresOpen && (
                  <div className="absolute left-0 top-[calc(100%-4px)] z-30 w-[640px] pt-2">
                    <div className="rounded-2xl border border-[#ded9d2] bg-white p-6 shadow-2xl shadow-neutral-900/10">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {/* Keyword Research */}
                        <Link
                          href="/keywords"
                          onClick={() => setFeaturesOpen(false)}
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
                              Search volume, KD, CPC, intent classification &amp; CSV exports.
                            </span>
                          </div>
                        </Link>

                        {/* Rank Tracking */}
                        <Link
                          href="/rank-tracking"
                          onClick={() => setFeaturesOpen(false)}
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
                              Domain keyword positions, history movement &amp; SERP charts.
                            </span>
                          </div>
                        </Link>

                        {/* Competitor Insights */}
                        <Link
                          href="/competitors"
                          onClick={() => setFeaturesOpen(false)}
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
                              Domain overview, organic overlap &amp; keyword gap analysis.
                            </span>
                          </div>
                        </Link>

                        {/* Backlink Profile */}
                        <Link
                          href="/backlinks"
                          onClick={() => setFeaturesOpen(false)}
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
                              Referring domains, domain rank, anchors &amp; link velocity.
                            </span>
                          </div>
                        </Link>

                        {/* Site Audits */}
                        <Link
                          href="/audits"
                          onClick={() => setFeaturesOpen(false)}
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
                              SSRF-safe crawler, robots.txt, 0-100 score &amp; ranked issues.
                            </span>
                          </div>
                        </Link>

                        {/* AI Visibility */}
                        <Link
                          href="/ai-visibility"
                          onClick={() => setFeaturesOpen(false)}
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
                              Brand citation checks across ChatGPT, Claude, Perplexity &amp; Gemini.
                            </span>
                          </div>
                        </Link>

                        {/* In-App AI Agent */}
                        <Link
                          href="/agent"
                          onClick={() => setFeaturesOpen(false)}
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
                          href="/settings"
                          onClick={() => setFeaturesOpen(false)}
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
                              AES-256-GCM encrypted tokens &amp; verified performance data.
                            </span>
                          </div>
                        </Link>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#ded9d2] flex items-center justify-between text-xs">
                        <Link
                          href="/projects"
                          onClick={() => setFeaturesOpen(false)}
                          className="font-semibold text-[#0F3D2E] hover:text-[#8CC63F] transition-colors"
                        >
                          Launch all 6 core workflows &rarr;
                        </Link>
                        <span className="text-neutral-500">100% Free · No Login</span>
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
                  onClick={() => {
                    setResourcesOpen((v) => !v);
                    setFeaturesOpen(false);
                  }}
                  className="inline-flex h-10 items-center gap-1.5 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950 cursor-pointer"
                >
                  Resources
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 opacity-60 transition-transform",
                      resourcesOpen && "rotate-180"
                    )}
                  />
                </button>

                {resourcesOpen && (
                  <div className="absolute left-0 top-[calc(100%-4px)] z-30 w-[420px] pt-2">
                    <div className="rounded-2xl border border-[#ded9d2] bg-white p-5 shadow-2xl shadow-neutral-900/10 space-y-2">
                      {/* Self-Hosting Guides */}
                      <Link
                        href="/docs#self-hosting"
                        onClick={() => setResourcesOpen(false)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                          <Server className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-neutral-900">
                            Self-Hosting Guides
                          </span>
                          <span className="block text-xs text-neutral-500 leading-snug">
                            Docker Compose, SQLite, Postgres &amp; Cloudflare Workers deployment.
                          </span>
                        </div>
                      </Link>

                      {/* neemSEO MCP Server */}
                      <Link
                        href="/docs#mcp"
                        onClick={() => setResourcesOpen(false)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-100 transition-colors">
                          <Terminal className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="block text-sm font-semibold text-neutral-900">
                              neemSEO MCP Server
                            </span>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                              Guide
                            </span>
                          </div>
                          <span className="block text-xs text-neutral-500 leading-snug">
                            Connect Claude Code, Cursor, Codex &amp; AI agents over MCP.
                          </span>
                        </div>
                      </Link>

                      {/* Agent Skills Plugin */}
                      <Link
                        href="/docs#agent-skills"
                        onClick={() => setResourcesOpen(false)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
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

                      {/* DataForSEO BYOK Guide */}
                      <Link
                        href="/docs#byok"
                        onClick={() => setResourcesOpen(false)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-100 transition-colors">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-neutral-900">
                            DataForSEO BYOK Guide
                          </span>
                          <span className="block text-xs text-neutral-500 leading-snug">
                            Wholesale API rates ($0.002 - $0.02) &amp; 7-day automated caching.
                          </span>
                        </div>
                      </Link>

                      {/* Live Healthcheck Status Dashboard */}
                      <Link
                        href="/health"
                        onClick={() => setResourcesOpen(false)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#f5f1ec]"
                      >
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="block text-sm font-semibold text-neutral-900">
                              System Health &amp; Diagnostics
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Live Page
                            </span>
                          </div>
                          <span className="block text-xs text-neutral-500 leading-snug">
                            Live database latency, runtime status, and automated health checks.
                          </span>
                        </div>
                      </Link>

                      {/* Bottom Link to Full Documentation */}
                      <div className="mt-3 pt-3 border-t border-[#ded9d2] flex items-center justify-between text-xs">
                        <Link
                          href="/docs"
                          onClick={() => setResourcesOpen(false)}
                          className="font-semibold text-[#0F3D2E] hover:text-[#8CC63F] transition-colors flex items-center gap-1"
                        >
                          <span>Explore all documentation &amp; guides</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <a
                          href="https://github.com/Ibrahist/neemSEO"
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                        >
                          <span>GitHub</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://github.com/Ibrahist/neemSEO"
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
          <div className="lg:hidden py-4 border-t border-[#ded9d2] space-y-2 bg-[#f5f1ec]">
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-white rounded-lg"
            >
              Platform Workflows
            </Link>
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-white rounded-lg"
            >
              Documentation &amp; Guides
            </Link>
            <Link
              href="/docs#mcp"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-white rounded-lg"
            >
              neemSEO MCP Server
            </Link>
            <Link
              href="/docs#self-hosting"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-white rounded-lg"
            >
              Self-Hosting Guides
            </Link>
            <Link
              href="/health"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-white rounded-lg"
            >
              System Health &amp; Diagnostics
            </Link>
            <div className="pt-2">
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-center text-xs font-semibold text-white bg-[#0F3D2E] rounded-lg shadow-xs"
              >
                Launch Platform
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
