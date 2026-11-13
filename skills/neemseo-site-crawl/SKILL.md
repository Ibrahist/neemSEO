---
name: neemseo-site-crawl
description: Guide an AI agent through crawling an entire website with neemSEO, analyzing the internal link graph, identifying broken links, duplicate metadata, orphan pages, and comparing crawl runs.
---

# neemSEO Whole-Site Crawl Agent Skill

When a user asks you to audit an entire domain, map site architecture, detect 404 broken links across a website, or compare crawl changes, follow this workflow using the `neemseo` MCP server.

## Step 1: Initiate the Crawl
Call `start_site_crawl`:
- `seed_url`: Root domain homepage (e.g. `https://example.com`).
- `max_pages`: Default 50–100 for fast audits; up to 500 for larger sites.
- `max_depth`: Default 3 (covers Homepage -> Section -> Article).
- `check_sitemap`: Set `True` to ingest and cross-reference `sitemap.xml`.

Save the returned `crawl_id`.

## Step 2: Monitor Progress
Poll `get_crawl_progress(crawl_id=crawl_id)` until status is `completed`.

## Step 3: Analyze the Whole-Site Report
Call `get_site_crawl_report(crawl_id=crawl_id)`.
Examine the following key SEO health signals:
1. **Broken Links (4xx/5xx)**:
   - Identify which source pages contain links to dead URLs.
   - List the exact anchor text to locate them in source templates.
2. **Duplicate Titles & Descriptions**:
   - Flag pages that share the exact same title tag or meta description.
   - Recommend unique, keyword-differentiated metadata for each page.
3. **Orphan Pages**:
   - Spot URLs present in `sitemap.xml` that receive zero internal links from within the website navigation.
   - Recommend adding contextually relevant internal links to help bots and users discover them.
4. **Click Depth Architecture**:
   - Verify that critical landing pages are reachable within 1 to 3 clicks from the homepage.
5. **Directives & Blocking**:
   - Note any pages inadvertently returning `noindex` or blocked by `robots.txt`.

## Step 4: Compare Changes Over Time
When the user deploys technical fixes and re-crawls:
- Call `compare_site_crawls(base_crawl_id=old_id, target_crawl_id=new_id)`.
- Highlight score movement, resolved 404 links, and eliminated duplicate titles.

