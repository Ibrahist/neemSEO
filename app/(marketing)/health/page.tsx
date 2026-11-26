import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { getSystemHealth } from "@/lib/health";
import {
  CheckCircle2,
  AlertCircle,
  Database,
  Server,
  Terminal,
  ShieldCheck,
  ExternalLink,
  Activity,
  Cpu,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Health & Uptime Status - neemSEO",
  description: "Real-time system health, database latency, and runtime diagnostics for neemSEO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HealthPage() {
  const health = await getSystemHealth();

  const isHealthy = health.status === "healthy";
  const hours = Math.floor(health.uptimeSeconds / 3600);
  const minutes = Math.floor((health.uptimeSeconds % 3600) / 60);

  return (
    <div className="min-h-screen bg-[#ebe7e1] py-3 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 flex justify-center items-start font-sans selection:bg-[#8CC63F]/30 selection:text-[#0F3D2E]">
      <div className="w-full max-w-[1240px] bg-[#f5f1ec] border border-[#ded9d2] rounded-2xl sm:rounded-3xl shadow-xl shadow-neutral-900/5 overflow-hidden flex flex-col">
        {/* Navigation Bar */}
        <Navbar />

        {/* Health Dashboard Body */}
        <main className="flex-1 px-6 sm:px-12 py-12 max-w-5xl mx-auto w-full space-y-10">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[#ded9d2]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#0F3D2E] text-xs font-semibold mb-3">
                <span className="h-2 w-2 rounded-full bg-[#8CC63F] animate-pulse" />
                <span>Live System Health Probe</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F3D2E]">
                System Status: {isHealthy ? "All Systems Operational" : "Degraded Performance"}
              </h1>
              <p className="mt-2 text-sm text-[#57534e]">
                Live runtime diagnostics, database latency metrics, and API endpoint availability.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/api/healthz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#ded9d2] bg-white text-xs font-semibold text-neutral-800 hover:bg-neutral-50 shadow-2xs transition-colors"
              >
                <span>Raw JSON (/api/healthz)</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3D2E] text-white text-xs font-semibold hover:bg-[#0A291F] shadow-xs transition-colors"
              >
                <span>Open Platform</span>
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-[#ded9d2] bg-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Database Status
                </span>
                <Database className="h-4 w-4 text-[#8CC63F]" />
              </div>
              <div className="text-2xl font-bold text-[#0F3D2E] capitalize">
                {health.database.status}
              </div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    health.database.status === "connected" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <span>Dialect: {health.database.dialect}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[#ded9d2] bg-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Query Latency
                </span>
                <Activity className="h-4 w-4 text-[#8CC63F]" />
              </div>
              <div className="text-2xl font-bold text-[#0F3D2E]">
                {health.database.latencyMs} ms
              </div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>SELECT 1 verification</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[#ded9d2] bg-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Runtime Engine
                </span>
                <Server className="h-4 w-4 text-[#8CC63F]" />
              </div>
              <div className="text-2xl font-bold text-[#0F3D2E] capitalize">{health.runtime}</div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Dual-Dialect Engine</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[#ded9d2] bg-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Process Uptime
                </span>
                <Cpu className="h-4 w-4 text-[#8CC63F]" />
              </div>
              <div className="text-2xl font-bold text-[#0F3D2E]">
                {hours}h {minutes}m
              </div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Version {health.version} (MIT)</span>
              </div>
            </div>
          </div>

          {/* Subsystem Availability Table */}
          <div className="rounded-2xl border border-[#ded9d2] bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#ded9d2] bg-[#faf8f5] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F3D2E]">
                Subsystem Availability &amp; Checks
              </h2>
              <span className="text-xs text-neutral-500">Evaluated in real time</span>
            </div>
            <div className="divide-y divide-[#ded9d2] text-xs">
              <div className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#0F3D2E] text-sm">
                    Primary Storage &amp; Database
                  </div>
                  <div className="text-neutral-500">
                    Dual-dialect SQLite file storage &amp; PostgreSQL driver compatibility.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {health.database.status === "connected" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Operational
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5" /> Connection Failed
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#0F3D2E] text-sm">
                    neemSEO Model Context Protocol (MCP) Server
                  </div>
                  <div className="text-neutral-500">
                    Exposes 14 typed SEO tools at <code>/api/mcp</code> for Claude, Cursor, and
                    Codex.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                  </span>
                </div>
              </div>

              <div className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#0F3D2E] text-sm">
                    SSRF-Protected Site Audit Crawler
                  </div>
                  <div className="text-neutral-500">
                    Blocks private IPv4/IPv6, loopback, and cloud metadata (169.254.169.254).
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Protected
                  </span>
                </div>
              </div>

              <div className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#0F3D2E] text-sm">
                    DataForSEO BYOK API Gateway
                  </div>
                  <div className="text-neutral-500">
                    Direct wholesale vendor integration with 7-day automated SHA-256 caching.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {health.services.dataforseo.configured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5" /> Key Required
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#0F3D2E] text-sm">Autonomous In-App AI Agent</div>
                  <div className="text-neutral-500">
                    LLM reasoning via OpenRouter ({health.services.aiAgent.model}).
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {health.services.aiAgent.configured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 font-semibold text-[11px]">
                      Optional Key
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostics Log Console */}
          <div className="rounded-2xl border border-[#ded9d2] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F3D2E]">
                <Terminal className="h-4 w-4 text-[#8CC63F]" />
                <span>Runtime Configuration Snapshot</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">live probe</span>
            </div>

            <div className="bg-[#1c2420] text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-1.5 leading-relaxed">
              <div>&gt; neemseo --version: 0.1.0</div>
              <div>&gt; runtime.target: {health.runtime}</div>
              <div>&gt; database.dialect: {health.database.dialect}</div>
              <div>&gt; database.status: {health.database.status}</div>
              <div>&gt; database.latency: {health.database.latencyMs}ms</div>
              <div>&gt; dataforseo.status: {health.services.dataforseo.status}</div>
              <div>
                &gt; ai.reasoning:{" "}
                {health.services.aiAgent.configured
                  ? `live (${health.services.aiAgent.model})`
                  : "offline"}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
