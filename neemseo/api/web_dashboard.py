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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              blue: '#1D4ED8',
              coral: '#FF6B4A',
              navy: '#0B1226',
              surface: '#0F1A36',
              card: '#132145',
            }
          },
          fontFamily: {
            sans: ['Inter', '-apple-system', 'sans-serif'],
            heading: ['"IBM Plex Sans"', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    [x-cloak] { display: none !important; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #0B1226;
    }
    h1, h2, h3, .font-heading {
      font-family: 'IBM Plex Sans', sans-serif;
    }
  </style>
</head>
<body class="bg-[#0B1226] text-slate-100 min-h-screen font-sans antialiased" x-data="seoApp()" x-init="loadRecentCrawls(); loadRecentKeywordRuns(); loadRankTargets(); loadRankAlerts(); loadAIHistory(); loadTeam()" x-cloak>

  <!-- Top Navigation: Logo and Brand Name Only -->
  <header class="border-b border-slate-800/80 bg-[#0B1226]/90 backdrop-blur sticky top-0 z-50">
    <div class="px-6 h-16 flex items-center">
      <div class="flex items-center space-x-3">
        <!-- neemSEO SVG Logo Mark -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-9 h-9" role="img" aria-label="neemSEO">
          <title>neemSEO</title>
          <circle cx="27" cy="27" r="20" fill="none" stroke="#1D4ED8" stroke-width="5"/>
          <path d="M41.5 41.5 L56 56" fill="none" stroke="#FF6B4A" stroke-width="7" stroke-linecap="round"/>
          <g transform="translate(27 27) rotate(40) scale(0.9)" fill="#2FA05A">
            <path d="M0 15 V-14" fill="none" stroke="#2FA05A" stroke-width="1.8" stroke-linecap="round"/>
            <ellipse cx="0" cy="-14" rx="2.7" ry="6"/>
            <ellipse cx="5.5" cy="7" rx="2.7" ry="6" transform="rotate(50 5.5 7)"/>
            <ellipse cx="-5.5" cy="7" rx="2.7" ry="6" transform="rotate(-50 -5.5 7)"/>
            <ellipse cx="5.2" cy="-1.5" rx="2.5" ry="5.6" transform="rotate(50 5.2 -1.5)"/>
            <ellipse cx="-5.2" cy="-1.5" rx="2.5" ry="5.6" transform="rotate(-50 -5.2 -1.5)"/>
            <ellipse cx="4.6" cy="-9.5" rx="2.3" ry="5" transform="rotate(50 4.6 -9.5)"/>
            <ellipse cx="-4.6" cy="-9.5" rx="2.3" ry="5" transform="rotate(-50 -4.6 -9.5)"/>
          </g>
        </svg>
        <span class="text-xl font-heading font-bold tracking-tight text-white">neem<span style="color: #FF6B4A;">SEO</span></span>
      </div>
    </div>
  </header>

  <!-- Dashboard Container with Left Sidebar and Main Content -->
  <div class="flex min-h-[calc(100vh-4rem)]">
    <!-- Left Sidebar: All navigation items and secondary links -->
    <aside class="w-64 shrink-0 bg-[#0B1226] border-r border-slate-800/80 flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div class="space-y-6">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">SEO Tools</span>
          <nav class="mt-2 space-y-1">
            <button 
              @click="activeTab = 'audit'"
              :class="activeTab === 'audit' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Page Auditor</span>
            </button>
            <button 
              @click="activeTab = 'crawler'"
              :class="activeTab === 'crawler' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
              <span>Site Crawler</span>
            </button>
            <button 
              @click="activeTab = 'keywords'"
              :class="activeTab === 'keywords' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span>Keywords</span>
            </button>
            <button 
              @click="activeTab = 'ranker'"
              :class="activeTab === 'ranker' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              <span>Rank Tracker</span>
            </button>
            <button 
              @click="activeTab = 'backlinks'"
              :class="activeTab === 'backlinks' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              <span>Backlinks</span>
            </button>
            <button 
              @click="activeTab = 'competitors'"
              :class="activeTab === 'competitors' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span>Competitors</span>
            </button>
            <button 
              @click="activeTab = 'ai-visibility'"
              :class="activeTab === 'ai-visibility' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span>AI Visibility (GEO)</span>
            </button>
            <button 
              @click="activeTab = 'team'"
              :class="activeTab === 'team' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
              class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition text-left"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <span>Team & Keys</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Bottom sidebar items (formerly in navbar) -->
      <div class="pt-4 border-t border-slate-800/80 space-y-3">
        <div class="space-y-1">
          <a href="/overview" target="_blank" class="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:text-white hover:bg-slate-800/60 transition">
            <span>Feature Guide</span>
            <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <a href="/docs" target="_blank" class="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition">
            <span>FastAPI Docs</span>
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
          <a href="/bot" target="_blank" class="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition">
            <span>Bot Policy</span>
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
        <div class="p-2.5 bg-[#0F1A36] border border-slate-800 rounded-lg flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse"></span>
          <span class="text-[11px] text-slate-300 font-medium">BYOK: Pay-as-you-go</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-6 md:p-8 overflow-x-hidden max-w-7xl">
    
    <!-- ================= TAB 1: ON-PAGE AUDITOR ================= -->
    <div x-show="activeTab === 'audit'" class="space-y-8">
      <!-- Input Card -->
      <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 class="text-2xl font-bold font-heading text-white mb-2">Instant On-Page SEO Auditor</h1>
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
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition"
              />
            </div>
            <div class="md:col-span-5">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Target Keyword (Optional)</label>
              <input 
                type="text" 
                x-model="keyword" 
                placeholder="e.g. open source seo tool" 
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label class="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer select-none">
              <input type="checkbox" x-model="checkPagespeed" class="rounded border-slate-700 text-[#1D4ED8] focus:ring-[#1D4ED8] bg-[#070C1B]">
              <span>Include Google Core Web Vitals (LCP, CLS, INP)</span>
            </label>

            <button 
              type="submit" 
              :disabled="loading"
              class="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition duration-150 flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-[#1D4ED8]/25"
            >
              <span x-show="!loading">Run On-Page Audit</span>
              <span x-show="loading" class="flex items-center space-x-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
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
            <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Health Score</p>
                <div class="flex items-baseline space-x-2">
                  <span class="text-4xl font-extrabold font-heading" :class="getScoreColor(report.overall_score)" x-text="report.overall_score"></span>
                  <span class="text-slate-500 text-sm">/ 100</span>
                </div>
                <p class="text-xs text-slate-400 mt-1">Grade: <span class="font-bold" :class="getScoreColor(report.overall_score)" x-text="report.grade"></span></p>
              </div>
              <div class="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-xl" :class="getScoreBorder(report.overall_score)" x-text="report.grade"></div>
            </div>

            <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Audit Checks</p>
              <div class="text-2xl font-bold font-heading text-white mb-2" x-text="report.total_checks + ' Total Evaluated'"></div>
              <div class="flex space-x-3 text-xs">
                <span class="text-emerald-400 font-semibold" x-text="report.passed_count + ' Passed'"></span>
                <span class="text-amber-400 font-semibold" x-text="report.warning_count + ' Warnings'"></span>
                <span class="text-[#FF6B4A] font-semibold" x-text="report.failure_count + ' Failures'"></span>
              </div>
            </div>

            <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Server Response</p>
              <div class="text-2xl font-bold font-heading text-white mb-1" x-text="report.response_time_ms + ' ms'"></div>
              <p class="text-xs text-slate-400">HTTP Status: <span class="text-emerald-400 font-mono" x-text="report.status_code"></span></p>
            </div>

            <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Content Depth</p>
              <div class="text-2xl font-bold font-heading text-white mb-1" x-text="(report.page_summary.word_count || 0) + ' words'"></div>
              <p class="text-xs text-slate-400" x-text="'H1 tags: ' + (report.page_summary.h1_count || 0)"></p>
            </div>
          </div>

          <!-- Fixes Table -->
          <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div class="p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <h2 class="text-xl font-bold font-heading text-white">Prioritized Action Items</h2>
              <button @click="downloadAuditCSV()" class="text-xs bg-[#132145] hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg border border-slate-700 transition">
                Export Fixes (CSV)
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-300">
                <thead class="bg-[#070C1B] text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th class="py-3 px-4 text-center">Impact</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4">Category</th>
                    <th class="py-3 px-4">Issue Title & Diagnosis</th>
                    <th class="py-3 px-4">Action Required</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  <template x-for="fix in report.prioritized_fixes" :key="fix.rule_id">
                    <tr class="hover:bg-slate-800/40 transition">
                      <td class="py-4 px-4 text-center font-bold font-mono">
                        <span class="px-2 py-1 rounded border text-xs" :class="fix.impact_score >= 8 ? 'text-[#FF6B4A] border-[#FF6B4A]/50 bg-[#FF6B4A]/10' : 'text-amber-400 border-amber-800 bg-[#070C1B]'" x-text="fix.impact_score + '/10'"></span>
                      </td>
                      <td class="py-4 px-4 font-semibold text-xs">
                        <span class="px-2 py-1 rounded uppercase tracking-wider" :class="fix.status === 'fail' ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/40' : 'bg-amber-950 text-amber-400 border border-amber-800'" x-text="fix.status"></span>
                      </td>
                      <td class="py-4 px-4 text-xs font-mono text-slate-400 capitalize" x-text="fix.category"></td>
                      <td class="py-4 px-4">
                        <div class="font-bold text-white" x-text="fix.title"></div>
                        <div class="text-xs text-slate-400 mt-1" x-text="fix.message"></div>
                      </td>
                      <td class="py-4 px-4 text-xs text-blue-300 font-medium" x-text="fix.recommendation"></td>
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
      <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 class="text-2xl font-bold font-heading text-white mb-2">Whole-Site Crawler & Link Graph Audit</h1>
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
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition"
              />
            </div>
            <div class="md:col-span-3">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Max Pages to Crawl</label>
              <input 
                type="number" 
                x-model.number="crawlMaxPages" 
                min="5" 
                max="500" 
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white transition focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>
            <div class="md:col-span-3">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Max Click Depth</label>
              <input 
                type="number" 
                x-model.number="crawlMaxDepth" 
                min="1" 
                max="6" 
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white transition focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <label class="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" x-model="crawlSitemap" class="rounded border-slate-700 text-[#1D4ED8] focus:ring-[#1D4ED8] bg-[#070C1B]">
              <span>Automatically discover and ingest sitemap.xml</span>
            </label>

            <button 
              type="submit" 
              :disabled="crawlLoading"
              class="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition duration-150 flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-[#1D4ED8]/25"
            >
              <span x-show="!crawlLoading">Start Whole-Site Crawl</span>
              <span x-show="crawlLoading" class="flex items-center space-x-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                <span>Crawling Site...</span>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Live Progress Bar -->
      <div x-show="crawlProgress" class="bg-[#0F1A36] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-3">
            <span class="inline-block w-3 h-3 rounded-full animate-ping bg-[#1D4ED8]" x-show="crawlProgress?.status === 'running'"></span>
            <span class="font-bold text-white text-sm" x-text="'Crawl Status: ' + (crawlProgress?.status || '').toUpperCase()"></span>
          </div>
          <span class="text-xs text-slate-400 font-mono" x-text="(crawlProgress?.pages_crawled || 0) + ' pages audited'"></span>
        </div>
        <div class="w-full bg-[#070C1B] rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div class="bg-[#1D4ED8] h-2.5 rounded-full transition-all duration-300" :style="`width: ${Math.min(100, Math.round(((crawlProgress?.pages_crawled||0)/crawlMaxPages)*100))}%`"></div>
        </div>
      </div>

      <!-- Crawl Report View -->
      <template x-if="crawlReport">
        <div class="space-y-8">
          <!-- Crawl Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Average Health Score</p>
              <div class="text-3xl font-extrabold font-heading text-emerald-400" x-text="crawlReport.average_health_score + ' / 100'"></div>
              <p class="text-xs text-slate-400 mt-1" x-text="'Across ' + crawlReport.total_pages_crawled + ' crawled pages'"></p>
            </div>

            <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Broken Links</p>
              <div class="text-3xl font-extrabold font-heading text-[#FF6B4A]" x-text="crawlReport.broken_links_count"></div>
              <p class="text-xs text-slate-400 mt-1">4xx & 5xx HTTP response codes</p>
            </div>

            <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Duplicate Titles</p>
              <div class="text-3xl font-extrabold font-heading text-amber-400" x-text="crawlReport.duplicate_titles.length"></div>
              <p class="text-xs text-slate-400 mt-1">Duplicate metadata clusters</p>
            </div>

            <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6">
              <p class="text-xs uppercase tracking-wider text-slate-400 mb-1">Orphan Pages</p>
              <div class="text-3xl font-extrabold font-heading text-purple-400" x-text="crawlReport.orphan_pages_count"></div>
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

    <!-- ================= TAB 3: KEYWORD RESEARCH ================= -->
    <div x-show="activeTab === 'keywords'" class="space-y-8">
      <!-- Input Card -->
      <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-2xl font-bold font-heading text-white">Keyword Research & Intent Clustering</h1>
          <span class="text-xs bg-[#1D4ED8]/10 text-blue-400 border border-[#1D4ED8]/30 px-3 py-1 rounded-full font-semibold">
            Google Autocomplete + A-Z Expansion
          </span>
        </div>
        <p class="text-slate-400 text-sm mb-6">Discover long-tail keyword opportunities, classify search intent (Informational, Commercial, Transactional, Navigational), cluster semantic themes, and calculate priority scores.</p>

        <form @submit.prevent="runKeywordResearch()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div class="md:col-span-8">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Seed Keyword</label>
              <input 
                type="text" 
                x-model="kwSeed" 
                placeholder="e.g. seo tools, best hiking boots, crm software" 
                required
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition"
              />
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Country Market</label>
              <select 
                x-model="kwCountry" 
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition"
              >
                <option value="US">United States (US)</option>
                <option value="GB">United Kingdom (UK)</option>
                <option value="CA">Canada (CA)</option>
                <option value="AU">Australia (AU)</option>
                <option value="DE">Germany (DE)</option>
                <option value="FR">France (FR)</option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div class="flex flex-wrap items-center gap-5">
              <label class="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" x-model="kwExpandAZ" class="rounded border-slate-700 text-[#1D4ED8] focus:ring-[#1D4ED8] bg-[#070C1B]">
                <span>A-Z Alphabet Modifiers</span>
              </label>
              <label class="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" x-model="kwExpandQuestions" class="rounded border-slate-700 text-[#1D4ED8] focus:ring-[#1D4ED8] bg-[#070C1B]">
                <span>Questions & Prepositions (how, best, vs)</span>
              </label>
              <label class="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" x-model="kwUsePaid" class="rounded border-slate-700 text-[#1D4ED8] focus:ring-[#1D4ED8] bg-[#070C1B]">
                <span class="text-amber-400 font-medium">DataForSEO BYOK</span>
              </label>
            </div>

            <button 
              type="submit" 
              :disabled="kwLoading"
              class="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition duration-150 flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-[#1D4ED8]/25"
            >
              <span x-show="!kwLoading">Discover Keywords</span>
              <span x-show="kwLoading" class="flex items-center space-x-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                <span>Expanding Ideas...</span>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Keyword Results Section -->
      <template x-if="kwResult">
        <div class="space-y-6">
          <!-- Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Total Keywords</span>
              <p class="text-3xl font-extrabold font-heading text-white mt-1" x-text="kwResult.total_found"></p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Topic Clusters</span>
              <p class="text-3xl font-extrabold font-heading text-[#1D4ED8] mt-1" x-text="kwResult.clusters.length"></p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">API Cost (USD)</span>
              <p class="text-3xl font-extrabold font-heading text-cyan-400 mt-1" x-text="'$' + (kwResult.cost_usd || 0).toFixed(4)"></p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl flex items-center justify-between">
              <div>
                <span class="text-xs uppercase font-semibold text-slate-400">Export Report</span>
                <p class="text-xs text-slate-500 mt-1">Full dataset with intent & scores</p>
              </div>
              <button @click="downloadKeywordCSV()" class="bg-[#132145] hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition">
                CSV Export
              </button>
            </div>
          </div>

          <!-- Clusters Carousel / Pills -->
          <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Semantic Topic Clusters</span>
              <span class="text-xs text-slate-400">Click a cluster to filter keywords</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="kwFilterCluster = 'all'" 
                :class="kwFilterCluster === 'all' ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'bg-[#070C1B] text-slate-300 hover:bg-slate-800 border border-slate-800'"
                class="px-3 py-1 rounded-lg text-xs transition"
              >
                All Clusters (<span x-text="kwResult.total_found"></span>)
              </button>
              <template x-for="c in kwResult.clusters" :key="c.cluster_name">
                <button 
                  @click="kwFilterCluster = c.cluster_name"
                  :class="kwFilterCluster === c.cluster_name ? 'bg-[#1D4ED8] text-white font-bold shadow-md shadow-[#1D4ED8]/30' : 'bg-[#070C1B] text-slate-300 hover:bg-slate-800 border border-slate-800'"
                  class="px-3 py-1 rounded-lg text-xs transition flex items-center space-x-1.5"
                >
                  <span x-text="c.cluster_name"></span>
                  <span class="opacity-60 text-[10px]" x-text="'(' + c.keyword_count + ')'"></span>
                </button>
              </template>
            </div>
          </div>

          <!-- Filter & Search Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <!-- Intent Filter Pills -->
            <div class="flex items-center space-x-1">
              <span class="text-xs text-slate-400 mr-2">Intent:</span>
              <button 
                @click="kwFilterIntent = 'all'" 
                :class="kwFilterIntent === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'" 
                class="px-2.5 py-1 rounded text-xs transition"
              >All</button>
              <button 
                @click="kwFilterIntent = 'informational'" 
                :class="kwFilterIntent === 'informational' ? 'bg-blue-900/60 text-blue-300 border border-blue-700' : 'text-slate-400 hover:text-white'" 
                class="px-2.5 py-1 rounded text-xs transition"
              >Informational</button>
              <button 
                @click="kwFilterIntent = 'commercial'" 
                :class="kwFilterIntent === 'commercial' ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'" 
                class="px-2.5 py-1 rounded text-xs transition"
              >Commercial</button>
              <button 
                @click="kwFilterIntent = 'transactional'" 
                :class="kwFilterIntent === 'transactional' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'text-slate-400 hover:text-white'" 
                class="px-2.5 py-1 rounded text-xs transition"
              >Transactional</button>
              <button 
                @click="kwFilterIntent = 'navigational'" 
                :class="kwFilterIntent === 'navigational' ? 'bg-purple-900/60 text-purple-300 border border-purple-700' : 'text-slate-400 hover:text-white'" 
                class="px-2.5 py-1 rounded text-xs transition"
              >Navigational</button>
            </div>

            <!-- Search input -->
            <div class="w-full sm:w-64">
              <input 
                type="text" 
                x-model="kwSearchQuery" 
                placeholder="Filter keywords..." 
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <!-- Keywords Data Table -->
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-950/60 border-b border-slate-700 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                  <tr>
                    <th class="py-3 px-4 text-center">Priority</th>
                    <th class="py-3 px-4">Keyword Opportunity</th>
                    <th class="py-3 px-4 text-right">Est. Volume</th>
                    <th class="py-3 px-4 text-center">KD (Difficulty)</th>
                    <th class="py-3 px-4 text-right">CPC ($)</th>
                    <th class="py-3 px-4 text-center">Search Intent</th>
                    <th class="py-3 px-4">Cluster Theme</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/50">
                  <template x-for="item in filteredKeywords()" :key="item.keyword">
                    <tr class="hover:bg-slate-700/30 transition">
                      <!-- Priority Score -->
                      <td class="py-3 px-4 text-center">
                        <span 
                          class="px-2 py-0.5 rounded text-xs font-bold font-mono"
                          :class="item.priority_score >= 70 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : (item.priority_score >= 50 ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-300')"
                          x-text="item.priority_score + '/100'"
                        ></span>
                      </td>
                      <!-- Keyword -->
                      <td class="py-3 px-4 font-semibold text-white" x-text="item.keyword"></td>
                      <!-- Search Volume -->
                      <td class="py-3 px-4 text-right font-mono font-bold text-slate-200" x-text="item.search_volume.toLocaleString()"></td>
                      <!-- KD Badge -->
                      <td class="py-3 px-4 text-center">
                        <span 
                          class="px-2 py-0.5 rounded text-xs font-bold font-mono"
                          :class="item.difficulty <= 30 ? 'bg-emerald-950 text-emerald-400' : (item.difficulty <= 60 ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400')"
                          x-text="item.difficulty"
                        ></span>
                      </td>
                      <!-- CPC -->
                      <td class="py-3 px-4 text-right font-mono text-slate-400 text-xs" x-text="'$' + item.cpc.toFixed(2)"></td>
                      <!-- Intent Pill -->
                      <td class="py-3 px-4 text-center">
                        <span 
                          class="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider"
                          :class="{
                            'bg-emerald-900/40 text-emerald-400 border border-emerald-800/60': item.intent === 'transactional',
                            'bg-cyan-900/40 text-cyan-400 border border-cyan-800/60': item.intent === 'commercial',
                            'bg-blue-900/40 text-blue-400 border border-blue-800/60': item.intent === 'informational',
                            'bg-purple-900/40 text-purple-400 border border-purple-800/60': item.intent === 'navigational'
                          }"
                          x-text="item.intent"
                        ></span>
                      </td>
                      <!-- Cluster -->
                      <td class="py-3 px-4 text-slate-300 text-xs italic" x-text="item.cluster"></td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- Saved Keyword Runs -->
      <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <h2 class="text-lg font-bold text-white mb-4">Historical Keyword Research Runs</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-950/60 border-b border-slate-700 text-xs uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Seed Keyword</th>
                <th class="py-3 px-4 text-center">Country</th>
                <th class="py-3 px-4 text-center">Total Ideas</th>
                <th class="py-3 px-4 text-right">Cost (USD)</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
              <template x-for="r in recentKeywordRuns" :key="r.id">
                <tr class="hover:bg-slate-700/30">
                  <td class="py-3 px-4 text-slate-400 text-xs" x-text="new Date(r.created_at).toLocaleString()"></td>
                  <td class="py-3 px-4 font-semibold text-white" x-text="r.seed_keyword"></td>
                  <td class="py-3 px-4 text-center uppercase text-xs font-mono" x-text="r.country"></td>
                  <td class="py-3 px-4 text-center font-mono font-bold" x-text="r.total_keywords"></td>
                  <td class="py-3 px-4 text-right font-mono text-cyan-400 text-xs" x-text="'$' + r.cost_usd.toFixed(4)"></td>
                  <td class="py-3 px-4 text-right">
                    <button @click="loadKeywordRun(r.id)" class="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition">
                      View Results
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ================= TAB 4: RANK TRACKER ================= -->
    <div x-show="activeTab === 'ranker'" class="space-y-8">
      <!-- Alerts Banner -->
      <template x-if="rankAlerts && rankAlerts.length > 0">
        <div class="bg-[#FF6B4A]/10 border border-[#FF6B4A]/40 rounded-xl p-4 text-[#FF6B4A]">
          <div class="flex items-center space-x-2 font-bold mb-2">
            <svg class="w-5 h-5 text-[#FF6B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span class="font-heading">SERP Volatility & Position Drop Alerts (<span x-text="rankAlerts.length"></span>)</span>
          </div>
          <div class="space-y-1 text-xs">
            <template x-for="a in rankAlerts" :key="a.target_id">
              <div class="flex items-center space-x-2">
                <span class="font-bold text-white" x-text="a.keyword"></span>
                <span class="text-slate-300">dropped from #<span x-text="a.old_position"></span> to #<span x-text="a.new_position"></span></span>
                <span class="text-[#FF6B4A] font-bold" x-text="'(' + a.change + ' spots)'"></span>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- Add Target & SERP Check Card -->
      <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold font-heading text-white">Keyword Rank Tracker</h1>
            <p class="text-slate-400 text-sm">Monitor SERP positions across desktop & mobile per target URL and location.</p>
          </div>
          <button 
            @click="checkRankPositions()" 
            :disabled="rankLoading || rankTargets.length === 0"
            class="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition flex items-center space-x-2 shadow-lg shadow-[#1D4ED8]/25 disabled:opacity-50"
          >
            <span x-show="!rankLoading">Run SERP Check</span>
            <span x-show="rankLoading">Checking SERPs...</span>
          </button>
        </div>

        <form @submit.prevent="addRankTarget()" class="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-800">
          <div class="md:col-span-4">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Target Keyword</label>
            <input type="text" x-model="newRankKeyword" placeholder="e.g. open source seo tool" required class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]" />
          </div>
          <div class="md:col-span-4">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Page URL</label>
            <input type="url" x-model="newRankUrl" placeholder="https://example.com/page" required class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Device</label>
            <select x-model="newRankDevice" class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]">
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          <div class="md:col-span-2 flex items-end">
            <button type="submit" class="w-full bg-[#132145] hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition">
              + Add Target
            </button>
          </div>
        </form>
      </div>

      <!-- Tracked Targets Table -->
      <div class="bg-[#0F1A36] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-base font-bold font-heading text-white">Tracked Keywords (<span x-text="rankTargets.length"></span>)</h2>
          <span class="text-xs text-slate-400">Pre-flight cost: $0.002 per check (DataForSEO BYOK)</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-950/60 border-b border-slate-700 text-xs uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th class="py-3 px-4">Keyword</th>
                <th class="py-3 px-4">Target URL</th>
                <th class="py-3 px-4 text-center">Device</th>
                <th class="py-3 px-4 text-center">Latest Position</th>
                <th class="py-3 px-4 text-center">Change</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
              <template x-if="rankTargets.length === 0">
                <tr><td colspan="6" class="text-center py-6 text-slate-500 text-sm">No keywords tracked yet. Add your first keyword above.</td></tr>
              </template>
              <template x-for="t in rankTargets" :key="t.id">
                <tr class="hover:bg-slate-700/30 transition">
                  <td class="py-3 px-4 font-semibold text-white" x-text="t.keyword"></td>
                  <td class="py-3 px-4 text-xs font-mono text-slate-400 max-w-xs truncate" x-text="t.target_url"></td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold" :class="t.device === 'mobile' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300'" x-text="t.device"></span>
                  </td>
                  <td class="py-3 px-4 text-center font-bold">
                    <span :class="t.last_position && t.last_position <= 10 ? 'text-emerald-400' : (t.last_position <= 30 ? 'text-amber-400' : 'text-slate-300')" x-text="t.last_position ? '#' + t.last_position : '-'"></span>
                  </td>
                  <td class="py-3 px-4 text-center font-semibold text-xs">
                    <span x-show="t.last_change > 0" class="text-emerald-400" x-text="'+' + t.last_change"></span>
                    <span x-show="t.last_change < 0" class="text-red-400" x-text="t.last_change"></span>
                    <span x-show="!t.last_change || t.last_change === 0" class="text-slate-500">-</span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <button @click="loadRankTrend(t.id)" class="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded transition">Trend</button>
                    <button @click="deleteRankTarget(t.id)" class="text-xs text-red-400 hover:text-red-300 px-2 py-1 transition">Delete</button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Trend Modal / Drawer -->
      <template x-if="selectedTrend">
        <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h3 class="text-lg font-bold text-white" x-text="selectedTrend.keyword"></h3>
              <p class="text-xs text-slate-400" x-text="selectedTrend.target_url"></p>
            </div>
            <button @click="selectedTrend = null" class="text-slate-400 hover:text-white text-sm">Close ✕</button>
          </div>
          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="bg-slate-900 p-3 rounded-lg border border-slate-700/60">
              <span class="text-xs text-slate-400 uppercase">Current</span>
              <p class="text-2xl font-bold text-white mt-1" x-text="selectedTrend.current_position ? '#' + selectedTrend.current_position : 'N/A'"></p>
            </div>
            <div class="bg-slate-900 p-3 rounded-lg border border-slate-700/60">
              <span class="text-xs text-slate-400 uppercase">Best</span>
              <p class="text-2xl font-bold text-emerald-400 mt-1" x-text="selectedTrend.best_position ? '#' + selectedTrend.best_position : 'N/A'"></p>
            </div>
            <div class="bg-slate-900 p-3 rounded-lg border border-slate-700/60">
              <span class="text-xs text-slate-400 uppercase">Worst</span>
              <p class="text-2xl font-bold text-red-400 mt-1" x-text="selectedTrend.worst_position ? '#' + selectedTrend.worst_position : 'N/A'"></p>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="text-slate-400 uppercase border-b border-slate-700">
                <tr><th class="py-2">Date</th><th class="py-2 text-center">Position</th><th class="py-2 text-center">Change</th><th class="py-2">Source</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <template x-for="c in selectedTrend.checks" :key="c.id">
                  <tr>
                    <td class="py-2 text-slate-400" x-text="new Date(c.checked_at).toLocaleDateString()"></td>
                    <td class="py-2 text-center font-bold text-white" x-text="c.position ? '#' + c.position : 'Not Found'"></td>
                    <td class="py-2 text-center font-bold" :class="c.position_change > 0 ? 'text-emerald-400' : (c.position_change < 0 ? 'text-red-400' : 'text-slate-500')" x-text="c.position_change || '-'"></td>
                    <td class="py-2 text-slate-400" x-text="c.source"></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>

    <!-- ================= TAB 5: BACKLINK TRACKER ================= -->
    <div x-show="activeTab === 'backlinks'" class="space-y-8">
      <!-- Input Card -->
      <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 class="text-2xl font-bold font-heading text-white mb-2">Backlink & Referring Domain Tracker</h1>
        <p class="text-slate-400 text-sm mb-6">Inspect backlink profile snapshots, referring domains, domain authority (DR proxy), anchor texts, and new/lost links.</p>

        <form @submit.prevent="fetchBacklinkSnapshot()" class="flex flex-wrap items-center gap-3">
          <input 
            type="text" 
            x-model="blDomain" 
            placeholder="e.g. example.com or mydomain.io" 
            required
            class="flex-1 bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition"
          />
          <button 
            type="submit" 
            :disabled="blLoading"
            class="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition duration-150 flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-[#1D4ED8]/25"
          >
            <span x-show="!blLoading">Snapshot Backlinks</span>
            <span x-show="blLoading">Analyzing...</span>
          </button>
        </form>
      </div>

      <!-- Snapshot Results Section -->
      <template x-if="blSnapshot">
        <div class="space-y-6">
          <!-- Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Total Backlinks</span>
              <p class="text-3xl font-extrabold font-heading text-white mt-1" x-text="blSnapshot.total_backlinks"></p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Referring Domains</span>
              <p class="text-3xl font-extrabold font-heading text-emerald-400 mt-1" x-text="blSnapshot.total_referring_domains"></p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Dofollow / Nofollow</span>
              <p class="text-xl font-bold font-heading text-cyan-400 mt-2">
                <span x-text="blSnapshot.dofollow_count"></span> <span class="text-xs text-slate-400">/</span> <span class="text-slate-300" x-text="blSnapshot.nofollow_count"></span>
              </p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl flex items-center justify-between">
              <div>
                <span class="text-xs uppercase font-semibold text-slate-400">Export Report</span>
                <p class="text-xs text-slate-500 mt-1">Full referring link data</p>
              </div>
              <button @click="downloadBacklinkCSV()" class="bg-[#132145] hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition">
                CSV Export
              </button>
            </div>
          </div>

          <!-- Referring Domains & Top Anchors Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <!-- Referring Domains -->
            <div class="md:col-span-8 bg-[#0F1A36] border border-slate-800 rounded-xl p-5 shadow-xl">
              <h3 class="text-base font-bold font-heading text-white mb-3">Top Referring Domains</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="text-slate-400 uppercase border-b border-slate-800">
                    <tr><th class="py-2">Domain</th><th class="py-2 text-center">DR</th><th class="py-2 text-center">Links</th><th class="py-2 text-center">Type</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800">
                    <template x-for="d in blSnapshot.referring_domains" :key="d.domain">
                      <tr>
                        <td class="py-2.5 font-semibold text-white" x-text="d.domain"></td>
                        <td class="py-2.5 text-center">
                          <span class="px-2 py-0.5 rounded font-bold" :class="d.domain_rank >= 70 ? 'bg-emerald-950 text-emerald-400' : 'bg-[#070C1B] text-slate-300'" x-text="d.domain_rank"></span>
                        </td>
                        <td class="py-2.5 text-center font-mono" x-text="d.total_links"></td>
                        <td class="py-2.5 text-center text-slate-400" x-text="d.dofollow_count + ' dofollow'"></td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Anchor Text Profile -->
            <div class="md:col-span-4 bg-[#0F1A36] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
              <h3 class="text-base font-bold font-heading text-white mb-2">Anchor Text Profile</h3>
              <div class="space-y-2">
                <template x-for="a in blSnapshot.top_anchor_texts" :key="a.text">
                  <div class="bg-[#070C1B] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <span class="text-slate-200 truncate max-w-[150px]" x-text="a.text"></span>
                    <span class="text-[#1D4ED8] font-bold" x-text="a.percentage + '% (' + a.count + ')'"></span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ================= TAB 6: COMPETITOR INSIGHTS ================= -->
    <div x-show="activeTab === 'competitors'" class="space-y-8">
      <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 class="text-2xl font-bold font-heading text-white mb-2">Competitor Keyword & Backlink Gap Analysis</h1>
        <p class="text-slate-400 text-sm mb-6">Compare your domain against competitors to find keywords they rank for that you are missing, and high-DR backlink opportunities.</p>

        <form @submit.prevent="runCompetitorAnalysis()" class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div class="md:col-span-5">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Your Target Domain</label>
            <input type="text" x-model="compTargetDomain" placeholder="e.g. neemseo.com" required class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]" />
          </div>
          <div class="md:col-span-5">
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Competitors (Comma-separated)</label>
            <input type="text" x-model="compDomainsInput" placeholder="e.g. semrush.com, ahrefs.com" required class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]" />
          </div>
          <div class="md:col-span-2 flex items-end">
            <button type="submit" :disabled="compLoading" class="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-sm shadow-md shadow-[#1D4ED8]/25 transition disabled:opacity-50">
              <span x-show="!compLoading">Compare Gaps</span>
              <span x-show="compLoading">Analyzing...</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Competitor Results -->
      <template x-if="compReport">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Shared Keywords</span>
              <p class="text-3xl font-extrabold font-heading text-[#1D4ED8] mt-1" x-text="compReport.total_shared_keywords"></p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Missing Keyword Opportunities</span>
              <p class="text-3xl font-extrabold font-heading text-[#FF6B4A] mt-1" x-text="compReport.total_missing_keywords"></p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Backlink Gap Leads</span>
              <p class="text-3xl font-extrabold font-heading text-cyan-400 mt-1" x-text="compReport.total_backlink_gaps"></p>
            </div>
          </div>

          <!-- Keyword Gaps Table -->
          <div class="bg-[#0F1A36] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div class="p-4 border-b border-slate-800"><h3 class="text-base font-bold font-heading text-white">Keyword Gaps (Competitors Rank, You Don't)</h3></div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#070C1B] border-b border-slate-800 text-slate-400 uppercase">
                  <tr><th class="py-3 px-4">Keyword</th><th class="py-3 px-4 text-right">Volume</th><th class="py-3 px-4 text-center">KD</th><th class="py-3 px-4 text-center">Gap Status</th><th class="py-3 px-4 text-center">Priority</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  <template x-for="k in compReport.keyword_gaps" :key="k.keyword">
                    <tr class="hover:bg-slate-800/40">
                      <td class="py-2.5 px-4 font-semibold text-white" x-text="k.keyword"></td>
                      <td class="py-2.5 px-4 text-right font-mono" x-text="k.search_volume.toLocaleString()"></td>
                      <td class="py-2.5 px-4 text-center" x-text="k.difficulty"></td>
                      <td class="py-2.5 px-4 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold" :class="k.gap_type === 'missing' ? 'bg-[#FF6B4A]/20 text-[#FF6B4A] border border-[#FF6B4A]/50' : 'bg-blue-950 text-blue-400 border border-blue-800'" x-text="k.gap_type"></span>
                      </td>
                      <td class="py-2.5 px-4 text-center font-bold text-[#1D4ED8]" x-text="k.priority_score"></td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ================= TAB 7: AI VISIBILITY (GEO) ================= -->
    <div x-show="activeTab === 'ai-visibility'" class="space-y-8">
      <div class="bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-2xl font-bold font-heading text-white">Generative Engine Optimization (GEO) & AI Visibility</h1>
          <span class="text-xs bg-[#1D4ED8]/10 text-blue-400 border border-[#1D4ED8]/30 px-2.5 py-1 rounded-full font-mono">ChatGPT · Claude · Perplexity · Gemini · AI Overviews</span>
        </div>
        <p class="text-slate-400 text-sm mb-6">Track brand mentions, citations, and recommendation sentiment when users query AI answer engines. Measure your AI Visibility Score (0–100) and receive actionable GEO fixes.</p>

        <form @submit.prevent="runAIVisibility()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Target Domain</label>
              <input 
                type="text" 
                x-model="aiDomain" 
                placeholder="neemseo.com" 
                required
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>
            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Brand / Product Name</label>
              <input 
                type="text" 
                x-model="aiBrand" 
                placeholder="neemSEO" 
                required
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              :disabled="aiLoading"
              class="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition duration-150 flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-[#1D4ED8]/25"
            >
              <span x-show="!aiLoading">Run AI Visibility Audit</span>
              <span x-show="aiLoading" class="flex items-center space-x-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                <span>Evaluating AI Engines...</span>
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- AI Visibility Results -->
      <template x-if="aiResult">
        <div class="space-y-6">
          <!-- Score Metric Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">AI Visibility Score</span>
              <div class="flex items-baseline space-x-2 mt-1">
                <span class="text-4xl font-extrabold font-heading" :class="aiResult.overall_score >= 70 ? 'text-emerald-400' : (aiResult.overall_score >= 40 ? 'text-amber-400' : 'text-[#FF6B4A]')" x-text="aiResult.overall_score"></span>
                <span class="text-slate-500 text-sm font-medium">/ 100</span>
              </div>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Mention Rate</span>
              <p class="text-3xl font-extrabold font-heading text-white mt-1"><span x-text="aiResult.mention_rate_pct"></span>%</p>
            </div>
            <div class="bg-[#0F1A36] border border-slate-800 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Direct Citation Rate</span>
              <p class="text-3xl font-extrabold font-heading text-cyan-400 mt-1"><span x-text="aiResult.citation_rate_pct"></span>%</p>
            </div>
            <div class="bg-slate-800/80 border border-slate-700 p-5 rounded-xl">
              <span class="text-xs uppercase font-semibold text-slate-400">Top Recommendation Rate</span>
              <p class="text-3xl font-extrabold text-emerald-400 mt-1"><span x-text="aiResult.recommendation_rate_pct"></span>%</p>
            </div>
          </div>

          <!-- Engine Breakdown Cards -->
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-xl">
            <h3 class="text-base font-bold text-white mb-4">AI Engine Performance Breakdown</h3>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <template x-for="eng in aiResult.engine_breakdown" :key="eng.engine">
                <div class="bg-slate-900/80 border border-slate-700/60 rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <span class="text-xs font-semibold text-slate-300 block truncate" x-text="eng.display_name"></span>
                    <div class="flex items-baseline space-x-1.5 mt-2">
                      <span class="text-2xl font-bold" :class="eng.visibility_score >= 70 ? 'text-emerald-400' : (eng.visibility_score >= 40 ? 'text-amber-400' : 'text-red-400')" x-text="eng.visibility_score"></span>
                      <span class="text-xs text-slate-500">/ 100</span>
                    </div>
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div class="flex justify-between"><span>Mentions:</span> <span class="font-mono text-white" x-text="eng.mentions"></span></div>
                    <div class="flex justify-between"><span>Citations:</span> <span class="font-mono text-cyan-400" x-text="eng.citations"></span></div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- GEO Optimization Tips -->
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-xl">
            <h3 class="text-base font-bold text-amber-400 mb-3 flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>Actionable Generative Engine Optimization (GEO) Fixes</span>
            </h3>
            <ul class="space-y-2 text-sm text-slate-300">
              <template x-for="tip in aiResult.optimization_tips" :key="tip">
                <li class="flex items-start space-x-2">
                  <span class="text-emerald-400 font-bold">✓</span>
                  <span x-text="tip"></span>
                </li>
              </template>
            </ul>
          </div>

          <!-- Detailed Query Results Table -->
          <div class="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <div class="p-4 border-b border-slate-700">
              <h3 class="text-base font-bold text-white">Evaluated Conversational Queries & AI Overviews</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-950/60 border-b border-slate-700 text-slate-400 uppercase">
                  <tr>
                    <th class="py-3 px-4">User Prompt Query</th>
                    <th class="py-3 px-4">Engine</th>
                    <th class="py-3 px-4 text-center">Cited</th>
                    <th class="py-3 px-4 text-center">Rank</th>
                    <th class="py-3 px-4 text-center">Sentiment</th>
                    <th class="py-3 px-4">Extracted Snippet Context</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/50">
                  <template x-for="(q, idx) in aiResult.query_results" :key="idx">
                    <tr class="hover:bg-slate-700/30">
                      <td class="py-3 px-4 font-medium text-white max-w-xs truncate" x-text="q.query"></td>
                      <td class="py-3 px-4 text-slate-300 font-mono text-[11px]" x-text="q.engine"></td>
                      <td class="py-3 px-4 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="q.is_cited ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-800 text-slate-500'" x-text="q.is_cited ? 'YES' : 'NO'"></span>
                      </td>
                      <td class="py-3 px-4 text-center font-mono text-slate-200" x-text="q.position ? '#' + q.position : '-'"></td>
                      <td class="py-3 px-4 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold" :class="q.sentiment === 'positive' ? 'bg-emerald-950 text-emerald-400' : (q.sentiment === 'neutral' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-500')" x-text="q.sentiment"></span>
                      </td>
                      <td class="py-3 px-4 text-slate-400 max-w-md truncate" x-text="q.excerpt || 'Brand not referenced in response'"></td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ================= TAB 8: TEAM & MCP API KEYS ================= -->
    <div x-show="activeTab === 'team'" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Team Management -->
        <div class="md:col-span-7 bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold font-heading text-white">Team Members</h2>
            <button @click="loadTeam()" class="text-xs text-[#1D4ED8] hover:text-blue-400 font-semibold">Refresh</button>
          </div>
          
          <!-- Invite Teammate Form -->
          <form @submit.prevent="createInvite()" class="bg-[#070C1B] p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 class="text-xs uppercase font-bold text-slate-400 tracking-wider">Invite Teammate</h3>
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div class="sm:col-span-8">
                <input 
                  type="email" 
                  x-model="inviteEmail" 
                  placeholder="colleague@company.com" 
                  required
                  class="w-full bg-[#0B1226] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                />
              </div>
              <div class="sm:col-span-4">
                <button 
                  type="submit" 
                  class="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs shadow-md shadow-[#1D4ED8]/25 transition"
                >
                  Generate Link
                </button>
              </div>
            </div>
            <template x-if="inviteSuccess">
              <div class="p-3 bg-[#132145] border border-[#1D4ED8]/40 rounded-lg text-xs text-slate-200">
                <div class="font-bold mb-1 text-white">Invitation Link Created:</div>
                <div class="font-mono break-all text-[11px] bg-[#070C1B] p-2 rounded text-blue-300" x-text="inviteSuccess.invite_url"></div>
              </div>
            </template>
          </form>

          <!-- Members Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-slate-800 text-slate-400 uppercase">
                <tr><th class="py-2.5 px-3">Email</th><th class="py-2.5 px-3 text-center">Role</th><th class="py-2.5 px-3 text-center">Status</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <template x-for="m in teamList" :key="m.id">
                  <tr>
                    <td class="py-2.5 px-3 text-white font-medium" x-text="m.email"></td>
                    <td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold" :class="m.role === 'admin' ? 'bg-purple-950 text-purple-400' : 'bg-slate-800 text-slate-300'" x-text="m.role"></span></td>
                    <td class="py-2.5 px-3 text-center"><span class="text-[#1D4ED8] font-semibold" x-text="m.is_active ? 'Active' : 'Inactive'"></span></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- MCP API Token & Agent Integration -->
        <div class="md:col-span-5 bg-[#0F1A36] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 class="text-xl font-bold font-heading text-white">AI Agent & MCP Keys</h2>
          <p class="text-xs text-slate-400 leading-relaxed">
            Connect AI coding agents (Claude Code, ChatGPT, Cursor, Codex) to neemSEO via the Model Context Protocol. MCP clients authenticate using your per-user API key.
          </p>

          <div class="bg-[#070C1B] border border-slate-800 rounded-xl p-4 space-y-3">
            <span class="text-xs uppercase font-bold text-slate-400">Claude Code / Cursor Configuration</span>
            <pre class="bg-[#0B1226] p-3 rounded-lg text-[11px] font-mono text-blue-300 overflow-x-auto border border-slate-800"><code>{
  "mcpServers": {
    "neemseo": {
      "command": "python",
      "args": ["-m", "neemseo.mcp.server"]
    }
  }
}</code></pre>
          </div>

          <div class="space-y-2">
            <div class="text-xs uppercase font-bold text-slate-400">Your MCP API Token</div>
            <div class="flex items-center space-x-2">
              <input 
                type="text" 
                readonly 
                :value="userApiToken || 'neemseo_live_demo_unconfigured'"
                class="w-full bg-[#070C1B] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-[#1D4ED8]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

  </main>
  </div>

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

        // Keyword research state
        kwSeed: '',
        kwCountry: 'US',
        kwExpandAZ: true,
        kwExpandQuestions: true,
        kwUsePaid: false,
        kwLoading: false,
        kwResult: null,
        kwFilterIntent: 'all',
        kwFilterCluster: 'all',
        kwSearchQuery: '',
        recentKeywordRuns: [],

        // Rank Tracker state
        rankTargets: [],
        rankLoading: false,
        newRankKeyword: '',
        newRankUrl: '',
        newRankDevice: 'desktop',
        rankAlerts: [],
        selectedTrend: null,

        // Backlinks state
        blDomain: '',
        blLoading: false,
        blSnapshot: null,

        // Competitor state
        compTargetDomain: '',
        compDomainsInput: '',
        compLoading: false,
        compReport: null,

        // AI Visibility state
        aiDomain: '',
        aiBrand: '',
        aiLoading: false,
        aiResult: null,
        aiHistory: [],

        // Team & MCP Key state
        teamList: [],
        inviteEmail: '',
        inviteRole: 'member',
        inviteSuccess: null,
        userApiToken: '',

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
            if (!res.ok) {
              const errData = await res.json().catch(() => null);
              throw new Error(errData?.detail || `Server returned ${res.status}`);
            }
            const data = await res.json();
            const crawlId = data.crawl_id;
            
            // Poll for progress until finished
            const interval = setInterval(async () => {
              const statusRes = await fetch(`/api/v1/crawls/${crawlId}`);
              if (!statusRes.ok) return;
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

        async runKeywordResearch() {
          this.kwLoading = true;
          this.kwResult = null;
          try {
            const res = await fetch('/api/v1/keywords/research', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                seed_keyword: this.kwSeed,
                country_code: this.kwCountry,
                expand_alphabet: this.kwExpandAZ,
                expand_questions: this.kwExpandQuestions,
                use_paid_api: this.kwUsePaid,
                max_results: 120
              })
            });
            this.kwResult = await res.json();
            this.loadRecentKeywordRuns();
          } catch (e) {
            alert('Keyword research error: ' + e.message);
          } finally {
            this.kwLoading = false;
          }
        },

        async loadRecentKeywordRuns() {
          try {
            const res = await fetch('/api/v1/keywords/runs?limit=10');
            this.recentKeywordRuns = await res.json();
          } catch(e) {}
        },

        async loadKeywordRun(runId) {
          try {
            const res = await fetch(`/api/v1/keywords/runs/${runId}`);
            const data = await res.json();
            this.kwResult = {
              id: data.id,
              seed_keyword: data.seed_keyword,
              country_code: data.country,
              total_found: data.total_keywords,
              cost_usd: data.cost_usd,
              clusters: data.clusters_summary || [],
              keywords: data.keywords || []
            };
          } catch(e) {}
        },

        downloadKeywordCSV() {
          if (!this.kwResult || !this.kwResult.id) return;
          window.location.href = `/api/v1/keywords/runs/${this.kwResult.id}/export.csv`;
        },

        filteredKeywords() {
          if (!this.kwResult || !this.kwResult.keywords) return [];
          return this.kwResult.keywords.filter(k => {
            const matchesIntent = this.kwFilterIntent === 'all' || k.intent === this.kwFilterIntent;
            const matchesCluster = this.kwFilterCluster === 'all' || k.cluster === this.kwFilterCluster;
            const matchesSearch = !this.kwSearchQuery || k.keyword.toLowerCase().includes(this.kwSearchQuery.toLowerCase());
            return matchesIntent && matchesCluster && matchesSearch;
          });
        },

        downloadAuditCSV() {
          if (!this.report) return;
          window.location.href = `/api/v1/audit/${this.report.id || ''}/csv`;
        },

        // Rank Tracker Methods
        async loadRankTargets() {
          try {
            const res = await fetch('/api/v1/rank-tracker/targets');
            const targets = await res.json();
            const histRes = await fetch('/api/v1/rank-tracker/history?limit=100');
            const history = await histRes.json();
            const lastMap = {};
            history.forEach(h => {
              if (!lastMap[h.target_id]) {
                lastMap[h.target_id] = { position: h.position, change: h.position_change };
              }
            });
            this.rankTargets = targets.map(t => ({
              ...t,
              last_position: lastMap[t.id]?.position || null,
              last_change: lastMap[t.id]?.change || null
            }));
          } catch(e) {}
        },

        async addRankTarget() {
          try {
            const res = await fetch('/api/v1/rank-tracker/targets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                keyword: this.newRankKeyword,
                target_url: this.newRankUrl,
                device: this.newRankDevice
              })
            });
            if (res.ok) {
              this.newRankKeyword = '';
              this.newRankUrl = '';
              this.loadRankTargets();
            }
          } catch(e) {
            alert('Failed to add target: ' + e.message);
          }
        },

        async deleteRankTarget(id) {
          if (!confirm('Stop tracking this keyword?')) return;
          try {
            await fetch(`/api/v1/rank-tracker/targets/${id}`, { method: 'DELETE' });
            this.loadRankTargets();
          } catch(e) {}
        },

        async checkRankPositions() {
          this.rankLoading = true;
          try {
            const res = await fetch('/api/v1/rank-tracker/check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ confirm_cost: true })
            });
            await res.json();
            await this.loadRankTargets();
            await this.loadRankAlerts();
          } catch(e) {
            alert('SERP check failed: ' + e.message);
          } finally {
            this.rankLoading = false;
          }
        },

        async loadRankTrend(targetId) {
          try {
            const res = await fetch(`/api/v1/rank-tracker/trends/${targetId}`);
            this.selectedTrend = await res.json();
          } catch(e) {}
        },

        async loadRankAlerts() {
          try {
            const res = await fetch('/api/v1/rank-tracker/alerts');
            this.rankAlerts = await res.json();
          } catch(e) {}
        },

        // Backlinks Methods
        async fetchBacklinkSnapshot() {
          this.blLoading = true;
          this.blSnapshot = null;
          try {
            const res = await fetch('/api/v1/backlinks/snapshot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target_domain: this.blDomain, confirm_cost: true })
            });
            this.blSnapshot = await res.json();
          } catch(e) {
            alert('Backlink analysis failed: ' + e.message);
          } finally {
            this.blLoading = false;
          }
        },

        downloadBacklinkCSV() {
          if (!this.blSnapshot || !this.blSnapshot.id) return;
          window.location.href = `/api/v1/backlinks/snapshots/${this.blSnapshot.id}/export.csv`;
        },

        // Competitor Methods
        async runCompetitorAnalysis() {
          this.compLoading = true;
          this.compReport = null;
          const comps = this.compDomainsInput.split(',').map(s => s.trim()).filter(Boolean);
          try {
            const res = await fetch('/api/v1/competitors/gap-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                target_domain: this.compTargetDomain,
                competitors: comps
              })
            });
            this.compReport = await res.json();
          } catch(e) {
            alert('Competitor analysis failed: ' + e.message);
          } finally {
            this.compLoading = false;
          }
        },

        // AI Visibility Methods
        async runAIVisibility() {
          this.aiLoading = true;
          this.aiResult = null;
          try {
            const res = await fetch('/api/v1/ai-visibility/audit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                domain: this.aiDomain,
                brand_name: this.aiBrand
              })
            });
            this.aiResult = await res.json();
            this.loadAIHistory();
          } catch(e) {
            alert('AI Visibility audit failed: ' + e.message);
          } finally {
            this.aiLoading = false;
          }
        },

        async loadAIHistory() {
          try {
            const res = await fetch('/api/v1/ai-visibility/history?limit=10');
            this.aiHistory = await res.json();
          } catch(e) {}
        },

        // Team & Auth Methods
        async loadTeam() {
          try {
            const res = await fetch('/api/v1/auth/team');
            if (res.ok) {
              this.teamList = await res.json();
            }
            const meRes = await fetch('/api/v1/auth/me');
            if (meRes.ok) {
              const me = await meRes.json();
              this.userApiToken = me.api_token;
            }
          } catch(e) {}
        },

        async createInvite() {
          try {
            const res = await fetch('/api/v1/auth/invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: this.inviteEmail,
                role: this.inviteRole
              })
            });
            if (res.ok) {
              this.inviteSuccess = await res.json();
              this.inviteEmail = '';
              this.loadTeam();
            } else {
              const err = await res.json();
              alert('Invite failed: ' + (err.detail || 'Error'));
            }
          } catch(e) {
            alert('Invite error: ' + e.message);
          }
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
