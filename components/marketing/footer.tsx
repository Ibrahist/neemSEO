"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ArrowUpRight, Github } from "lucide-react";

export function Footer() {
  return (
    <>
      <footer className="border-t border-[#ded9d2] bg-[#f5f1ec] pt-16 pb-12 text-[#111111]">
        <div className="w-full px-6 md:px-8">
          {/* Newsletter Signup Row */}
          <div className="pb-12 border-b border-[#ded9d2] grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-[#0F3D2E]">
                Stay in the loop with neemSEO
              </h3>
              <p className="mt-1.5 text-xs text-neutral-600">
                Open-source releases, new MCP tools, and autonomous agent skill updates.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 max-w-md md:ml-auto w-full"
            >
              <input
                type="email"
                placeholder="developer@company.com"
                className="flex-1 h-10 px-3.5 text-xs rounded-xl border border-[#ded9d2] bg-white text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#0F3D2E] text-white text-xs font-semibold hover:bg-[#0A291F] transition-colors shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* 5-Column Directory with neemSEO details ONLY */}
          <div className="py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-xs">
            {/* Workflows */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-[#0F3D2E]">Workflows</p>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <Link href="/keywords" className="hover:text-neutral-900 transition-colors">
                    Keyword Research
                  </Link>
                </li>
                <li>
                  <Link href="/rank-tracking" className="hover:text-neutral-900 transition-colors">
                    Rank Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/competitors" className="hover:text-neutral-900 transition-colors">
                    Competitor Insights
                  </Link>
                </li>
                <li>
                  <Link href="/backlinks" className="hover:text-neutral-900 transition-colors">
                    Backlink Profile
                  </Link>
                </li>
                <li>
                  <Link href="/audits" className="hover:text-neutral-900 transition-colors">
                    Technical Site Audits
                  </Link>
                </li>
                <li>
                  <Link href="/ai-visibility" className="hover:text-neutral-900 transition-colors">
                    AI Search Visibility
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-neutral-900 transition-colors">
                    GSC Integration
                  </Link>
                </li>
              </ul>
            </div>

            {/* AI & MCP */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-[#0F3D2E]">AI &amp; MCP</p>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <Link href="/docs#mcp" className="hover:text-neutral-900 transition-colors">
                    neemSEO MCP Server Guide
                  </Link>
                </li>
                <li>
                  <Link href="/docs#mcp" className="hover:text-neutral-900 transition-colors">
                    Claude Code Tooling
                  </Link>
                </li>
                <li>
                  <Link href="/docs#mcp" className="hover:text-neutral-900 transition-colors">
                    Cursor MCP Integration
                  </Link>
                </li>
                <li>
                  <Link href="/docs#mcp" className="hover:text-neutral-900 transition-colors">
                    Codex Integration
                  </Link>
                </li>
                <li>
                  <Link href="/agent" className="hover:text-neutral-900 transition-colors">
                    In-App Streaming Agent
                  </Link>
                </li>
              </ul>
            </div>

            {/* Deployment */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-[#0F3D2E]">Deployment</p>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <Link
                    href="/docs#self-hosting"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Cloudflare Workers Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs#self-hosting"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    OpenNext Adapter
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs#self-hosting"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Docker Compose (SQLite)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs#self-hosting"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    PostgreSQL Standalone
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs#self-hosting"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Cloudflare D1 &amp; SQLite
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-[#0F3D2E]">Resources</p>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <Link href="/docs#byok" className="hover:text-neutral-900 transition-colors">
                    BYOK DataForSEO Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs#agent-skills"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Agent Skills Plugin
                  </Link>
                </li>
                <li>
                  <a
                    href="/api/healthz"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Healthcheck (<code>/api/healthz</code>)
                  </a>
                </li>
                <li>
                  <Link href="/docs#byok" className="hover:text-neutral-900 transition-colors">
                    Cost Tracking &amp; Cache
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-neutral-900 transition-colors font-semibold text-[#0F3D2E]"
                  >
                    All Documentation &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            {/* Open Source */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-[#0F3D2E]">Open Source</p>
              <ul className="space-y-2 text-neutral-600">
                <li>
                  <a
                    href="https://github.com/Ibrahist/neemSEO"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Ibrahist/neemSEO/blob/main/LICENSE"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    MIT License
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Ibrahist/neemSEO/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Issue Tracker
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Ibrahist/neemSEO/releases"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Release Notes
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#ded9d2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-3">
              <Logo size={24} showText={true} />
              <span className="text-neutral-400">·</span>
              <span>Open-Source, Self-Hostable SEO Platform</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-600">
              <a
                href="https://github.com/Ibrahist/neemSEO"
                target="_blank"
                rel="noreferrer"
                className="hover:text-neutral-900 flex items-center gap-1"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
              <Link href="/api/healthz" className="hover:text-neutral-900">
                System Health
              </Link>
              <span>© 2026 neemSEO. MIT License.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <a
        href="https://github.com/Ibrahist/neemSEO"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#0F3D2E] px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-[#0A291F] transition-all hover:scale-105"
      >
        <Github className="h-4 w-4 text-[#8CC63F]" />
        <span>neemSEO on GitHub</span>
        <ArrowUpRight className="h-3 w-3 opacity-60" />
      </a>
    </>
  );
}
