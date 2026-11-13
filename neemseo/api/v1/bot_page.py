"""
Public information page for neemSEO-Bot.
Explains the bot purpose, crawl behavior, robots.txt compliance, and instructions for webmasters on how to block it.
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["Crawler Bot Info"])

BOT_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>neemSEO-Bot Information & Robots.txt Instructions</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
    <div class="flex items-center space-x-3 mb-6">
      <div class="h-10 w-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">n</div>
      <h1 class="text-3xl font-extrabold text-slate-900">neemSEO-Bot</h1>
    </div>

    <p class="text-lg text-slate-600 mb-6">
      <strong>neemSEO-Bot</strong> is the web crawler for <em>neemSEO</em>, an open-source SEO analysis tool.
      It audits websites to check for on-page SEO issues, broken links, heading hierarchies, performance vitals, and metadata optimizations on behalf of website owners.
    </p>

    <div class="border-t border-slate-200 pt-6 my-6">
      <h2 class="text-xl font-bold text-slate-900 mb-3">User-Agent Strings</h2>
      <pre class="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">Mozilla/5.0 (compatible; neemSEO-Bot/1.0; +http://localhost:8000/bot)</pre>
    </div>

    <div class="border-t border-slate-200 pt-6 my-6">
      <h2 class="text-xl font-bold text-slate-900 mb-3">Polite Crawling Policy</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600">
        <li>Strictly respects <code>robots.txt</code> directives before requesting pages.</li>
        <li>Respects <code>&lt;meta name="robots" content="noindex, nofollow"&gt;</code> tags.</li>
        <li>Throttles concurrent requests to avoid server strain.</li>
        <li>Does not harvest personal email addresses or scrape copyrighted content for resale.</li>
      </ul>
    </div>

    <div class="border-t border-slate-200 pt-6 my-6">
      <h2 class="text-xl font-bold text-slate-900 mb-3">How to Block neemSEO-Bot</h2>
      <p class="text-slate-600 mb-4">
        If you are a webmaster and do not want neemSEO to crawl your site, add the following directive to your <code>robots.txt</code> file:
      </p>

      <div class="mb-4">
        <h3 class="text-sm font-semibold text-slate-700 mb-1">Block completely:</h3>
        <pre class="bg-slate-900 text-red-400 p-4 rounded-lg font-mono text-sm">User-agent: neemSEO-Bot
Disallow: /</pre>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-slate-700 mb-1">Block specific directories:</h3>
        <pre class="bg-slate-900 text-yellow-300 p-4 rounded-lg font-mono text-sm">User-agent: neemSEO-Bot
Disallow: /private/
Disallow: /api/</pre>
      </div>
    </div>

    <div class="border-t border-slate-200 pt-6 my-6 text-sm text-slate-500">
      <p>neemSEO is open-source software licensed under MIT. For questions or concerns, please visit the repository documentation.</p>
    </div>
  </div>
</body>
</html>
"""


@router.get("/bot", response_class=HTMLResponse)
def bot_info_page():
    return HTMLResponse(content=BOT_HTML)
