"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, Check, Terminal, ExternalLink, Bot, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ClientData {
  id: string;
  name: string;
  badge: string;
  description: string;
  associatedTool: string;
  configText: string;
  primaryActionLabel: string;
  primaryActionCopyText: string;
  secondaryAction?: {
    label: string;
    href: string;
    external?: boolean;
  };
  terminalHeader: string;
  terminalStatus: string;
  commandPrompt: string;
  subtext: string;
  renderTerminalOutput: () => React.ReactNode;
  footerStats: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
}

const CLIENT_DATA: Record<string, ClientData> = {
  "Claude Code": {
    id: "claude-code",
    name: "Claude Code",
    badge: "Anthropic CLI",
    description:
      "Connect Claude Code CLI directly to neemSEO for keyword research, SERP queries, and site data.",
    associatedTool: "neemseo_search_keywords",
    configText: "claude mcp add neemseo http://localhost:3000/api/mcp",
    primaryActionLabel: "Copy CLI Command",
    primaryActionCopyText: "claude mcp add neemseo http://localhost:3000/api/mcp",
    secondaryAction: {
      label: "Test /api/mcp",
      href: "/api/mcp",
      external: true,
    },
    terminalHeader: "claude-code · neemseo mcp server",
    terminalStatus: "● 200 OK via /api/mcp",
    commandPrompt: 'claude › neemseo_search_keywords seed: "self hosted seo platform"',
    subtext: "DataForSEO live keyword lookup executed",
    renderTerminalOutput: () => (
      <div className="overflow-x-auto pt-2">
        <div className="min-w-[520px] text-neutral-300">
          <div className="grid grid-cols-5 pb-2 border-b border-neutral-700/60 text-neutral-500 font-semibold text-[11px]">
            <span className="col-span-2">Keyword</span>
            <span className="text-right">Volume</span>
            <span className="text-right">KD</span>
            <span className="text-right">Intent</span>
          </div>
          <div className="grid grid-cols-5 py-1.5 border-b border-neutral-800/40 text-[11px]">
            <span className="col-span-2 text-white font-medium">self hosted seo platform</span>
            <span className="text-right text-[#8CC63F] font-semibold">1,450</span>
            <span className="text-right text-neutral-400">12</span>
            <span className="text-right text-emerald-400">Informational</span>
          </div>
          <div className="grid grid-cols-5 py-1.5 border-b border-neutral-800/40 text-[11px]">
            <span className="col-span-2 text-white font-medium">open source rank tracking</span>
            <span className="text-right text-[#8CC63F] font-semibold">720</span>
            <span className="text-right text-neutral-400">9</span>
            <span className="text-right text-blue-400">Commercial</span>
          </div>
          <div className="grid grid-cols-5 py-1.5 border-b border-neutral-800/40 text-[11px]">
            <span className="col-span-2 text-white font-medium">automated site audit tool</span>
            <span className="text-right text-[#8CC63F] font-semibold">580</span>
            <span className="text-right text-neutral-400">14</span>
            <span className="text-right text-amber-400">Transactional</span>
          </div>
          <div className="grid grid-cols-5 py-1.5 text-[11px]">
            <span className="col-span-2 text-white font-medium">ai search visibility agent</span>
            <span className="text-right text-[#8CC63F] font-semibold">410</span>
            <span className="text-right text-neutral-400">7</span>
            <span className="text-right text-purple-400">Navigational</span>
          </div>
        </div>
      </div>
    ),
    footerStats: [
      {
        icon: "✓",
        label: "Wholesale Cost:",
        value: "$0.0075 logged to api_usage_logs",
      },
      {
        icon: "✓",
        label: "Cached Response:",
        value: "api_cache hit (0ms repeat latency, $0.00 fee)",
      },
      {
        icon: "↳",
        label: "Live Workspace:",
        value: "localhost:3000/projects",
      },
    ],
  },
  Cursor: {
    id: "cursor",
    name: "Cursor",
    badge: "AI Code Editor",
    description:
      "Run SSRF-protected technical crawls and audit your codebase's live deployment directly inside Cursor.",
    associatedTool: "neemseo_run_site_audit",
    configText: `{\n  "mcpServers": {\n    "neemseo": {\n      "url": "http://localhost:3000/api/mcp"\n    }\n  }\n}`,
    primaryActionLabel: "Copy Cursor JSON",
    primaryActionCopyText: `{\n  "mcpServers": {\n    "neemseo": {\n      "url": "http://localhost:3000/api/mcp"\n    }\n  }\n}`,
    secondaryAction: {
      label: "Cursor Setup Docs",
      href: "/docs#mcp",
    },
    terminalHeader: "cursor-agent · neemseo mcp server",
    terminalStatus: "● 200 OK via /api/mcp",
    commandPrompt: 'cursor-agent › neemseo_run_site_audit url: "https://my-app.dev" maxPages: 25',
    subtext: "SSRF-safe crawler executed (RFC 1918 & cloud metadata blocked)",
    renderTerminalOutput: () => (
      <div className="space-y-3 pt-2 text-[11px]">
        <div className="p-3 rounded-lg bg-black/40 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Technical Health Score</span>
            <span className="text-base font-bold text-[#8CC63F]">96 / 100</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#8CC63F] h-full rounded-full" style={{ width: "96%" }} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div className="text-neutral-400 text-[10px]">Pages Scanned</div>
            <div className="text-sm font-semibold text-white mt-0.5">25 / 25</div>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div className="text-neutral-400 text-[10px]">Critical 404s</div>
            <div className="text-sm font-semibold text-emerald-400 mt-0.5">0 Clean</div>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div className="text-neutral-400 text-[10px]">Warnings</div>
            <div className="text-sm font-semibold text-amber-400 mt-0.5">2 Alt Tags</div>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div className="text-neutral-400 text-[10px]">SSRF Security</div>
            <div className="text-sm font-semibold text-emerald-400 mt-0.5">100% Passed</div>
          </div>
        </div>
        <div className="text-neutral-400 text-[11px] leading-relaxed">
          <span className="text-amber-400 font-semibold">Notice:</span> 2 images on{" "}
          <code className="text-neutral-300">/blog/release-notes</code> lack descriptive{" "}
          <code className="text-neutral-300">alt</code> text. Fixed in AST preview.
        </div>
      </div>
    ),
    footerStats: [
      {
        icon: "✓",
        label: "Crawler Boundary:",
        value: "Protected against 127.0.0.1, 10.0.0.0/8, 169.254.169.254",
      },
      {
        icon: "✓",
        label: "Audit Persistence:",
        value: "Saved to audit_runs table scoped to current organization",
      },
      {
        icon: "↳",
        label: "Audit View:",
        value: "localhost:3000/projects/default/audits",
      },
    ],
  },
  Codex: {
    id: "codex",
    name: "Codex",
    badge: "Agent Skills & Plugins",
    description:
      "Equip coding agents with reusable SEO skills to detect ranking keyword gaps against competitors.",
    associatedTool: "neemseo_get_keyword_gap",
    configText: `{\n  "name": "neemseo",\n  "version": "0.1.0",\n  "mcp": {\n    "url": "http://localhost:3000/api/mcp"\n  },\n  "skills": [\n    "keyword-gap",\n    "technical-audit",\n    "rank-tracking"\n  ]\n}`,
    primaryActionLabel: "Copy Codex JSON",
    primaryActionCopyText: `{\n  "name": "neemseo",\n  "version": "0.1.0",\n  "mcp": {\n    "url": "http://localhost:3000/api/mcp"\n  },\n  "skills": [\n    "keyword-gap",\n    "technical-audit",\n    "rank-tracking"\n  ]\n}`,
    secondaryAction: {
      label: "View Agent Skills",
      href: "/docs#agent-skills",
    },
    terminalHeader: "codex-agent · neemseo mcp server",
    terminalStatus: "● 200 OK via /api/mcp",
    commandPrompt:
      'codex › neemseo_get_keyword_gap target: "my-app.dev" competitor: "benchmark.com"',
    subtext: "Competitor keyword gap analysis computed via organic index",
    renderTerminalOutput: () => (
      <div className="space-y-3 pt-2 text-[11px]">
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-5 pb-2 border-b border-neutral-700/60 text-neutral-500 font-semibold">
              <span className="col-span-2">High-Opportunity Gap</span>
              <span className="text-right">Their Rank</span>
              <span className="text-right">Volume</span>
              <span className="text-right">Difficulty</span>
            </div>
            <div className="grid grid-cols-5 py-1.5 border-b border-neutral-800/40">
              <span className="col-span-2 text-white font-medium">developer seo tool</span>
              <span className="text-right text-emerald-400 font-semibold">#3</span>
              <span className="text-right text-[#8CC63F]">1,900</span>
              <span className="text-right text-neutral-400">11 KD (Low)</span>
            </div>
            <div className="grid grid-cols-5 py-1.5 border-b border-neutral-800/40">
              <span className="col-span-2 text-white font-medium">self hosted rank tracker</span>
              <span className="text-right text-emerald-400 font-semibold">#5</span>
              <span className="text-right text-[#8CC63F]">1,150</span>
              <span className="text-right text-neutral-400">14 KD (Low)</span>
            </div>
            <div className="grid grid-cols-5 py-1.5">
              <span className="col-span-2 text-white font-medium">api first keyword research</span>
              <span className="text-right text-emerald-400 font-semibold">#7</span>
              <span className="text-right text-[#8CC63F]">640</span>
              <span className="text-right text-neutral-400">8 KD (Easy)</span>
            </div>
          </div>
        </div>
        <div className="text-neutral-400 text-[11px] leading-relaxed border-t border-neutral-800 pt-2">
          <span className="text-[#8CC63F] font-semibold">Action Plan:</span> 3 winnable keywords
          identified where competitor ranks top 10 with KD &lt; 15. Exported to project roadmap.
        </div>
      </div>
    ),
    footerStats: [
      {
        icon: "✓",
        label: "Keyword Overlap:",
        value: "412 shared keywords analyzed across 2 domains",
      },
      {
        icon: "✓",
        label: "Plugin Standard:",
        value: "Syncs with plugins/neemseo/skills/keyword-gap.md",
      },
      {
        icon: "↳",
        label: "Competitor View:",
        value: "localhost:3000/projects/default/competitors",
      },
    ],
  },
  ChatGPT: {
    id: "chatgpt",
    name: "ChatGPT",
    badge: "Custom GPT & Actions",
    description:
      "Import neemSEO MCP into OpenAI Custom Actions to monitor AI brand visibility and citation rankings.",
    associatedTool: "neemseo_check_ai_visibility",
    configText: `{\n  "openapi": "3.1.0",\n  "info": {\n    "title": "neemSEO MCP API",\n    "version": "1.0.0"\n  },\n  "servers": [\n    {\n      "url": "http://localhost:3000/api/mcp"\n    }\n  ]\n}`,
    primaryActionLabel: "Copy Action Schema",
    primaryActionCopyText: `{\n  "openapi": "3.1.0",\n  "info": {\n    "title": "neemSEO MCP API",\n    "version": "1.0.0"\n  },\n  "servers": [\n    {\n      "url": "http://localhost:3000/api/mcp"\n    }\n  ]\n}`,
    secondaryAction: {
      label: "Test /api/mcp",
      href: "/api/mcp",
      external: true,
    },
    terminalHeader: "chatgpt-4o · neemseo custom action",
    terminalStatus: "● 200 OK via /api/mcp",
    commandPrompt:
      'chatgpt › neemseo_check_ai_visibility query: "best developer seo platform" brand: "neemSEO"',
    subtext: "Multi-engine frontier LLM citation analysis executed",
    renderTerminalOutput: () => (
      <div className="space-y-3 pt-2 text-[11px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white font-medium">ChatGPT (GPT-4o)</span>
            </div>
            <span className="text-emerald-400 font-semibold text-xs">Cited #2</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white font-medium">Claude 3.5 Sonnet</span>
            </div>
            <span className="text-emerald-400 font-semibold text-xs">Mentioned Top</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white font-medium">Perplexity AI</span>
            </div>
            <span className="text-emerald-400 font-semibold text-xs">Source Linked</span>
          </div>
          <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white font-medium">Google Gemini</span>
            </div>
            <span className="text-emerald-400 font-semibold text-xs">Category Pick</span>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-black/40 border border-neutral-800 flex items-center justify-between">
          <span className="text-neutral-400">Composite AI Search Visibility Score</span>
          <span className="text-base font-bold text-[#8CC63F]">88 / 100</span>
        </div>
      </div>
    ),
    footerStats: [
      {
        icon: "✓",
        label: "Engines Monitored:",
        value: "OpenAI GPT-4o, Anthropic Claude, Perplexity AI, Google Gemini",
      },
      {
        icon: "✓",
        label: "Citation Extraction:",
        value: "Real-time source link and brand sentiment classification",
      },
      {
        icon: "↳",
        label: "AI Visibility Hub:",
        value: "localhost:3000/projects/default/ai-visibility",
      },
    ],
  },
  OpenRouter: {
    id: "openrouter",
    name: "OpenRouter",
    badge: "Autonomous In-App Agent",
    description:
      "Stream multi-step SEO agent reasoning loops with Claude 3.5 Sonnet or DeepSeek directly in your browser.",
    associatedTool: "neemseo_list_projects",
    configText: `{\n  "provider": "openrouter",\n  "model": "anthropic/claude-3.5-sonnet",\n  "endpoint": "/api/agent/chat",\n  "tools": [\n    "search_keywords",\n    "track_keyword",\n    "run_audit",\n    "check_ai_visibility"\n  ]\n}`,
    primaryActionLabel: "Open In-App Agent",
    primaryActionCopyText: `{\n  "provider": "openrouter",\n  "model": "anthropic/claude-3.5-sonnet",\n  "endpoint": "/api/agent/chat"\n}`,
    secondaryAction: {
      label: "Open /agent Chat",
      href: "/agent",
    },
    terminalHeader: "openrouter-agent · neemseo streaming runtime",
    terminalStatus: "● 200 OK streaming",
    commandPrompt: "openrouter › autonomous SEO reasoning cycle triggered...",
    subtext: "Executing multi-step tool sequence via Vercel AI SDK",
    renderTerminalOutput: () => (
      <div className="space-y-2.5 pt-2 text-[11px]">
        <div className="p-2.5 rounded-lg bg-neutral-900/70 border border-neutral-800 font-mono text-neutral-300">
          <div className="text-[#8CC63F] font-semibold flex items-center gap-1.5">
            <span>Step 1:</span> neemseo_list_projects
          </div>
          <p className="text-neutral-400 mt-0.5 text-[10px]">
            Resolved active project &quot;Default Workspace&quot; (domain: my-app.dev)
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/70 border border-neutral-800 font-mono text-neutral-300">
          <div className="text-[#8CC63F] font-semibold flex items-center gap-1.5">
            <span>Step 2:</span> neemseo_get_rankings
          </div>
          <p className="text-neutral-400 mt-0.5 text-[10px]">
            14 tracked keywords analyzed · 3 in Top 5, 8 in Top 20 (+2 SERP positions this week)
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-900/70 border border-neutral-800 font-mono text-neutral-300">
          <div className="text-[#8CC63F] font-semibold flex items-center gap-1.5">
            <span>Step 3:</span> neemseo_search_keywords &rarr; seed: &quot;privacy first seo&quot;
          </div>
          <p className="text-neutral-400 mt-0.5 text-[10px]">
            Found 4 high-volume low-KD targets · Automatically queued top keyword for tracking
          </p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-200 text-xs">
          <span className="font-semibold text-emerald-300">Agent Summary:</span> &quot;Analyzed rank
          velocity and identified a high-potential content gap. Tracked new term and generated a
          prioritized action list.&quot;
        </div>
      </div>
    ),
    footerStats: [
      {
        icon: "✓",
        label: "Autonomous Pipeline:",
        value: "Projects &rarr; Rankings &rarr; Keyword Research in 1 automated pass",
      },
      {
        icon: "✓",
        label: "BYOK LLMs:",
        value: "Supports Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3 via OpenRouter",
      },
      {
        icon: "↳",
        label: "Agent UI:",
        value: "localhost:3000/agent",
      },
    ],
  },
};

