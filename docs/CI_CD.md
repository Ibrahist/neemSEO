# GitHub Actions CI/CD Pipeline Documentation

neemSEO includes a complete production CI/CD suite built on GitHub Actions with strict least-privilege permissions, concurrency controls, and automated rollback capabilities.

## Workflows Overview

| Workflow File                    | Trigger                          | Purpose                                                                                                                   |
| -------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`       | PRs & push to `main`             | Linting, TypeScript, Unit tests, Migrations check, Next.js build, OpenNext build, Playwright E2E, Skills sync check       |
| `.github/workflows/security.yml` | PRs & weekly schedule            | `pnpm audit` (high severity check), CodeQL JavaScript/TypeScript analysis, Gitleaks secret scanning                       |
| `.github/workflows/preview.yml`  | PRs (`opened`, `sync`, `closed`) | Deploys ephemeral preview Worker + D1 per PR; posts comment; destroys resources on close                                  |
| `.github/workflows/deploy.yml`   | Push to `main`                   | Deploys to Staging, runs `/healthz` smoke test; deploys to Production with required reviewer approval; automatic rollback |
| `.github/workflows/docker.yml`   | Git tags (`v*.*.*`)              | Multi-arch (`linux/amd64`, `linux/arm64`) Docker build via Buildx, Trivy vulnerability scan, push to GHCR                 |
| `.github/workflows/release.yml`  | Git tags (`v*.*.*`)              | Automated release notes generation from merged PRs and GitHub Release creation                                            |
| `.github/dependabot.yml`         | Weekly schedule                  | Automated security dependency updates for npm and GitHub Actions                                                          |

---

## Required Secrets & Configuration

Configure these in **GitHub Repository Settings &rarr; Secrets and variables &rarr; Actions**:

| Secret Name             | Required By                 | Description                                                                           |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | `preview.yml`, `deploy.yml` | Cloudflare API token with Workers and D1 edit permissions                             |
| `CLOUDFLARE_ACCOUNT_ID` | `preview.yml`, `deploy.yml` | Cloudflare Account ID                                                                 |
| `BETTER_AUTH_SECRET`    | Production environment      | 32+ character random secret used for session hashing and AES-256 GCM token encryption |
| `DATAFORSEO_LOGIN`      | Production environment      | DataForSEO username                                                                   |
| `DATAFORSEO_PASSWORD`   | Production environment      | DataForSEO password                                                                   |

---

## Rollback Strategy

In `.github/workflows/deploy.yml`:

1. Production deployment applies migrations and deploys the newly compiled bundle.
2. An immediate HTTP smoke test queries `/api/healthz`.
3. If `/api/healthz` returns non-200 or times out, the `wrangler rollback` step executes automatically, restoring the previous stable production deployment immediately.
