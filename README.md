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

## The Four Core Tools + AI Agent Interface

1. **On-Page SEO Auditor** (Week 1): Fast, granular inspection of page titles, meta descriptions, single H1 & logical heading hierarchy, image alt attributes, canonical tags, indexability directives, link profiles, and body content depth. Integrates Google Core Web Vitals (LCP, INP, CLS).
2. **Site Crawler** (Week 2): Whole-site auditing from root URL or sitemap, orphan page detection, broken link graphs, duplicate content flags, and crawl difference comparisons.
3. **Keyword Research Tool** (Week 3): Google Autocomplete expansion, search volume metrics, topical clustering, and search intent classification.
4. **Rank Tracker & Backlink Tracker** (Week 4): Scheduled position tracking by location and device, rank drop alerts, and backlink snapshots.
5. **MCP Server (`neemseo`) & Skills**: Enables AI agents to audit URLs, list fixes, and optimize content directly from agent coding sessions.

---

## Quickstart

### 1. Terminal CLI

```bash
# Clone the repository
git clone https://github.com/your-org/neemseo.git
cd neemseo

# Install dependencies
pip install -e .

# Run an instant on-page audit
neemseo audit https://example.com --keyword "example"

# Run with Core Web Vitals and export to CSV
neemseo audit https://example.com --pagespeed --csv report.csv

# View audit history
neemseo history

# Inspect available SEO checking rules
neemseo rules
```

### 2. Web Dashboard

```bash
python backend/main.py
```
Open **http://localhost:8000** to access the interactive web interface.

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
- `list_available_rules()`: Detailed index of all SEO rules.
- `estimate_action_cost(action: str, count: int)`: Pre-flight cost check for budget safety.
- `keyword_ideas(seed: str, confirm_cost: bool)`: Keyword metrics (requires user confirmation).

---

## Documentation

- [Self-Hosting Guide](docs/SELF_HOSTING.md)
- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md)
- [Contributing & Rule Creation](docs/CONTRIBUTING.md)

---

## License

neemSEO is released under the [MIT License](LICENSE).
