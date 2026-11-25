<div align="center">

# 🌿 neemSEO

**Open-source, self-hostable, pay-as-you-go alternative to Semrush & Ahrefs.**

Usable by humans through a modern web UI, and usable by autonomous AI agents through an MCP server.
Users bring their own DataForSEO API key and pay only for wholesale data they consume.

[![CI Pipeline](https://github.com/neemseo/neemseo/actions/workflows/ci.yml/badge.svg)](https://github.com/neemseo/neemseo/actions/workflows/ci.yml)
[![Security Scan](https://github.com/neemseo/neemseo/actions/workflows/security.yml/badge.svg)](https://github.com/neemseo/neemseo/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

</div>

---

## 🚀 Key Features & Core Workflows

neemSEO replaces bloated, expensive recurring SEO subscriptions ($130–$400/mo) with a simple, focused, self-hostable platform.

1. **Keyword Research**: Seed keyword expansion, search volume, keyword difficulty (KD), CPC, competition index, search intent classification (`informational`, `navigational`, `commercial`, `transactional`), and CSV export.
2. **Rank Tracking**: Track keyword positions over time per project and target domain, store historical SERP snapshots, and visualize position movement charts with Recharts.
3. **Competitor Insights**: Domain overview, organic keywords, estimated traffic, and high-opportunity keyword gap analysis.
4. **Backlinks Intelligence**: Backlink profiles, total backlinks, referring domains, domain rank, and new/lost link metrics.
5. **Technical Site Audits**: Built-in full-site crawler with strict SSRF protection, robots.txt compliance, latency monitoring, and severity-ranked issue categorization (critical, warning, info) with 0-100 site health scoring.
6. **AI Visibility**: Track whether your brand or domain is mentioned or cited by AI answer engines (ChatGPT, Claude, Perplexity, Google Gemini) for key search queries.

---

## 🛠️ Cross-Cutting Capabilities

- **Strict Tenant Scoping**: Every query and mutation is strictly scoped to the authenticated `organizationId` or `projectId`.
- **Dual-Dialect Architecture**: Every schema, migration, and repository natively supports both **SQLite** (Cloudflare D1 & local file) and **PostgreSQL**.
- **Model Context Protocol (MCP)**: Full JSON-RPC 2.0 MCP server served at `/api/mcp` with OAuth 2.0 support for AI agents (Claude Desktop, Cursor, Codex, ChatGPT).
- **In-App AI SEO Agent**: Interactive chat assistant at `/projects/[projectId]/agent` powered by OpenRouter and Vercel AI SDK, executing the exact same internal tools as the MCP server.
- **Google Search Console**: Connect Search Console properties and import organic impressions/clicks. Third-party OAuth tokens are encrypted at rest with AES-256-GCM.
- **Cost Transparency & 7-Day Caching**: Real-time pre-execution cost estimation, wholesale vendor pricing schedules, and automatic SHA-256 request caching (`api_cache`) to avoid paying twice for identical data.

---

## ⚡ Quick Start

### 1. Run with Docker Compose (1-Click)

```bash
git clone https://github.com/neemseo/neemseo.git
cd neemseo

# Start with local SQLite storage
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000).

---

### 2. Run on Cloudflare Workers (Serverless Edge)

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

### 3. Local Development

```bash
pnpm install
pnpm db:migrate:local
pnpm dev
```

See [Local Development Guide](docs/LOCAL_DEVELOPMENT.md).

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
      "args": ["-y", "@modelcontextprotocol/server-fetch", "http://localhost:3000/api/mcp"],
      "env": {
        "NEEMSEO_API_KEY": "your_api_key_or_token"
      }
    }
  }
}
```

### Cursor Configuration

In Cursor Settings &rarr; Features &rarr; MCP:

- **Type**: `command` (or `sse`/`http`)
- **URL**: `http://localhost:3000/api/mcp`

### Available MCP Tools

- `neemseo_list_projects`
- `neemseo_get_project`
- `neemseo_search_keywords`
- `neemseo_track_keyword`
- `neemseo_get_rank_history`
- `neemseo_add_competitor`
- `neemseo_get_keyword_gap`
- `neemseo_get_backlinks_summary`
- `neemseo_run_site_audit`
- `neemseo_get_audit_issues`
- `neemseo_check_ai_visibility`
- `neemseo_get_ai_visibility_summary`
- `neemseo_get_gsc_performance`

---

## 📚 Documentation

- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md)
- [Docker Self-Hosting Guide](docs/SELF_HOSTING_DOCKER.md)
- [Cloudflare Workers Self-Hosting Guide](docs/SELF_HOSTING_CLOUDFLARE.md)
- [DataForSEO Pricing & API Key Setup](docs/DATAFORSEO_API_KEY.md)
- [CI/CD & Security Architecture](docs/CI_CD.md)
- [Engineering Guidelines & Rules](AGENTS.md)

---

## 📜 License

MIT License. Created with ❤️ for developers, modern agencies, and autonomous AI agents.