const TOOLS = [
  {
    name: "neemseo_search_keywords",
    desc: "Search volume, keyword difficulty & CPC metrics.",
    clientTarget: "Claude Code",
  },
  {
    name: "neemseo_run_site_audit",
    desc: "SSRF-safe crawl with health score & issue breakdown.",
    clientTarget: "Cursor",
  },
  {
    name: "neemseo_get_keyword_gap",
    desc: "Compare ranking keyword overlap against rivals.",
    clientTarget: "Codex",
  },
  {
    name: "neemseo_check_ai_visibility",
    desc: "Track citations across ChatGPT, Claude & Perplexity.",
    clientTarget: "ChatGPT",
  },
];

export function McpSection() {
  const [activeClient, setActiveClient] = React.useState<string>("Claude Code");
  const [activeView, setActiveView] = React.useState<"terminal" | "config">("terminal");
  const [copiedAction, setCopiedAction] = React.useState(false);
  const [copiedConfig, setCopiedConfig] = React.useState(false);

  const client = CLIENT_DATA[activeClient] || CLIENT_DATA["Claude Code"];

  const handleCopyAction = () => {
    navigator.clipboard.writeText(client.primaryActionCopyText);
    setCopiedAction(true);
    toast.success(`${client.primaryActionLabel} copied to clipboard!`);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(client.configText);
    setCopiedConfig(true);
    toast.success(`${client.name} configuration copied!`);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleToolPillClick = (toolName: string, clientTarget: string) => {
    setActiveClient(clientTarget);
    navigator.clipboard.writeText(toolName);
    toast.success(`Copied "${toolName}" and switched to ${clientTarget}!`);
  };

  return (
    <section className="py-16 max-w-[1120px] mx-auto px-6" id="mcp">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0F3D2E] text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5 text-[#8CC63F]" />
          <span>Model Context Protocol &amp; Autonomous Agents</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0F3D2E]">
          Supercharge your agents with neemSEO MCP
        </h2>
        <p className="mt-3 text-base text-[#57534e]">
          Expose keyword research, rank tracking, SSRF-safe site audits, and AI citation benchmarks
          as typed tools at{" "}
          <code className="text-[#0F3D2E] font-semibold bg-white px-2 py-0.5 rounded border border-[#ded9d2]">
            /api/mcp
          </code>
          .
        </p>
      </div>

      {/* Interactive Tool Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {TOOLS.map((tool) => {
          const isSelected = client.associatedTool === tool.name;
          return (
            <button
              key={tool.name}
              onClick={() => handleToolPillClick(tool.name, tool.clientTarget)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer group ${
                isSelected
                  ? "bg-white border-[#0F3D2E] ring-2 ring-[#0F3D2E]/10 shadow-sm"
                  : "bg-white/80 border-[#ded9d2] hover:bg-white hover:border-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="font-mono text-xs font-semibold text-[#0F3D2E] group-hover:text-[#8CC63F] transition-colors truncate">
                  {tool.name}
                </p>
                <Copy className="h-3 w-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <p className="mt-1 text-xs text-neutral-600 line-clamp-2">{tool.desc}</p>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                <span>Optimized for:</span>
                <span className="text-[#0F3D2E] font-semibold">{tool.clientTarget}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Client Selector & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        {/* Agent Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-neutral-200/60 border border-[#ded9d2]">
          {Object.keys(CLIENT_DATA).map((clientName) => {
            const isCurrent = activeClient === clientName;
            return (
              <button
                key={clientName}
                onClick={() => setActiveClient(clientName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-[#0F3D2E] text-white shadow-xs"
                    : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <span>{clientName}</span>
                {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />}
              </button>
            );
          })}
        </div>

        {/* Action Buttons for Active Agent */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Action Button */}
          {activeClient === "OpenRouter" ? (
            <Link
              href="/agent"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F3D2E] text-white text-xs font-semibold hover:bg-[#16503e] shadow-xs transition-colors"
            >
              <Bot className="h-3.5 w-3.5 text-[#8CC63F]" />
              <span>Open In-App Agent</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <button
              onClick={handleCopyAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F3D2E] text-white text-xs font-semibold hover:bg-[#16503e] shadow-xs transition-colors cursor-pointer"
            >
              {copiedAction ? (
                <Check className="h-3.5 w-3.5 text-[#8CC63F]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{client.primaryActionLabel}</span>
            </button>
          )}

          {/* Secondary Action */}
          {client.secondaryAction &&
            (client.secondaryAction.external ? (
              <a
                href={client.secondaryAction.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ded9d2] bg-white text-xs font-semibold text-neutral-800 hover:bg-neutral-50 shadow-xs transition-colors"
              >
                <span>{client.secondaryAction.label}</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            ) : (
              <Link
                href={client.secondaryAction.href}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ded9d2] bg-white text-xs font-semibold text-neutral-800 hover:bg-neutral-50 shadow-xs transition-colors"
              >
                <span>{client.secondaryAction.label}</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Link>
            ))}
        </div>
      </div>

      {/* Description Banner for Selected Agent */}
      <div className="mb-4 px-4 py-2.5 rounded-xl bg-white border border-[#ded9d2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-[#0F3D2E] font-semibold text-[11px]">
            {client.badge}
          </span>
          <span className="text-neutral-700">{client.description}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px] shrink-0">
          <span>Active Skill:</span>
          <span className="text-[#0F3D2E] font-semibold">{client.associatedTool}</span>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="rounded-2xl border border-[#2e2a24] bg-[#1a1714] text-[#e5e0d8] shadow-2xl overflow-hidden font-mono text-xs leading-relaxed">
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-[#2e2a24] bg-[#151311] gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-2 text-neutral-400 text-[11px] flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-[#8CC63F]" />
              {client.terminalHeader}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-md p-0.5">
              <button
                onClick={() => setActiveView("terminal")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  activeView === "terminal"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Live Output
              </button>
              <button
                onClick={() => setActiveView("config")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  activeView === "config"
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Setup Config
              </button>
            </div>

            <span className="text-[11px] text-emerald-400 font-medium">
              {client.terminalStatus}
            </span>
          </div>
        </div>

        {/* Terminal Content Body */}
        <div className="p-6 space-y-4">
          {activeView === "terminal" ? (
            <>
              {/* Prompt Execution Line */}
              <div className="text-neutral-400">
                <span className="text-[#8CC63F] font-bold">›</span> {client.commandPrompt}
              </div>

              {/* Subtext Status */}
              <div className="space-y-1">
                <div className="text-neutral-400 flex items-center gap-2">
                  <span className="text-[#8CC63F]">⏺</span> {client.subtext}
                </div>

                {/* Rendered Dynamic Terminal Output */}
                {client.renderTerminalOutput()}
              </div>

              {/* Stats & Metadata Footer */}
              <div className="pt-3 border-t border-neutral-800 space-y-1 text-xs">
                {client.footerStats.map((stat, idx) => (
                  <p key={idx} className="text-neutral-400 flex items-center gap-1.5">
                    <span className="text-[#8CC63F] font-semibold">{stat.icon}</span>
                    <span className="text-neutral-300 font-medium">{stat.label}</span>
                    <span className="text-white">{stat.value}</span>
                  </p>
                ))}
              </div>
            </>
          ) : (
            /* Setup Config Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-neutral-400 text-xs pb-2 border-b border-neutral-800">
                <span>Configuration for {client.name}</span>
                <button
                  onClick={handleCopyConfig}
                  className="inline-flex items-center gap-1 text-[11px] text-[#8CC63F] hover:underline cursor-pointer"
                >
                  {copiedConfig ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy snippet</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-black/60 border border-neutral-800 text-[#8CC63F] overflow-x-auto text-xs leading-relaxed font-mono">
                <code>{client.configText}</code>
              </pre>

              <div className="text-neutral-400 text-xs space-y-1">
                <p>
                  <span className="text-[#8CC63F]">💡 Tip:</span> All neemSEO MCP tools authenticate
                  using session cookies or Bearer API keys.
                </p>
                <p>
                  <span className="text-neutral-300">Detailed setup guides:</span> Available at{" "}
                  <Link href="/docs#mcp" className="text-emerald-400 underline">
                    /docs#mcp
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
