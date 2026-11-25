## Summary

<!-- Briefly describe the changes introduced by this pull request -->

## Workflows Affected

- [ ] Keyword research
- [ ] Rank tracking
- [ ] Competitor insights
- [ ] Backlinks
- [ ] Site audits
- [ ] AI visibility
- [ ] MCP Server / Agent plugins
- [ ] Architecture / Database / CI/CD

## Engineering Checklist

- [ ] **Dual-Dialect:** Any schema change is mirrored in both SQLite (`db/schema/sqlite/`) and Postgres (`db/schema/pg/`), and `pnpm db:generate` was executed.
- [ ] **Tenant Scoping:** All database queries are explicitly scoped by `organizationId` or `projectId`.
- [ ] **Security:** No secrets or raw API keys are exposed. Third-party tokens are encrypted at rest using AES-256-GCM.
- [ ] **MCP & Layering:** Features follow `Action / Route Handler -> Service -> Repository`.
- [ ] **Preflight Checks:** `pnpm ci:check` passed cleanly locally.
