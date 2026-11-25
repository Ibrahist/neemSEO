"use client";

import * as React from "react";
import { Copy, Check, Terminal, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function McpSection() {
  const [copied, setCopied] = React.useState(false);
  const [activeClient, setActiveClient] = React.useState("Claude Code");

  const mcpConfig = `{
  "mcpServers": {
    "neemseo": {
      "url": "https://your-domain.com/api/mcp"
    }
  }
}`;

  const copyConfig = () => {
    navigator.clipboard.writeText(mcpConfig);
    setCopied(true);
    toast.success("neemSEO MCP configuration copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clients = ["Claude Code", "Cursor", "Codex", "ChatGPT", "OpenRouter"];

  return (
    <section className="py-16 max-w-[1120px] mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0F3D2E]">
          Supercharge your agents with neemSEO MCP
        </h2>
        <p className="mt-3 text-base text-[#57534e]">
          Expose keyword research, rank tracking, site audits, and competitor gaps as typed tools at{" "}
          <code>/api/mcp</code>.
        </p>
      </div>

      {/* Quick Command Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-[#ded9d2] bg-white shadow-xs">
          <p className="font-mono text-xs font-semibold text-[#8CC63F]">neemseo_search_keywords</p>
          <p className="mt-1 text-xs text-neutral-600">
            Search volume, keyword difficulty &amp; CPC.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#ded9d2] bg-white shadow-xs">
          <p className="font-mono text-xs font-semibold text-[#8CC63F]">neemseo_run_site_audit</p>
          <p className="mt-1 text-xs text-neutral-600">
            SSRF-safe crawl with health score &amp; issue list.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#ded9d2] bg-white shadow-xs">
          <p className="font-mono text-xs font-semibold text-[#8CC63F]">neemseo_get_keyword_gap</p>
          <p className="mt-1 text-xs text-neutral-600">
            Compare ranking keyword overlap with rivals.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#ded9d2] bg-white shadow-xs">
          <p className="font-mono text-xs font-semibold text-[#8CC63F]">
            neemseo_check_ai_visibility
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Track citations across ChatGPT, Claude &amp; Perplexity.
          </p>
        </div>
      </div>

      {/* Client Selector & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          {clients.map((client) => (
            <button
              key={client}
              onClick={() => setActiveClient(client)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeClient === client
                  ? "bg-[#0F3D2E] text-white shadow-xs"
                  : "bg-white text-neutral-700 border border-[#ded9d2] hover:bg-neutral-50"
              }`}
            >
              {client}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copyConfig}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ded9d2] bg-white text-xs font-semibold text-neutral-800 hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>Copy MCP Config</span>
          </button>
          <a
            href="https://cursor.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ded9d2] bg-white text-xs font-medium text-neutral-800 hover:bg-neutral-50 shadow-xs"
          >
            <span>Add to Cursor</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        </div>
      </div>

      {/* Code Terminal Box */}
      <div className="rounded-2xl border border-[#2e2a24] bg-[#1a1714] text-[#e5e0d8] shadow-2xl overflow-hidden font-mono text-xs leading-relaxed">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e2a24] bg-[#151311]">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-2 text-neutral-400 text-[11px] flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-[#8CC63F]" /> claude · neemseo mcp server
            </span>
          </div>
          <span className="text-[11px] text-emerald-400">● 200 OK via /api/mcp</span>
        </div>

        {/* Terminal Content */}
        <div className="p-6 space-y-4">
          <div className="text-neutral-400">
            <span className="text-[#8CC63F] font-bold">›</span> call tool:{" "}
            <span className="text-white font-semibold">neemseo_search_keywords</span> seed:{" "}
            <span className="text-[#8CC63F]">&quot;self hosted seo platform&quot;</span>
          </div>

          <div className="space-y-1">
            <div className="text-neutral-400 flex items-center gap-2">
              <span className="text-[#8CC63F]">⏺</span> DataForSEO live keyword lookup executed
            </div>
            <div className="overflow-x-auto pt-2">
              <div className="min-w-[500px] text-neutral-300">
                <div className="grid grid-cols-4 pb-2 border-b border-neutral-700/60 text-neutral-500 font-semibold text-[11px]">
                  <span>Keyword</span>
                  <span className="text-right">Volume</span>
                  <span className="text-right">KD</span>
                  <span className="text-right">Intent</span>
                </div>
                <div className="grid grid-cols-4 py-1.5 border-b border-neutral-800/40">
                  <span className="text-white font-medium">self hosted seo platform</span>
                  <span className="text-right text-[#8CC63F] font-semibold">1,450</span>
                  <span className="text-right text-neutral-400">12</span>
                  <span className="text-right text-neutral-400">Informational</span>
                </div>
                <div className="grid grid-cols-4 py-1.5 border-b border-neutral-800/40">
                  <span className="text-white font-medium">open source rank tracking</span>
                  <span className="text-right text-[#8CC63F] font-semibold">720</span>
                  <span className="text-right text-neutral-400">9</span>
                  <span className="text-right text-neutral-400">Commercial</span>
                </div>
                <div className="grid grid-cols-4 py-1.5 border-b border-neutral-800/40">
                  <span className="text-white font-medium">pay as you go ahrefs</span>
                  <span className="text-right text-[#8CC63F] font-semibold">480</span>
                  <span className="text-right text-neutral-400">14</span>
                  <span className="text-right text-neutral-400">Transactional</span>
                </div>
                <div className="grid grid-cols-4 py-1.5">
                  <span className="text-white font-medium">semrush alternative open</span>
                  <span className="text-right text-[#8CC63F] font-semibold">390</span>
                  <span className="text-right text-neutral-400">8</span>
                  <span className="text-right text-neutral-400">Navigational</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 space-y-1 text-xs">
            <p className="text-neutral-400 flex items-center gap-1.5">
              <span className="text-[#8CC63F]">✓</span> Wholesale Cost:{" "}
              <span className="text-white font-semibold">$0.0075</span> logged to{" "}
              <code>api_usage_logs</code>.
            </p>
            <p className="text-neutral-400 flex items-center gap-1.5">
              <span className="text-[#8CC63F]">✓</span> Cached response in <code>api_cache</code>{" "}
              (0ms repeat latency, $0.00 re-query fee).
            </p>
            <p className="text-neutral-400 flex items-center gap-1.5">
              <span className="text-[#8CC63F]">↳</span> Live dashboard:{" "}
              <span className="text-white underline">localhost:3000/projects</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
