"""
neemSEO Interactive Web Dashboard (Phase 1).
Provides an immediate browser interface for running on-page audits, viewing reports, and exporting fixes.
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["Web UI"])

DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>neemSEO - Open-Source On-Page SEO Auditor</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <style>
    [x-cloak] { display: none !important; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen font-sans antialiased" x-data="seoApp()" x-cloak>

  <!-- Top Navigation -->
  <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="h-9 w-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">n</div>
        <span class="text-xl font-bold tracking-tight text-white">neem<span class="text-emerald-400">SEO</span></span>
        <span class="text-xs bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">v0.1.0 (Phase 1)</span>
      </div>
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
    
    <!-- Hero / Input Card -->
    <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 mb-8 shadow-xl">
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
              <svg class="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Auditing...</span>
            </span>
          </button>
        </div>
      </form>
    </div>

    <!-- Error Alert -->
    <div x-show="errorMessage" class="bg-red-950/50 border border-red-800 text-red-200 p-4 rounded-xl mb-8 flex items-center justify-between">
      <span x-text="errorMessage"></span>
      <button @click="errorMessage = ''" class="text-red-400 hover:text-white">&times;</button>
    </div>

    <!-- Results Section -->
    <template x-if="report">
      <div class="space-y-8">
        
        <!-- Top Metrics Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Overall Score Card -->
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

          <!-- Total Checks -->
          <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
            <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Audit Checks</p>
            <div class="text-2xl font-bold text-white mb-2" x-text="report.total_checks + ' Total Evaluated'"></div>
            <div class="flex space-x-3 text-xs">
              <span class="text-emerald-400 font-semibold" x-text="report.passed_count + ' Passed'"></span>
              <span class="text-amber-400 font-semibold" x-text="report.warning_count + ' Warnings'"></span>
              <span class="text-red-400 font-semibold" x-text="report.failure_count + ' Failures'"></span>
            </div>
          </div>

          <!-- Speed & Response -->
          <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
            <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Server Response</p>
            <div class="text-2xl font-bold text-white mb-1" x-text="report.response_time_ms + ' ms'"></div>
            <p class="text-xs text-slate-400">HTTP Status: <span class="text-emerald-400 font-mono" x-text="report.status_code"></span></p>
          </div>

          <!-- Word Count -->
          <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
            <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Content Depth</p>
            <div class="text-2xl font-bold text-white mb-1" x-text="(report.page_summary.word_count || 0) + ' words'"></div>
            <p class="text-xs text-slate-400" x-text="'H1 tags: ' + (report.page_summary.h1_count || 0)"></p>
          </div>
        </div>

        <!-- Core Web Vitals (if present) -->
        <div x-show="report.core_web_vitals" class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <span>⚡ Google Core Web Vitals</span>
            <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-normal">Mobile</span>
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <p class="text-xs text-slate-400">LCP (Largest Contentful Paint)</p>
              <div class="text-xl font-bold text-white mt-1" x-text="report.core_web_vitals?.lcp_seconds + 's'"></div>
              <span class="text-xs font-semibold" :class="getVitalsColor(report.core_web_vitals?.lcp_rating)" x-text="report.core_web_vitals?.lcp_rating"></span>
            </div>
            <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <p class="text-xs text-slate-400">CLS (Layout Shift)</p>
              <div class="text-xl font-bold text-white mt-1" x-text="report.core_web_vitals?.cls_score"></div>
              <span class="text-xs font-semibold" :class="getVitalsColor(report.core_web_vitals?.cls_rating)" x-text="report.core_web_vitals?.cls_rating"></span>
            </div>
            <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <p class="text-xs text-slate-400">INP (Interaction to Next Paint)</p>
              <div class="text-xl font-bold text-white mt-1" x-text="report.core_web_vitals?.inp_ms + 'ms'"></div>
              <span class="text-xs font-semibold" :class="getVitalsColor(report.core_web_vitals?.inp_rating)" x-text="report.core_web_vitals?.inp_rating"></span>
            </div>
            <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <p class="text-xs text-slate-400">TTFB (Time to First Byte)</p>
              <div class="text-xl font-bold text-white mt-1" x-text="report.core_web_vitals?.ttfb_ms + 'ms'"></div>
              <span class="text-xs text-slate-500">Diagnostic</span>
            </div>
          </div>
        </div>

        <!-- Prioritized Fix List Table -->
        <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
          <div class="p-6 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-bold text-white">Prioritized Action Items</h2>
              <p class="text-xs text-slate-400 mt-1">High-impact issues are sorted to the top for maximum SEO improvement.</p>
            </div>
            
            <button 
              @click="downloadCSV()"
              class="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg border border-slate-600 flex items-center space-x-1.5 transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>Export Fixes (CSV)</span>
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
                    <td class="py-4 px-4 text-xs text-emerald-300">
                      <span x-text="fix.recommendation"></span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </template>

  </main>

  <script>
    function seoApp() {
      return {
        url: '',
        keyword: '',
        checkPagespeed: false,
        loading: false,
        errorMessage: '',
        report: null,

        async runAudit() {
          this.loading = true;
          this.errorMessage = '';
          try {
            const res = await fetch('/api/v1/audit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: this.url,
                keyword: this.keyword || null,
                check_pagespeed: this.checkPagespeed
              })
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.detail || 'Audit request failed');
            }
            this.report = await res.json();
          } catch (e) {
            this.errorMessage = e.message;
          } finally {
            this.loading = false;
          }
        },

        downloadCSV() {
          if (!this.report || !this.report.prioritized_fixes) return;
          const rows = [
            ["Impact", "Status", "Category", "Rule", "Issue Title", "Message", "Recommendation"]
          ];
          this.report.prioritized_fixes.forEach(f => {
            rows.push([f.impact_score, f.status, f.category, f.rule_id, f.title, f.message, f.recommendation]);
          });
          const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(i => `"${(i||'').toString().replace(/"/g, '""')}"`).join(",")).join("\\n");
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `neemseo-audit-${Date.now()}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
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
        },

        getVitalsColor(rating) {
          if (rating === 'GOOD') return 'text-emerald-400';
          if (rating === 'NEEDS_IMPROVEMENT') return 'text-amber-400';
          return 'text-red-400';
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
