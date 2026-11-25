import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Bot, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-neutral-800 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-neutral-950 font-bold text-lg shadow">
            N
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            neem<span className="text-emerald-400">SEO</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/projects">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-semibold">
              Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-8">
          <Zap className="h-3.5 w-3.5" /> Open-Source & Self-Hostable SEO Platform
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15]">
          Stop paying \$130+/mo for bloated SEO tools.
        </h1>

        <p className="mt-6 text-xl text-neutral-400 max-w-2xl font-normal leading-relaxed">
          neemSEO is a modern, pay-as-you-go alternative to Semrush and Ahrefs. Bring your own
          DataForSEO API key and pay pennies per query. Zero markups. AI Agent-ready via MCP.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/projects">
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-8 h-12 text-base"
            >
              Launch App
            </Button>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-700 bg-neutral-800/80 px-6 text-sm font-medium hover:bg-neutral-800 text-neutral-200 transition-colors"
          >
            GitHub Repository
          </a>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60">
            <Database className="h-6 w-6 text-emerald-400 mb-4" />
            <h3 className="font-semibold text-lg text-white mb-2">BYOK Pricing</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Direct DataForSEO integration. Pay strictly what the API charges (fraction of a cent
              per keyword). Responses are cached in your local DB.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60">
            <Bot className="h-6 w-6 text-emerald-400 mb-4" />
            <h3 className="font-semibold text-lg text-white mb-2">Native MCP Server</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Connect Claude, ChatGPT, Cursor, and Codex directly to your SEO data via the typed
              Model Context Protocol at <code className="text-emerald-400">/api/mcp</code>.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60">
            <ShieldCheck className="h-6 w-6 text-emerald-400 mb-4" />
            <h3 className="font-semibold text-lg text-white mb-2">Runs Anywhere</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Deploy serverless to Cloudflare Workers with D1, or run in Docker with
              PostgreSQL/SQLite. Dual-dialect Drizzle ORM handles both.
            </p>
          </div>
        </div>

        {/* Workflows */}
        <div className="mt-20 w-full text-left p-8 rounded-2xl border border-neutral-800 bg-neutral-950">
          <h2 className="text-xl font-bold text-white mb-4">6 Focused Workflows (No Bloat)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Keyword Research:</strong> Volume, KD, intent, related keywords
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Rank Tracking:</strong> Historical positions, SERP movements
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Competitor Insights:</strong> Organic keywords & content gaps
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Backlinks:</strong> Referring domains & link velocity
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Site Audits:</strong> SSRF-safe crawling & ranked issues
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>AI Visibility:</strong> Brand citations in answer engines
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 text-center text-xs text-neutral-500">
        neemSEO • Free & Open-Source under MIT License
      </footer>
    </div>
  );
}
