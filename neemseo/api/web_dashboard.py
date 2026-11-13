"""
neemSEO Interactive Web Dashboard.
Includes Single Page Auditor and Whole-Site Crawler with link graph analysis,
broken link detection, duplicate content, and orphan page reports.
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["Web UI"])

DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>neemSEO - Open-Source SEO Suite (Auditor & Crawler)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <style>
    [x-cloak] { display: none !important; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen font-sans antialiased" x-data="seoApp()" x-init="loadRecentCrawls()" x-cloak>

  <!-- Top Navigation -->
  <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="h-9 w-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">n</div>
        <span class="text-xl font-bold tracking-tight text-white">neem<span class="text-emerald-400">SEO</span></span>
        <span class="text-xs bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">v0.1.0 (Week 2)</span>
      </div>

      <!-- Main Navigation Tabs -->
      <nav class="flex space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button 
          @click="activeTab = 'audit'"
          :class="activeTab === 'audit' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'"
          class="px-4 py-1.5 rounded-lg text-sm transition"
        >
          Page Auditor
        </button>
        <button 
          @click="activeTab = 'crawler'"
          :class="activeTab === 'crawler' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'"
          class="px-4 py-1.5 rounded-lg text-sm transition"
        >
          Site Crawler
        </button>
      </nav>

      <div class="flex items-center space-x-4 text-sm">
        <a href="/docs" target="_blank" class="text-slate-400 hover:text-white transition">API Docs</a>
        <a href="/bot" target="_blank" class="text-slate-400 hover:text-white transition">Bot Policy</a>
        <span class="text-slate-600">|</span>
        <span class="text-xs text-slate-400">BYOK: Pay-as-you-go</span>
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- ================= TAB 1: ON-PAGE AUDITOR ================= -->
    <div x-show="activeTab === 'audit'" class="space-y-8">
      <!-- Input Card -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <h1 class="text-2xl font-bold text-white mb-2">Instant On-Page SEO Auditor</h1>
        <p class="text-slate-400 text-sm mb-6">Enter any public URL to inspect metadata, heading hierarchy, image alts, mobile viewport, canonical tags, and keyword placement.</p>
        
        <form @submit.prevent="runAudit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div class="md:col-span-7">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Target Web Page URL</label>
              <input 
                type="url" 
                x-model="url" 
                placeholder="https://example.com" 
                required
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
            <div class="md:col-span-5">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Target Keyword (Optional)</label>
              <input 
                type="text" 
                x-model="keyword" 
                placeholder="e.g. open source seo tool" 
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label class="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer select-none">
              <input type="checkbox" x-model="checkPagespeed" class="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900">
              <span>Include Google Core Web Vitals (LCP, CLS, INP)</span>
            </label>

            <button 
              type="submit" 
              :disabled="loading"
              class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg transition duration-150 flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              <span x-show="!loading">Run On-Page Audit</span>
              <span x-show="loading" class="flex items-center space-x-2">
                <svg class="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                <span>Auditing...</span>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Audit Report Section -->
      <template x-if="report">
        <div class="space-y-8">
          <!-- Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Health Score</p>
                <div class="flex items-baseline space-x-2">
                  <span class="text-4xl font-extrabold" :class="getScoreColor(report.overall_score)" x-text="report.overall_score"></span>
                  <span class="text-slate-500 text-sm">/ 100</span>
                </div>
                <p class="text-xs text-slate-400 mt-1">Grade: <span class="font-bold" :class="getScoreColor(report.overall_score)" x-text="report.grade"></span></p>
              </div>
              <div class="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-xl" :class="getScoreBorder(report.overall_score)" x-text="report.grade"></div>
            </div>

            <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Audit Checks</p>
              <div class="text-2xl font-bold text-white mb-2" x-text="report.total_checks + ' Total Evaluated'"></div>
              <div class="flex space-x-3 text-xs">
                <span class="text-emerald-400 font-semibold" x-text="report.passed_count + ' Passed'"></span>
                <span class="text-amber-400 font-semibold" x-text="report.warning_count + ' Warnings'"></span>
                <span class="text-red-400 font-semibold" x-text="report.failure_count + ' Failures'"></span>
              </div>
            </div>

            <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Server Response</p>
              <div class="text-2xl font-bold text-white mb-1" x-text="report.response_time_ms + ' ms'"></div>
              <p class="text-xs text-slate-400">HTTP Status: <span class="text-emerald-400 font-mono" x-text="report.status_code"></span></p>
            </div>

            <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Content Depth</p>
              <div class="text-2xl font-bold text-white mb-1" x-text="(report.page_summary.word_count || 0) + ' words'"></div>
              <p class="text-xs text-slate-400" x-text="'H1 tags: ' + (report.page_summary.h1_count || 0)"></p>
            </div>
          </div>

          <!-- Fixes Table -->
          <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div class="p-6 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <h2 class="text-xl font-bold text-white">Prioritized Action Items</h2>
              <button @click="downloadAuditCSV()" class="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg border border-slate-600 transition">
                Export Fixes (CSV)
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th class="py-3 px-4 text-center">Impact</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4">Category</th>
                    <th class="py-3 px-4">Issue Title & Diagnosis</th>
                    <th class="py-3 px-4">Action Required</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/50">
                  <template x-for="fix in report.prioritized_fixes" :key="fix.rule_id">
                    <tr class="hover:bg-slate-700/30 transition">
                      <td class="py-4 px-4 text-center font-bold font-mono">
                        <span class="px-2 py-1 rounded bg-slate-900 border text-xs" :class="fix.impact_score >= 8 ? 'text-red-400 border-red-800' : 'text-amber-400 border-amber-800'" x-text="fix.impact_score + '/10'"></span>
                      </td>
                      <td class="py-4 px-4 font-semibold text-xs">
                        <span class="px-2 py-1 rounded uppercase tracking-wider" :class="fix.status === 'fail' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'" x-text="fix.status"></span>
                      </td>
                      <td class="py-4 px-4 text-xs font-mono text-slate-400 capitalize" x-text="fix.category"></td>
                      <td class="py-4 px-4">
                        <div class="font-bold text-white" x-text="fix.title"></div>
                        <div class="text-xs text-slate-400 mt-1" x-text="fix.message"></div>
                      </td>
                      <td class="py-4 px-4 text-xs text-emerald-300" x-text="fix.recommendation"></td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ================= TAB 2: SITE CRAWLER ================= -->
    <div x-show="activeTab === 'crawler'" class="space-y-8">
      <!-- Crawler Launch Card -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <h1 class="text-2xl font-bold text-white mb-2">Whole-Site Crawler & Link Graph Audit</h1>
        <p class="text-slate-400 text-sm mb-6">Discovers internal URLs from homepage & sitemaps, analyzes click depth, detects broken links (4xx/5xx), duplicate metadata, and orphan pages.</p>
        
        <form @submit.prevent="startCrawl()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Seed Domain / Homepage URL</label>
              <input 
                type="url" 
                x-model="crawlSeedUrl" 
                placeholder="https://example.com" 
                required
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div class="md:col-span-3">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Max Pages to Crawl</label>
              <input 
                type="number" 
                x-model.number="crawlMaxPages" 
                min="5" 
                max="500" 
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white transition"
              />
            </div>
            <div class="md:col-span-3">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Max Click Depth</label>
              <input 
                type="number" 
                x-model.number="crawlMaxDepth" 
                min="1" 
                max="6" 
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white transition"
              />
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <label class="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" x-model="crawlSitemap" class="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900">
              <span>Automatically discover and ingest sitemap.xml</span>
            </label>

            <button 
              type="submit" 
              :disabled="crawlLoading"
              class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg transition duration-150 flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              <span x-show="!crawlLoading">Start Whole-Site Crawl</span>
              <span x-show="crawlLoading" class="flex items-center space-x-2">
                <svg class="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                <span>Crawling Site...</span>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Live Progress Bar -->
      <div x-show="crawlProgress" class="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-3">
            <span class="inline-block w-3 h-3 rounded-full animate-ping bg-emerald-400" x-show="crawlProgress?.status === 'running'"></span>
            <span class="font-bold text-white text-sm" x-text="'Crawl Status: ' + (crawlProgress?.status || '').toUpperCase()"></span>
          </div>
          <span class="text-xs text-slate-400 font-mono" x-text="(crawlProgress?.pages_crawled || 0) + ' pages audited'"></span>
        </div>
        <div class="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
          <div class="bg-emerald-500 h-2.5 rounded-full transition-all duration-300" :style="`width: ${Math.min(100, Math.round(((crawlProgress?.pages_crawled||0)/crawlMaxPages)*100))}%`"></div>
        </div>
      </div>

      <!-- Crawl Report View -->
      <template x-if="crawlReport">
        <div class="space-y-8">
          <!-- Crawl Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Average Health Score</p>
              <div class="text-3xl font-extrabold text-emerald-400" x-text="crawlReport.average_health_score + ' / 100'"></div>
              <p class="text-xs text-slate-400 mt-1" x-text="'Across ' + crawlReport.total_pages_crawled + ' crawled pages'"></p>
            </div>

            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Broken Links</p>
              <div class="text-3xl font-extrabold text-red-400" x-text="crawlReport.broken_links_count"></div>
              <p class="text-xs text-slate-400 mt-1">4xx & 5xx HTTP response codes</p>
            </div>

            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Duplicate Titles</p>
              <div class="text-3xl font-extrabold text-amber-400" x-text="crawlReport.duplicate_titles.length"></div>
              <p class="text-xs text-slate-400 mt-1">Duplicate metadata clusters</p>
            </div>

            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Orphan Pages</p>
              <div class="text-3xl font-extrabold text-purple-400" x-text="crawlReport.orphan_pages_count"></div>
              <p class="text-xs text-slate-400 mt-1">In sitemap but 0 internal links</p>
            </div>
          </div>

          <!-- Broken Links Section -->
          <div x-show="crawlReport.broken_links.length > 0" class="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div class="p-6 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-red-400">Broken Links (4xx / 5xx)</h2>
                <p class="text-xs text-slate-400 mt-0.5">Links leading to error pages that damage user experience and crawl budget.</p>
              </div>
              <a :href="`/api/v1/crawls/${crawlReport.crawl_id}/broken-links/csv`" class="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg border border-slate-600 transition">
                Export Broken Links (CSV)
              </a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="bg-slate-900 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                  <tr>
                    <th class="py-3 px-4 text-center">Status</th>
                    <th class="py-3 px-4">Broken Target URL</th>
                    <th class="py-3 px-4">Found on Source Page</th>
                    <th class="py-3 px-4">Anchor Text</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/50">
                  <template x-for="b in crawlReport.broken_links" :key="b.target_url + b.source_url">
                    <tr class="hover:bg-slate-700/30">
                      <td class="py-3 px-4 text-center font-bold text-red-400 font-mono" x-text="b.status_code"></td>
                      <td class="py-3 px-4 text-white font-mono text-xs" x-text="b.target_url"></td>
                      <td class="py-3 px-4 text-slate-400 text-xs" x-text="b.source_url"></td>
                      <td class="py-3 px-4 text-slate-300 italic text-xs" x-text="b.anchor_text || '[No text]'"></td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Duplicate Titles Section -->
          <div x-show="crawlReport.duplicate_titles.length > 0" class="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div class="p-6 border-b border-slate-700">
              <h2 class="text-xl font-bold text-amber-400">Duplicate Title Tags</h2>
              <p class="text-xs text-slate-400 mt-0.5">Pages sharing identical title tags cause keyword cannibalization.</p>
            </div>
            <div class="divide-y divide-slate-700/50">
              <template x-for="d in crawlReport.duplicate_titles" :key="d.content">
                <div class="p-4 hover:bg-slate-700/20">
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold text-xs" x-text="d.count + ' Pages'"></span>
                    <span class="font-bold text-white text-sm" x-text="d.content"></span>
                  </div>
                  <ul class="mt-2 pl-4 text-xs text-slate-400 list-disc list-inside space-y-1">
                    <template x-for="u in d.urls" :key="u">
                      <li class="font-mono" x-text="u"></li>
                    </template>
                  </ul>
                </div>
              </template>
            </div>
          </div>

        </div>
      </template>

      <!-- Past Crawls Table -->
      <div class="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div class="p-6 border-b border-slate-700">
          <h2 class="text-xl font-bold text-white">Recent Crawl Audits</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="bg-slate-900 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Domain</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-center">Pages Crawled</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
              <template x-for="c in recentCrawls" :key="c.id">
                <tr class="hover:bg-slate-700/30">
                  <td class="py-3 px-4 text-slate-400 text-xs" x-text="new Date(c.created_at).toLocaleString()"></td>
                  <td class="py-3 px-4 font-semibold text-white" x-text="c.seed_url"></td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2 py-0.5 rounded text-xs uppercase font-bold" :class="c.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'" x-text="c.status"></span>
                  </td>
                  <td class="py-3 px-4 text-center font-mono font-bold" x-text="c.pages_crawled"></td>
                  <td class="py-3 px-4 text-right">
                    <button @click="loadCrawlReport(c.id)" class="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition">
                      View Report
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </main>

  <script>
    function seoApp() {
      return {
        activeTab: 'audit',
        
        // Single audit state
        url: '',
        keyword: '',
        checkPagespeed: false,
        loading: false,
        report: null,

        // Crawler state
        crawlSeedUrl: '',
        crawlMaxPages: 30,
        crawlMaxDepth: 3,
        crawlSitemap: true,
        crawlLoading: false,
        crawlProgress: null,
        crawlReport: null,
        recentCrawls: [],

        async runAudit() {
          this.loading = true;
          try {
            const res = await fetch('/api/v1/audit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: this.url, keyword: this.keyword || null, check_pagespeed: this.checkPagespeed })
            });
            this.report = await res.json();
          } catch (e) {
            alert('Audit error: ' + e.message);
          } finally {
            this.loading = false;
          }
        },

        async startCrawl() {
          this.crawlLoading = true;
          this.crawlReport = null;
          try {
            const res = await fetch('/api/v1/crawls', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                seed_url: this.crawlSeedUrl,
                max_pages: this.crawlMaxPages,
                max_depth: this.crawlMaxDepth,
                check_sitemap: this.crawlSitemap
              })
            });
            const data = await res.json();
            const crawlId = data.crawl_id;
            
            // Poll for progress until finished
            const interval = setInterval(async () => {
              const statusRes = await fetch(`/api/v1/crawls/${crawlId}`);
              const statusData = await statusRes.json();
              this.crawlProgress = statusData;

              if (statusData.status === 'completed' || statusData.status === 'failed' || statusData.status === 'cancelled') {
                clearInterval(interval);
                this.crawlLoading = false;
                this.loadCrawlReport(crawlId);
                this.loadRecentCrawls();
              }
            }, 1000);

          } catch (e) {
            alert('Crawl error: ' + e.message);
            this.crawlLoading = false;
          }
        },

        async loadCrawlReport(crawlId) {
          const res = await fetch(`/api/v1/crawls/${crawlId}/report`);
          this.crawlReport = await res.json();
        },

        async loadRecentCrawls() {
          try {
            const res = await fetch('/api/v1/crawls?limit=10');
            this.recentCrawls = await res.json();
          } catch(e) {}
        },

        downloadAuditCSV() {
          if (!this.report) return;
          window.location.href = `/api/v1/audit/${this.report.id || ''}/csv`;
        },

        getScoreColor(score) {
          if (score >= 80) return 'text-emerald-400';
          if (score >= 60) return 'text-amber-400';
          return 'text-red-400';
        },

        getScoreBorder(score) {
          if (score >= 80) return 'border-emerald-500 text-emerald-400';
          if (score >= 60) return 'border-amber-500 text-amber-400';
          return 'border-red-500 text-red-400';
        }
      };
    }
  </script>
</body>
</html>
"""


@router.get("/", response_class=HTMLResponse)
def index_page():
    return HTMLResponse(content=DASHBOARD_HTML)
