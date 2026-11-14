"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Globe,
  FileSearch,
  TrendingUp,
  Link2,
  Bot,
  BarChart3,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Copy,
  Zap,
} from "lucide-react";
import {
  runAudit,
  startCrawl,
  getCrawlProgress,
  getCrawlReport,
  researchKeywords,
  getRankTargets,
  addRankTarget,
  checkRankPositions,
  getRankTrend,
  fetchBacklinks,
  compareCompetitors,
  checkAIVisibility,
  getSearchConsolePerformance,
  getTeam,
  createInvite,
} from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("audit");

  // Auditor state
  const [auditUrl, setAuditUrl] = useState<string>("https://example.com");
  const [auditKeyword, setAuditKeyword] = useState<string>("");
  const [checkPagespeed, setCheckPagespeed] = useState<boolean>(false);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Crawler state
  const [crawlUrl, setCrawlUrl] = useState<string>("https://example.com");
  const [crawlMaxPages, setCrawlMaxPages] = useState<number>(30);
  const [crawlRenderJs, setCrawlRenderJs] = useState<boolean>(false);
  const [crawlLoading, setCrawlLoading] = useState<boolean>(false);
  const [crawlProgress, setCrawlProgress] = useState<any>(null);
  const [crawlReport, setCrawlReport] = useState<any>(null);

  // Keyword state
  const [kwSeed, setKwSeed] = useState<string>("open source seo");
  const [kwLoading, setKwLoading] = useState<boolean>(false);
  const [kwResult, setKwResult] = useState<any>(null);

  // Rank Tracker state
  const [rankTargets, setRankTargets] = useState<any[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");
  const [rankLoading, setRankLoading] = useState<boolean>(false);
  const [selectedTrend, setSelectedTrend] = useState<any>(null);

  // Backlink & Competitor state
  const [blDomain, setBlDomain] = useState<string>("example.com");
  const [blLoading, setBlLoading] = useState<boolean>(false);
  const [blResult, setBlResult] = useState<any>(null);
  const [compDomain, setCompDomain] = useState<string>("example.com");
  const [compList, setCompList] = useState<string>("competitor1.com, competitor2.com");
  const [compResult, setCompResult] = useState<any>(null);

  // AI Visibility state
  const [aiDomain, setAiDomain] = useState<string>("neemseo.com");
  const [aiBrand, setAiBrand] = useState<string>("neemSEO");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Search Console state
  const [gscSite, setGscSite] = useState<string>("neemseo.com");
  const [gscLoading, setGscLoading] = useState<boolean>(false);
  const [gscResult, setGscResult] = useState<any>(null);

  // Team state
  const [teamList, setTeamList] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteResult, setInviteResult] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadRankData();
    loadTeamData();
  }, []);

  const loadRankData = async () => {
    try {
      const targets = await getRankTargets();
      setRankTargets(targets);
    } catch (_) {}
  };

  const loadTeamData = async () => {
    try {
      const team = await getTeam();
      setTeamList(team);
    } catch (_) {}
  };

  // Actions
  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuditLoading(true);
    try {
      const res = await runAudit(auditUrl, auditKeyword, checkPagespeed);
      setAuditResult(res);
    } catch (err: any) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrawlLoading(true);
    setCrawlReport(null);
    try {
      const { crawl_id } = await startCrawl(crawlUrl, crawlMaxPages, 3, true, crawlRenderJs);
      const timer = setInterval(async () => {
        const prog = await getCrawlProgress(crawl_id);
        setCrawlProgress(prog);
        if (["completed", "failed", "cancelled"].includes(prog.status)) {
          clearInterval(timer);
          setCrawlLoading(false);
          const rep = await getCrawlReport(crawl_id);
          setCrawlReport(rep);
        }
      }, 1000);
    } catch (err: any) {
      alert(`Crawl failed: ${err.message}`);
      setCrawlLoading(false);
    }
  };

  const handleKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    setKwLoading(true);
    try {
      const res = await researchKeywords(kwSeed);
      setKwResult(res);
    } catch (err: any) {
      alert(`Keyword research failed: ${err.message}`);
    } finally {
      setKwLoading(false);
    }
  };

  const handleAddRank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRankTarget(newKeyword, newUrl);
      setNewKeyword("");
      setNewUrl("");
      loadRankData();
    } catch (err: any) {
      alert(`Failed to add target: ${err.message}`);
    }
  };

  const handleCheckRanks = async () => {
    setRankLoading(true);
    try {
      await checkRankPositions();
      loadRankData();
    } catch (err: any) {
      alert(`SERP check failed: ${err.message}`);
    } finally {
      setRankLoading(false);
    }
  };

  const handleSelectTrend = async (targetId: string) => {
    try {
      const trend = await getRankTrend(targetId);
      setSelectedTrend(trend);
    } catch (_) {}
  };

  const handleBacklinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlLoading(true);
    try {
      const res = await fetchBacklinks(blDomain);
      setBlResult(res);
    } catch (err: any) {
      alert(`Backlink check failed: ${err.message}`);
    } finally {
      setBlLoading(false);
    }
  };

  const handleCompetitors = async (e: React.FormEvent) => {
    e.preventDefault();
    const comps = compList.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      const res = await compareCompetitors(compDomain, comps);
      setCompResult(res);
    } catch (err: any) {
      alert(`Competitor analysis failed: ${err.message}`);
    }
  };

  const handleAIVisibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await checkAIVisibility(aiDomain, aiBrand);
      setAiResult(res);
    } catch (err: any) {
      alert(`AI Visibility audit failed: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGSC = async (e: React.FormEvent) => {
    e.preventDefault();
    setGscLoading(true);
    try {
      const res = await getSearchConsolePerformance(gscSite);
      setGscResult(res);
    } catch (err: any) {
      alert(`GSC request failed: ${err.message}`);
    } finally {
      setGscLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const inv = await createInvite(inviteEmail);
      setInviteResult(inv);
      setInviteEmail("");
      loadTeamData();
    } catch (err: any) {
      alert(`Invite failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
              n
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              neem<span className="text-emerald-400">SEO</span>
            </span>
            <span className="text-xs bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
              v0.1.0 (Full Suite)
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: "audit", label: "Page Auditor", icon: FileSearch },
              { id: "crawler", label: "Site Crawler", icon: Globe },
              { id: "keywords", label: "Keywords", icon: Search },
              { id: "ranker", label: "Rank Tracker", icon: TrendingUp },
              { id: "backlinks", label: "Backlinks & Gaps", icon: Link2 },
              { id: "ai", label: "AI Visibility (GEO)", icon: Bot },
              { id: "gsc", label: "Search Console", icon: BarChart3 },
              { id: "team", label: "Team & MCP", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <a href="http://localhost:8000/docs" target="_blank" className="hover:text-white transition">
              FastAPI Docs
            </a>
            <span className="text-slate-700">|</span>
            <a href="http://localhost:8000/bot" target="_blank" className="hover:text-white transition">
              Bot Policy
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {/* ================= TAB 1: ON-PAGE AUDITOR ================= */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h1 className="text-xl font-bold text-white mb-2">Instant On-Page SEO Auditor</h1>
              <p className="text-slate-400 text-xs mb-6">
                Deep on-page crawl inspection: title length, meta description, heading hierarchy (H1–H6), image alt attributes, canonical tags, and Google Core Web Vitals.
              </p>

              <form onSubmit={handleAudit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-7">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Target Web Page URL</label>
                    <input
                      type="url"
                      value={auditUrl}
                      onChange={(e) => setAuditUrl(e.target.value)}
                      required
                      placeholder="https://example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Target Keyword (Optional)</label>
                    <input
                      type="text"
                      value={auditKeyword}
                      onChange={(e) => setAuditKeyword(e.target.value)}
                      placeholder="e.g. open source seo tool"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkPagespeed}
                      onChange={(e) => setCheckPagespeed(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                    />
                    <span>Include Google Core Web Vitals (LCP, FID/INP, CLS)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={auditLoading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs transition flex items-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {auditLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
                    <span>{auditLoading ? "Auditing Page..." : "Run On-Page Audit"}</span>
                  </button>
                </div>
              </form>
            </div>

            {auditResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Overall Score</span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-extrabold text-emerald-400">{auditResult.overall_score}</span>
                      <span className="text-slate-500 text-sm">/ 100</span>
                      <span className="ml-auto text-sm px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        Grade {auditResult.grade}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Passed Checks</span>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-1">{auditResult.passed_count}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Warnings</span>
                    <p className="text-3xl font-extrabold text-amber-400 mt-1">{auditResult.warn_count}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Critical Issues</span>
                    <p className="text-3xl font-extrabold text-red-400 mt-1">{auditResult.fail_count}</p>
                  </div>
                </div>

                {/* Prioritized Fixes */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-3">Prioritized Recommendations (Highest Impact First)</h3>
                  <div className="space-y-2">
                    {auditResult.prioritized_fixes?.map((fix: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-start space-x-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${
                          fix.status === "fail" ? "bg-red-950 text-red-400 border border-red-500/30" : "bg-amber-950 text-amber-400 border border-amber-500/30"
                        }`}>
                          {fix.status}
                        </span>
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-white">{fix.title}</p>
                          <p className="text-slate-400 mt-0.5">{fix.message}</p>
                          <p className="text-emerald-400 mt-1 font-mono text-[11px]">→ {fix.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SITE CRAWLER ================= */}
        {activeTab === "crawler" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h1 className="text-xl font-bold text-white mb-2">Whole-Site Crawler & Link Graph Analyzer</h1>
              <p className="text-slate-400 text-xs mb-6">
                BFS concurrency crawling: broken internal links (4xx/5xx), orphan page discovery, duplicate metadata, depth distribution, and robots.txt compliance.
              </p>

              <form onSubmit={handleCrawl} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-8">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Seed URL / Sitemap</label>
                    <input
                      type="url"
                      value={crawlUrl}
                      onChange={(e) => setCrawlUrl(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Max Pages to Crawl</label>
                    <input
                      type="number"
                      value={crawlMaxPages}
                      onChange={(e) => setCrawlMaxPages(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={crawlRenderJs}
                      onChange={(e) => setCrawlRenderJs(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                    />
                    <span>Opt-in Playwright JS Rendering (Headless Chromium)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={crawlLoading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs transition flex items-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {crawlLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    <span>{crawlLoading ? "Crawling Site..." : "Start Site Crawl"}</span>
                  </button>
                </div>
              </form>
            </div>

            {crawlProgress && crawlLoading && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>Crawling in progress...</span>
                  <span>{crawlProgress.pages_crawled} pages indexed</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full animate-pulse" style={{ width: "65%" }}></div>
                </div>
              </div>
            )}

            {crawlReport && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Total Crawled</span>
                    <p className="text-3xl font-extrabold text-white mt-1">{crawlReport.total_pages}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Broken Links (4xx/5xx)</span>
                    <p className="text-3xl font-extrabold text-red-400 mt-1">{crawlReport.broken_links_count}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Duplicate Titles</span>
                    <p className="text-3xl font-extrabold text-amber-400 mt-1">{crawlReport.duplicate_titles_count}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Orphan Pages</span>
                    <p className="text-3xl font-extrabold text-cyan-400 mt-1">{crawlReport.orphan_pages_count}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: KEYWORD RESEARCH ================= */}
        {activeTab === "keywords" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h1 className="text-xl font-bold text-white mb-2">Keyword Research & Topical Clustering</h1>
              <p className="text-slate-400 text-xs mb-6">
                Google Autocomplete A-Z expansion, heuristic search intent categorization (Informational, Commercial, Transactional, Navigational), and priority scoring.
              </p>

              <form onSubmit={handleKeywords} className="flex gap-3">
                <input
                  type="text"
                  value={kwSeed}
                  onChange={(e) => setKwSeed(e.target.value)}
                  placeholder="e.g. open source seo tool"
                  required
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={kwLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2 rounded-lg text-xs transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {kwLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Research</span>
                </button>
              </form>
            </div>

            {kwResult && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Discovered Keywords ({kwResult.total_found})</span>
                  <span className="text-xs text-slate-400">Cost: $0.00 (Autocomplete Free)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Keyword</th>
                        <th className="py-2.5 px-4 text-center">Intent</th>
                        <th className="py-2.5 px-4 text-center">Cluster</th>
                        <th className="py-2.5 px-4 text-center">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {kwResult.keywords?.slice(0, 30).map((k: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 font-medium text-white">{k.keyword}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                              {k.intent}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">{k.cluster}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-emerald-400">{k.priority_score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: RANK TRACKER ================= */}
        {activeTab === "ranker" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">SERP Rank Tracker & Drop Alerts</h1>
                <button
                  onClick={handleCheckRanks}
                  disabled={rankLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rankLoading ? "animate-spin" : ""}`} />
                  <span>Check SERP Now</span>
                </button>
              </div>

              {/* Add Keyword Target Form */}
              <form onSubmit={handleAddRank} className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                <div className="md:col-span-6">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Keyword to track"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-4">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/target-page"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-xs">
                    + Add Target
                  </button>
                </div>
              </form>
            </div>

            {/* Rank Target List */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Keyword</th>
                    <th className="py-2.5 px-4">Target URL</th>
                    <th className="py-2.5 px-4 text-center">Device</th>
                    <th className="py-2.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rankTargets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-bold text-white">{t.keyword}</td>
                      <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px] truncate max-w-xs">{t.target_url}</td>
                      <td className="py-2.5 px-4 text-center uppercase font-mono text-[10px]">{t.device}</td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => handleSelectTrend(t.id)}
                          className="text-emerald-400 hover:underline text-xs"
                        >
                          View Trend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Rank Trend Chart */}
            {selectedTrend && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Ranking Trend for: {selectedTrend.keyword}</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedTrend.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="checked_at" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis reversed domain={[1, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: 12 }} />
                      <Line type="monotone" dataKey="position" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: BACKLINKS & GAPS ================= */}
        {activeTab === "backlinks" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backlink Profile Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-white">Backlink Profile Snapshot</h2>
                <form onSubmit={handleBacklinks} className="flex gap-2">
                  <input
                    type="text"
                    value={blDomain}
                    onChange={(e) => setBlDomain(e.target.value)}
                    required
                    placeholder="example.com"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <button type="submit" disabled={blLoading} className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs">
                    Inspect
                  </button>
                </form>

                {blResult && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Total Backlinks</span>
                      <p className="text-xl font-bold text-white">{blResult.total_backlinks}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Referring Domains</span>
                      <p className="text-xl font-bold text-cyan-400">{blResult.total_referring_domains}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Competitor Gap Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-white">Competitor Gap Analysis</h2>
                <form onSubmit={handleCompetitors} className="space-y-3">
                  <input
                    type="text"
                    value={compDomain}
                    onChange={(e) => setCompDomain(e.target.value)}
                    placeholder="Your domain (e.g. neemseo.com)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={compList}
                    onChange={(e) => setCompList(e.target.value)}
                    placeholder="competitor1.com, competitor2.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-xs">
                    Compare Competitors
                  </button>
                </form>

                {compResult && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Missing Keywords</span>
                      <p className="text-xl font-bold text-amber-400">{compResult.total_missing_keywords}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase">Backlink Gaps</span>
                      <p className="text-xl font-bold text-emerald-400">{compResult.total_backlink_gaps}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: AI VISIBILITY (GEO) ================= */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h1 className="text-xl font-bold text-white mb-2">Generative Engine Optimization (GEO) & AI Visibility</h1>
              <p className="text-slate-400 text-xs mb-6">
                Audit brand presence, citation rates, and recommendation sentiment across ChatGPT, Claude, Perplexity, Gemini, and Google AI Overviews.
              </p>

              <form onSubmit={handleAIVisibility} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5">
                  <input
                    type="text"
                    value={aiDomain}
                    onChange={(e) => setAiDomain(e.target.value)}
                    placeholder="neemseo.com"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-5">
                  <input
                    type="text"
                    value={aiBrand}
                    onChange={(e) => setAiBrand(e.target.value)}
                    placeholder="neemSEO"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-xs"
                  >
                    {aiLoading ? "Auditing..." : "Run AI Audit"}
                  </button>
                </div>
              </form>
            </div>

            {aiResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">AI Visibility Score</span>
                    <p className="text-4xl font-extrabold text-emerald-400 mt-1">{aiResult.overall_score} / 100</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Mention Rate</span>
                    <p className="text-3xl font-extrabold text-white mt-1">{aiResult.mention_rate_pct}%</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Direct Citation Rate</span>
                    <p className="text-3xl font-extrabold text-cyan-400 mt-1">{aiResult.citation_rate_pct}%</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Recommendation Rate</span>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-1">{aiResult.recommendation_rate_pct}%</p>
                  </div>
                </div>

                {/* Engine Comparison Chart */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white">AI Engine Score Breakdown</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aiResult.engine_breakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="display_name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontSize: 12 }} />
                        <Bar dataKey="visibility_score" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 7: SEARCH CONSOLE ================= */}
        {activeTab === "gsc" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h1 className="text-xl font-bold text-white mb-2">Google Search Console (GSC) Integration</h1>
              <p className="text-slate-400 text-xs mb-6">
                Direct zero-cost real search query data, click-through rates (CTR), impressions, and actual Google SERP ranking positions.
              </p>

              <form onSubmit={handleGSC} className="flex gap-3">
                <input
                  type="text"
                  value={gscSite}
                  onChange={(e) => setGscSite(e.target.value)}
                  placeholder="neemseo.com"
                  required
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={gscLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2 rounded-lg text-xs"
                >
                  {gscLoading ? "Loading..." : "Fetch Performance"}
                </button>
              </form>
            </div>

            {gscResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Total Organic Clicks</span>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-1">{gscResult.total_clicks.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Total Impressions</span>
                    <p className="text-3xl font-extrabold text-white mt-1">{gscResult.total_impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Average CTR</span>
                    <p className="text-3xl font-extrabold text-cyan-400 mt-1">{gscResult.average_ctr}%</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
                    <span className="text-[11px] uppercase font-semibold text-slate-400">Average Position</span>
                    <p className="text-3xl font-extrabold text-amber-400 mt-1">#{gscResult.average_position}</p>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Search Query</th>
                        <th className="py-2.5 px-4 text-right">Clicks</th>
                        <th className="py-2.5 px-4 text-right">Impressions</th>
                        <th className="py-2.5 px-4 text-center">CTR</th>
                        <th className="py-2.5 px-4 text-center">Avg Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {gscResult.queries?.map((q: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 font-semibold text-white">{q.query}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-emerald-400">{q.clicks.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-300">{q.impressions.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-center font-mono">{q.ctr}%</td>
                          <td className="py-2.5 px-4 text-center font-bold text-amber-400">#{q.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 8: TEAM & MCP ================= */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Team Members */}
              <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-white">Team Members & Access</h2>
                <form onSubmit={handleInvite} className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <button type="submit" className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs">
                    Invite Teammate
                  </button>
                </form>

                {inviteResult && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-xs text-emerald-200">
                    <p className="font-bold mb-1">Invitation Link:</p>
                    <code className="break-all font-mono text-[11px]">{inviteResult.invite_url}</code>
                  </div>
                )}

                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase">
                    <tr>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3 text-center">Role</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teamList.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2 px-3 text-white font-medium">{m.email}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.role === "admin" ? "bg-purple-950 text-purple-400" : "bg-slate-800 text-slate-300"
                          }`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-emerald-400 font-medium">Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MCP Configuration */}
              <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-white">AI Agent & MCP Keys</h2>
                <p className="text-xs text-slate-400">
                  Configure Claude Code, ChatGPT, Cursor, and Codex to use your neemSEO MCP tools directly.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] uppercase font-bold text-slate-400">Cursor / Claude Code Config</span>
                  <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`{
  "mcpServers": {
    "neemseo": {
      "command": "python",
      "args": ["-m", "neemseo.mcp.server"]
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
