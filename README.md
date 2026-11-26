<div align="center">

# 🌿 neemSEO

**100% Free, Open-Source, and Self-Hostable SEO Platform.**

Professional SEO intelligence designed for modern engineering teams, founders, and autonomous AI agents.  
No subscriptions. No credit card required. No login barriers.

[![CI Pipeline](https://github.com/Ibrahist/neemSEO/actions/workflows/ci.yml/badge.svg)](https://github.com/Ibrahist/neemSEO/actions/workflows/ci.yml)
[![Security Scan](https://github.com/Ibrahist/neemSEO/actions/workflows/security.yml/badge.svg)](https://github.com/Ibrahist/neemSEO/actions/workflows/security.yml)
[![Branch Protection](https://img.shields.io/badge/branch%20protection-active-success.svg)](https://github.com/Ibrahist/neemSEO)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

[Features](#-key-features--core-workflows) • [Quick Start](#-quick-start) • [Connect AI Agents via MCP](#-connect-ai-agents-via-mcp) • [Architecture](#-architecture--security) • [Documentation](#-documentation)

</div>

---

## 🚀 Key Features & Core Workflows

neemSEO provides a focused, high-performance SEO platform that gives you total ownership of your data and infrastructure:

1. **Keyword Research**: Seed keyword exploration, live search volume, keyword difficulty (KD), CPC, competition index, search intent classification (`informational`, `navigational`, `commercial`, `transactional`), and instant CSV exports.
2. **Rank Tracking**: Track keyword positions over time per project and target domain, store historical SERP snapshots, and visualize position movement trends.
3. **Competitor Insights**: Domain overview, organic keywords, estimated traffic, and high-opportunity keyword gap analysis.
4. **Backlinks Intelligence**: Backlink profiles, total links, referring domains, domain authority rank, and new/lost link trends.
5. **Technical Site Audits**: Built-in full-site crawler with strict SSRF protection, robots.txt compliance, latency monitoring, and severity-ranked issue categorization (critical, warning, info) with 0–100 site health scoring.
6. **AI Visibility**: Track brand mentions and citations across modern AI answer engines (ChatGPT, Claude, Perplexity, Google Gemini) for target industry queries.

---

## 🛠️ Cross-Cutting Capabilities

- **100% Free Forever**: No recurring subscription fees or paywalls. Run locally or deploy to your own Cloudflare/Docker infrastructure.
- **Dynamic Site-Specific Dashboards**: Every project dashboard reflects genuine real-time metrics, crawl status, and authority baselines tailored to its domain.
- **Streamlined Light Theme UI**: Distraction-free, clean light interface with dedicated project switcher and rapid workflow navigation.
- **Model Context Protocol (MCP)**: Full JSON-RPC 2.0 MCP server served at `/api/mcp` with OAuth 2.0 support for AI agents (Claude Desktop, Cursor, Codex, ChatGPT).
- **In-App AI SEO Agent**: Interactive chat assistant at `/projects/[projectId]/agent` powered by OpenRouter and Vercel AI SDK, executing internal tool capabilities.
- **Dual-Dialect Architecture**: Every schema, migration, and repository natively supports both **SQLite** (Cloudflare D1 & local file) and **PostgreSQL**.
- **Google Search Console**: Connect Search Console properties and import organic impressions and clicks. Third-party OAuth tokens are encrypted at rest with AES-256-GCM.
- **Cost Transparency & 7-Day Caching**: Users bring their own DataForSEO key with zero markup, accompanied by automatic SHA-256 request caching (`api_cache`) to avoid re-querying identical data.

---

## ⚡ Quick Start

### 1. Run with Docker Compose (1-Click)

```bash
git clone https://github.com/Ibrahist/neemSEO.git
cd neemSEO

# Start with local SQLite storage
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000).

---

### 2. Local Development

```bash
# Clone and install dependencies
git clone https://github.com/Ibrahist/neemSEO.git
cd neemSEO
pnpm install

# Run local migrations and start development server
pnpm db:migrate:local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

See [Local Development Guide](docs/LOCAL_DEVELOPMENT.md).

---

### 3. Run on Cloudflare Workers (Serverless Edge)

neemSEO compiles natively to Cloudflare Workers with D1 using OpenNext:

```bash
pnpm install
pnpm dlx wrangler d1 create neemseo-db
pnpm dlx wrangler d1 migrations apply DB --remote
pnpm build:cf
pnpm dlx wrangler deploy
```

See [Cloudflare Deployment Guide](docs/SELF_HOSTING_CLOUDFLARE.md).

---

## 🤖 Connect AI Agents via MCP

neemSEO exposes all 6 workflows as typed MCP tools at `/api/mcp`.

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "neemseo": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch", "http://localhost:3000/api/mcp"]
    }
  }
}
```

### Cursor Configuration

In Cursor Settings &rarr; Features &rarr; MCP:

- **Type**: `command` (or `sse`/`http`)
- **URL**: `http://localhost:3000/api/mcp`

### Available MCP Tools

| MCP Tool                            | Description                                    |
| :---------------------------------- | :--------------------------------------------- |
| `neemseo_list_projects`             | List all monitored projects and active domains |
| `neemseo_get_project`               | Get project metadata and configuration         |
| `neemseo_search_keywords`           | Search volumes, difficulty, intent, and CPC    |
| `neemseo_track_keyword`             | Add keyword to daily position monitoring       |
| `neemseo_get_rank_history`          | Retrieve historical SERP ranking positions     |
| `neemseo_add_competitor`            | Add competitor domain for organic overlap      |
| `neemseo_get_keyword_gap`           | Identify keyword gaps and opportunities        |
| `neemseo_get_backlinks_summary`     | Total backlinks, referring domains, and rank   |
| `neemseo_run_site_audit`            | Launch SSRF-safe technical crawler             |
| `neemseo_get_audit_issues`          | Severity-ranked site issues and fixes          |
| `neemseo_check_ai_visibility`       | Test brand citation across 4 AI engines        |
| `neemseo_get_ai_visibility_summary` | Summary of brand mention rates                 |
| `neemseo_get_gsc_performance`       | Organic impressions, clicks, and CTR           |

---

## 🛡️ Architecture & Security

- **Strict Tenant Boundaries**: Every database query is strictly filtered by `organizationId` or `projectId`.
- **SSRF Safe Crawling**: Site audit crawler enforces private, loopback, and link-local IP blocking with redirect re-validation.
- **Branch Protection Rules**: The `main` branch is protected on GitHub requiring passing CI checks (Lint, Typecheck, Unit Tests, and Build verification), code review approval, conversation resolution, and blocks force pushes and branch deletions.
- **Credential Encryption**: OAuth access and refresh tokens are encrypted using AES-256-GCM (`lib/crypto.ts`).

---

## 📚 Documentation

- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md)
- [Docker Self-Hosting Guide](docs/SELF_HOSTING_DOCKER.md)
- [Cloudflare Workers Self-Hosting Guide](docs/SELF_HOSTING_CLOUDFLARE.md)
- [DataForSEO API Key Setup](docs/DATAFORSEO_API_KEY.md)
- [CI/CD & Security Architecture](docs/CI_CD.md)
- [Engineering Guidelines & Rules](AGENTS.md)

---

## 📜 License

MIT License. Built with ❤️ by [Ibrahist](https://github.com/Ibrahist/neemSEO) for developers, founders, and autonomous AI agents.
