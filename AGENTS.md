# AGENTS.md — neemSEO Engineering Guidelines for AI Agents

Welcome to **neemSEO**. When extending or refactoring this codebase, you MUST adhere to the following architectural and design rules:

## 1. Core Architecture Principles

- **Backend Layering:**
  `Server Action / Route Handler / MCP Tool` &rarr; `Service` &rarr; `Repository`.
  - Actions and route handlers ONLY parse inputs with Zod, check authentication via `requireAuth()`, and delegate to services.
  - Services contain business logic, DataForSEO client calls, caching lookups, and cost tracking.
  - Repositories are the **ONLY** modules that touch Drizzle ORM queries.
- **Server-Only Boundaries:**
  Always mark backend modules with `import "server-only";` so database credentials and business logic are never bundled into client components.
- **Dual-Dialect Compatibility:**
  Every database schema and repository MUST support both SQLite (default local file & Cloudflare D1) and PostgreSQL.
  - SQLite schema lives in `db/schema/sqlite/`.
  - Postgres schema lives in `db/schema/pg/`.
  - Never write raw dialect-specific SQL without abstracting or testing against both dialects.
- **Strict Tenant Scoping:**
  Every data mutation and query MUST be scoped to the authenticated `organizationId` or `projectId`. Never query without project or org boundaries.

## 2. Secrets & Security

- Never log, expose, or return raw API keys or tokens.
- Third-party OAuth tokens (e.g., Google Search Console) must be encrypted at rest using AES-256-GCM (`lib/crypto.ts`) with `BETTER_AUTH_SECRET`.
- SSRF Safe Crawling: The site audit crawler must strictly block private, loopback, and link-local IP addresses, re-validate after redirects, and cap response sizes and timeouts.

## 3. DataForSEO & Cost Transparency

- Users bring their own DataForSEO key (`login:password` base64).
- Always check the `api_cache` table before issuing expensive outbound requests.
- Always log API calls and credit costs into `api_usage_logs`.
- Display estimated query cost before expensive actions in the UI.

## 4. MCP Server & Plugins

- The MCP server at `/api/mcp` and in-app AI agents share the exact same service functions.
- Reusable agent skills live in `plugins/neemseo/skills/` as Markdown guides.
- Keep manifests (`claude.json`, `codex.json`, `cursor.json`) in sync using `pnpm sync-plugin-skills`.
