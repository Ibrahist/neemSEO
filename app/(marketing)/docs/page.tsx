import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Terminal, Server, Cpu, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Documentation & Resources - neemSEO",
  description:
    "Comprehensive guides for self-hosting, MCP server configuration, agent skills, and DataForSEO BYOK setup.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#ebe7e1] py-3 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 flex justify-center items-start font-sans selection:bg-[#8CC63F]/30 selection:text-[#0F3D2E]">
      <div className="w-full max-w-[1240px] bg-[#f5f1ec] border border-[#ded9d2] rounded-2xl sm:rounded-3xl shadow-xl shadow-neutral-900/5 overflow-hidden flex flex-col">
        {/* Navigation Bar */}
        <Navbar />

        {/* Documentation Content */}
        <main className="flex-1 px-6 sm:px-12 py-12 max-w-5xl mx-auto w-full space-y-16">
          {/* Header */}
          <div className="border-b border-[#ded9d2] pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#0F3D2E] text-xs font-semibold mb-4">
              <span>Developer Resources &amp; Guides</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F3D2E]">
              neemSEO Documentation
            </h1>
            <p className="mt-3 text-base text-[#57534e] max-w-2xl leading-relaxed">
              Complete reference for self-hosting with Docker or Cloudflare Workers, integrating
              with Claude and Cursor over MCP, and managing DataForSEO wholesale API keys.
            </p>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="#self-hosting"
              className="p-5 rounded-2xl border border-[#ded9d2] bg-white hover:border-[#0F3D2E] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F3D2E] text-sm">Self-Hosting</h3>
                <p className="text-xs text-neutral-500 mt-1">Docker Compose &amp; Cloudflare</p>
              </div>
              <span className="text-xs font-semibold text-[#0F3D2E] mt-4 flex items-center gap-1">
                Read guide &rarr;
              </span>
            </a>

            <a
              href="#mcp"
              className="p-5 rounded-2xl border border-[#ded9d2] bg-white hover:border-[#0F3D2E] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-3">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F3D2E] text-sm">MCP Server</h3>
                <p className="text-xs text-neutral-500 mt-1">Claude Code, Cursor &amp; Codex</p>
              </div>
              <span className="text-xs font-semibold text-[#0F3D2E] mt-4 flex items-center gap-1">
                Read guide &rarr;
              </span>
            </a>

            <a
              href="#agent-skills"
              className="p-5 rounded-2xl border border-[#ded9d2] bg-white hover:border-[#0F3D2E] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-3">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F3D2E] text-sm">Agent Skills</h3>
                <p className="text-xs text-neutral-500 mt-1">Autonomous workflows</p>
              </div>
              <span className="text-xs font-semibold text-[#0F3D2E] mt-4 flex items-center gap-1">
                Read guide &rarr;
              </span>
            </a>

            <a
              href="#byok"
              className="p-5 rounded-2xl border border-[#ded9d2] bg-white hover:border-[#0F3D2E] transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F3D2E] text-sm">DataForSEO BYOK</h3>
                <p className="text-xs text-neutral-500 mt-1">API keys &amp; cost tracking</p>
              </div>
              <span className="text-xs font-semibold text-[#0F3D2E] mt-4 flex items-center gap-1">
                Read guide &rarr;
              </span>
            </a>
          </div>

          {/* Section 1: Self-Hosting Guide */}
          <section
            id="self-hosting"
            className="space-y-6 scroll-mt-24 border-t border-[#ded9d2] pt-12"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F3D2E]">Self-Hosting Guides</h2>
            </div>
            <p className="text-sm text-[#57534e] leading-relaxed">
              neemSEO can be deployed anywhere with zero external dependencies. Choose between local
              Docker Compose with SQLite/Postgres or serverless deployment on Cloudflare Workers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-[#ded9d2] bg-white space-y-4">
                <h3 className="text-lg font-bold text-[#0F3D2E] flex items-center gap-2">
                  <Server className="h-4 w-4 text-[#8CC63F]" /> Option A: Docker Compose (SQLite)
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Recommended for single-node setups. Persistent SQLite database mounted at{" "}
                  <code>/app/data/neemseo.sqlite</code>.
                </p>
                <div className="rounded-xl bg-[#1a1714] text-neutral-200 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                  <p className="text-neutral-500"># 1. Clone repository</p>
                  <p className="text-[#8CC63F]">
                    git clone https://github.com/Ibrahist/neemSEO.git
                  </p>
                  <p className="text-[#8CC63F]">cd neemSEO</p>
                  <p className="text-neutral-500 mt-2"># 2. Start container</p>
                  <p className="text-[#8CC63F]">docker compose up -d</p>
                </div>
                <p className="text-xs text-neutral-500">
                  Open <code>http://localhost:3000</code> in your browser. Platform runs 100% free
                  with no login required.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#ded9d2] bg-white space-y-4">
                <h3 className="text-lg font-bold text-[#0F3D2E] flex items-center gap-2">
                  <Server className="h-4 w-4 text-[#8CC63F]" /> Option B: Cloudflare Workers
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Deploy to Cloudflare Edge using OpenNext and Cloudflare D1 for zero maintenance
                  and zero cold-starts globally.
                </p>
                <div className="rounded-xl bg-[#1a1714] text-neutral-200 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                  <p className="text-neutral-500"># 1. Build OpenNext package</p>
                  <p className="text-[#8CC63F]">pnpm build:cloudflare</p>
                  <p className="text-neutral-500 mt-2"># 2. Deploy with Wrangler</p>
                  <p className="text-[#8CC63F]">pnpm run deploy</p>
                </div>
                <p className="text-xs text-neutral-500">
                  Detailed documentation available in{" "}
                  <a
                    href="https://github.com/Ibrahist/neemSEO/blob/main/docs/SELF_HOSTING_CLOUDFLARE.md"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[#0F3D2E] font-medium"
                  >
                    docs/SELF_HOSTING_CLOUDFLARE.md
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: MCP Server */}
          <section id="mcp" className="space-y-6 scroll-mt-24 border-t border-[#ded9d2] pt-12">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F3D2E]">neemSEO MCP Server</h2>
            </div>
            <p className="text-sm text-[#57534e] leading-relaxed">
              neemSEO ships a Model Context Protocol (MCP) server at <code>/api/mcp</code>. AI
              agents in Claude Code, Cursor, Codex, and OpenRouter can directly execute SEO
              workflows.
            </p>

            <div className="rounded-2xl border border-[#ded9d2] bg-white p-6 space-y-4">
              <h3 className="font-bold text-[#0F3D2E] text-base">
                Claude Code &amp; Cursor Configuration
              </h3>
              <p className="text-xs text-neutral-600">
                Add this configuration to your <code>claude_desktop_config.json</code> or Cursor
                settings:
              </p>
              <pre className="rounded-xl bg-[#1a1714] text-neutral-200 p-4 font-mono text-xs overflow-x-auto">
                {`{
  "mcpServers": {
    "neemseo": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}`}
              </pre>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="/api/mcp"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3D2E] text-white text-xs font-semibold hover:bg-[#0A291F] transition-colors"
                >
                  <Terminal className="h-3.5 w-3.5 text-[#8CC63F]" />
                  <span>Inspect Live /api/mcp Endpoint</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          </section>

          {/* Section 3: Agent Skills */}
          <section
            id="agent-skills"
            className="space-y-6 scroll-mt-24 border-t border-[#ded9d2] pt-12"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F3D2E]">Agent Skills Plugin</h2>
            </div>
            <p className="text-sm text-[#57534e] leading-relaxed">
              Reusable skill guides are stored in <code>plugins/neemseo/skills/</code>. Synchronize
              manifests across Claude, Codex, and Cursor with a single command.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#ded9d2] bg-white text-xs space-y-1.5">
                <span className="font-bold text-[#0F3D2E]">keyword-research.md</span>
                <p className="text-neutral-500">
                  Seed keyword volume, difficulty &amp; CPC intent.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#ded9d2] bg-white text-xs space-y-1.5">
                <span className="font-bold text-[#0F3D2E]">rank-tracking.md</span>
                <p className="text-neutral-500">Domain keyword rankings &amp; SERP history.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#ded9d2] bg-white text-xs space-y-1.5">
                <span className="font-bold text-[#0F3D2E]">technical-audit.md</span>
                <p className="text-neutral-500">SSRF-protected site audit with 0-100 score.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#ded9d2] bg-white text-xs space-y-1.5">
                <span className="font-bold text-[#0F3D2E]">keyword-gap.md</span>
                <p className="text-neutral-500">Competitor organic overlap &amp; gap keywords.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#ded9d2] bg-white text-xs space-y-1.5">
                <span className="font-bold text-[#0F3D2E]">backlink-profile.md</span>
                <p className="text-neutral-500">
                  Referring domains, authority &amp; link velocity.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#ded9d2] bg-white text-xs space-y-1.5">
                <span className="font-bold text-[#0F3D2E]">ai-visibility.md</span>
                <p className="text-neutral-500">
                  Brand mentions across ChatGPT, Claude &amp; Perplexity.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: DataForSEO BYOK Guide */}
          <section id="byok" className="space-y-6 scroll-mt-24 border-t border-[#ded9d2] pt-12">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F3D2E]">
                DataForSEO BYOK &amp; Wholesale Rates
              </h2>
            </div>
            <p className="text-sm text-[#57534e] leading-relaxed">
              neemSEO connects directly to DataForSEO APIs with zero subscription markups. You pay
              only for the queries you actually execute.
            </p>
            <div className="rounded-2xl border border-[#ded9d2] bg-white overflow-hidden text-xs">
              <div className="grid grid-cols-3 p-3.5 bg-neutral-100 font-bold text-[#0F3D2E] border-b border-[#ded9d2]">
                <span>Operation</span>
                <span>DataForSEO API Endpoint</span>
                <span className="text-right">Estimated Cost</span>
              </div>
              <div className="divide-y divide-neutral-100">
                <div className="grid grid-cols-3 p-3.5">
                  <span className="font-semibold text-neutral-800">
                    Keyword Search Volume &amp; CPC
                  </span>
                  <span className="font-mono text-neutral-500">
                    /v3/dataforseo_labs/google/keyword_ideas/live
                  </span>
                  <span className="text-right font-mono font-semibold text-emerald-700">
                    $0.010
                  </span>
                </div>
                <div className="grid grid-cols-3 p-3.5">
                  <span className="font-semibold text-neutral-800">SERP Rank Position</span>
                  <span className="font-mono text-neutral-500">
                    /v3/serp/google/organic/live/regular
                  </span>
                  <span className="text-right font-mono font-semibold text-emerald-700">
                    $0.002
                  </span>
                </div>
                <div className="grid grid-cols-3 p-3.5">
                  <span className="font-semibold text-neutral-800">Competitor Ranked Keywords</span>
                  <span className="font-mono text-neutral-500">
                    /v3/dataforseo_labs/google/ranked_keywords/live
                  </span>
                  <span className="text-right font-mono font-semibold text-emerald-700">
                    $0.010
                  </span>
                </div>
                <div className="grid grid-cols-3 p-3.5">
                  <span className="font-semibold text-neutral-800">
                    Backlinks Summary &amp; Anchors
                  </span>
                  <span className="font-mono text-neutral-500">/v3/backlinks/summary/live</span>
                  <span className="text-right font-mono font-semibold text-emerald-700">
                    $0.020
                  </span>
                </div>
                <div className="grid grid-cols-3 p-3.5">
                  <span className="font-semibold text-neutral-800">Technical Site Audit</span>
                  <span className="text-neutral-500">Built-in SSRF-safe Crawler</span>
                  <span className="text-right font-mono font-bold text-emerald-700">
                    $0.000 (Free)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: System Health */}
          <section
            id="health"
            className="space-y-6 scroll-mt-24 border-t border-[#ded9d2] pt-12 pb-8"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F3D2E]">
                System Health &amp; Diagnostics
              </h2>
            </div>
            <p className="text-sm text-[#57534e] leading-relaxed">
              Verify database connectivity, runtime environment, and API health in real time via{" "}
              <code>/api/healthz</code>.
            </p>
            <div className="p-6 rounded-2xl border border-[#ded9d2] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-[#0F3D2E] block">
                  Automated Healthcheck Probe
                </span>
                <span className="text-xs text-neutral-500">
                  Returns JSON health status, timestamp, and database dialect.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/health"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3D2E] text-white text-xs font-semibold hover:bg-[#0A291F] transition-colors shrink-0"
                >
                  <ShieldCheck className="h-4 w-4 text-[#8CC63F]" />
                  <span>Open System Health Dashboard</span>
                </Link>
                <a
                  href="/api/healthz"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#ded9d2] bg-white text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors shrink-0"
                >
                  <span>Raw JSON (/api/healthz)</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
