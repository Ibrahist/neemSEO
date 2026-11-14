# neemSEO

> An all-in-one, open-source SEO suite and alternative to Semrush/Ahrefs that is simple, focused, and pay-as-you-go.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)](https://www.docker.com/)

**neemSEO** gives creators, developers, and marketing teams the power of professional SEO tools without high monthly subscription fees ($120–$500/month).

---

## Key Pillars

- **Focused Workflows**: On-page auditor, site crawler, keyword research, rank tracker, and AI search visibility. No bloated legacy suite features.
- **Pay-As-You-Go / Bring-Your-Own-Key (BYOK)**: No recurring neemSEO subscription. Connect your DataForSEO or SerpApi key and pay only fractions of a cent per lookup.
- **MCP Server & Agent Skills**: Native Model Context Protocol (`neemseo`) server and reusable agent skills for Claude Code, ChatGPT, Codex, and Cursor to audit sites and plan keywords autonomously.
- **Self-Hosting First**: Preconfigured Docker Compose image ready for your VPS, Coolify, Portainer, or Dokploy.
- **Polite Crawler**: Identified honestly as `neemSEO-Bot/1.0 (+https://your-site/bot)`, respects `robots.txt`, and obeys rate limits.

---

## The Core Tools + AI Agent Interface

1. **On-Page SEO Auditor**: Fast, granular inspection of page titles, meta descriptions, single H1 & logical heading hierarchy, image alt attributes, canonical tags, indexability directives, link profiles, and body content depth. Integrates Google Core Web Vitals (LCP, INP, CLS).
2. **Site Crawler**: Whole-site auditing from root URL or sitemap, orphan page detection, broken link graphs, duplicate content flags, and crawl difference comparisons.
3. **Keyword Research Tool**: Google Autocomplete expansion, search volume metrics, topical clustering, and search intent classification.
4. **Rank Tracker & Backlink Tracker**: Scheduled position tracking by location and device, rank drop alerts, backlink profile snapshots, and competitor gap analysis.
5. **AI Visibility Engine (GEO)**: Tracks brand mentions, direct citations, and recommendation sentiment across AI answer engines (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) with actionable Generative Engine Optimization fixes.
6. **Auth & Team Management**: Simple email/password accounts where the first visitor creates the admin account, teammates join through secure invitation links, and MCP clients authenticate with per-user API tokens (`neemseo_live_...`).
7. **MCP Server (`neemseo`) & Agent Skills**: Enables AI agents (Claude Code, ChatGPT, Codex, Cursor) to audit URLs, list fixes, track rankings, and optimize visibility autonomously.

---

## Quickstart

### 1. Terminal CLI

```bash
# Clone the repository
git clone https://github.com/your-org/neemseo.git
cd neemseo

# Install dependencies in editable mode
pip install -e .

# 1. On-Page SEO Audit
neemseo audit https://example.com --keyword "example" --pagespeed --csv report.csv

# 2. Whole-Site Crawler & Link Graph
neemseo crawl https://example.com --max-pages 50 --max-depth 3
neemseo crawls
neemseo crawl-compare <base-id> <target-id>

# 3. Keyword Research & Intent Clustering
neemseo keywords "seo tools" --country US --expand-az --limit 50 --csv keywords.csv
neemseo keyword-lists

# 4. Rank Tracker & SERP Checks
neemseo rank-add "open source seo tool" "https://example.com/features" --device desktop
neemseo rank-targets
neemseo rank-check --confirm
neemseo rank-trend <target-id>
neemseo rank-schedule-run

# 5. Backlink Profile & Competitor Gaps
neemseo backlinks example.com --limit 30 --confirm
neemseo backlink-history
neemseo competitor-gap "example.com" "competitor1.com" "competitor2.com"
# 6. AI Visibility Audit (Generative Engine Optimization)
neemseo ai-visibility example.com --brand "Example Brand"

# 7. Team & MCP Access
neemseo setup-admin --email admin@example.com
neemseo invite-user colleague@example.com --role member
neemseo team
```

### 2. Web Dashboard

```bash
python backend/main.py
```
Open **http://localhost:8000** to access the complete interactive dashboard featuring Page Auditor, Site Crawler, Keyword Research, Rank Tracker, Backlinks, Competitor Gap Analysis, AI Visibility (GEO), and Team & API Keys.

### 3. Docker Compose

```bash
docker compose up -d
```

---

## MCP Server Setup

neemSEO ships with a built-in MCP server named `neemseo`.

### Claude Code / Cursor Configuration

Add this to your MCP configuration (`claude_desktop_config.json` or Cursor MCP settings):

```json
{
  "mcpServers": {
    "neemseo": {
      "command": "python",
      "args": ["-m", "neemseo.mcp.server"],
      "env": {
        "NEEMSEO_DATABASE_URL": "sqlite:///./neemseo.db"
      }
    }
  }
}
```

### Available MCP Tools

- `audit_url(url: str, keyword: Optional[str])`: Complete on-page SEO health check.
- `list_available_rules()`: Detailed index of all SEO rules and weights.
- `start_site_crawl(seed_url: str, max_pages: int, max_depth: int)`: Background whole-site audit.
- `get_crawl_progress(crawl_id: str)`: Live crawl progress polling.
- `get_site_crawl_report(crawl_id: str)`: Full link graph, broken links, duplicate titles report.
- `compare_site_crawls(base_crawl_id: str, target_crawl_id: str)`: Crawl diff regression analysis.
- `research_keywords(seed_keyword: str, country: str, expand_alphabet: bool)`: Keyword expansion & intent clustering.
- `cluster_keywords(keywords: List[str])`: Group arbitrary keywords into topical themes.
- `add_rank_target(keyword: str, target_url: str, device: str)`: Register keyword/URL/device tracking.
- `check_serp_positions(confirm_cost: bool)`: SERP position check with pre-flight cost confirmation.
- `get_rank_trend(target_id: str)`: Historical rank movement and drop alerts.
- `fetch_backlinks(target_domain: str, confirm_cost: bool)`: Referring domains, anchor profiles, and new/lost links.
- `compare_competitors(target_domain: str, competitors: List[str])`: Keyword gap & backlink gap opportunities.
- `check_ai_visibility(domain: str, brand_name: str, queries: Optional[List[str]])`: Brand mentions, citations, and visibility inside AI Overviews and answer engines (ChatGPT, Claude, Perplexity, Gemini).
- `estimate_action_cost(action: str, count: int)`: Pre-flight cost check for budget safety.

---

## Agent Skills (`skills/`)

Reusable agent skills guide AI agents through complex SEO workflows using the `neemseo` MCP server:

| Skill | Description | Path |
|-------|-------------|------|
| `neemseo-site-audit` | Guided on-page audit, Core Web Vitals review, and ranked fix plan | [`skills/neemseo-site-audit/SKILL.md`](skills/neemseo-site-audit/SKILL.md) |
| `neemseo-site-crawl` | Whole-site crawling, broken link graphs, duplicate metadata, and crawl diffs | [`skills/neemseo-site-crawl/SKILL.md`](skills/neemseo-site-crawl/SKILL.md) |
| `neemseo-keyword-plan` | Autocomplete A-Z expansion, intent categorization, clustering, and priority roadmap | [`skills/neemseo-keyword-plan/SKILL.md`](skills/neemseo-keyword-plan/SKILL.md) |
| `neemseo-rank-tracker` | Rank setup, SERP checks, movement analysis, and drop alert triage | [`skills/neemseo-rank-tracker/SKILL.md`](skills/neemseo-rank-tracker/SKILL.md) |
| `neemseo-backlink-audit` | Referring domain profiles, dofollow ratios, lost link detection, and competitor gaps | [`skills/neemseo-backlink-audit/SKILL.md`](skills/neemseo-backlink-audit/SKILL.md) |
| `neemseo-ai-visibility` | Generative Engine Optimization (GEO), LLM brand citations, and AI Overviews | [`skills/neemseo-ai-visibility/SKILL.md`](skills/neemseo-ai-visibility/SKILL.md) |

---

## Documentation

- [Self-Hosting Guide](docs/SELF_HOSTING.md)
- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md)
- [Contributing & Rule Creation](docs/CONTRIBUTING.md)

---

## License

neemSEO is released under the [MIT License](LICENSE).

