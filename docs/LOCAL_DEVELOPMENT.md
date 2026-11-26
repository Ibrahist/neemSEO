# Local Development Guide

Welcome to the **neemSEO** local development environment.

## 1. Prerequisites

- **Node.js**: v22+ (or v20 LTS)
- **pnpm**: v12.15.0 via Corepack (`corepack enable && corepack prepare pnpm@12.15.0 --activate`)
- **Git**

## 2. Quick Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/Ibrahist/neemSEO.git
cd neemseo
pnpm install
```

## 3. Environment Configuration

Copy `.env.example` (or create `.env`):

```env
# Runtime & Auth
NODE_ENV=development
AUTH_MODE=local_noauth      # Options: local_noauth | hosted | cloudflare_access
BETTER_AUTH_SECRET=neemseo_dev_super_secret_32_bytes_len!
BETTER_AUTH_URL=http://localhost:3000

# Database (SQLite by default, or PostgreSQL)
DATABASE_URL=file:data/neemseo.sqlite

# External APIs (Optional for local development)
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
```

## 4. Database Setup & Migrations

neemSEO uses Drizzle ORM with full dual-dialect support (SQLite & PostgreSQL):

### SQLite (Default Local Dev)

```bash
# Apply local SQLite migrations
pnpm db:migrate:local
```

### PostgreSQL (Optional)

```bash
# Start a local Postgres container
docker compose --profile postgres up -d

# Apply Postgres migrations
DATABASE_URL=postgresql://neemseo:neemseo_secure_password@localhost:5432/neemseo pnpm db:migrate:pg
```

### Generating Schema Migrations

If you modify schema in `db/schema/sqlite/` or `db/schema/pg/`:

```bash
pnpm db:generate
```

## 5. Running the Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
In `local_noauth` mode, you are automatically logged in as `admin@localhost` with pre-seeded demo projects.

## 6. Testing & Quality Assurance

Run the local CI suite before submitting PRs:

```bash
# Full local CI check (Prettier, TypeScript, Next Lint, Vitest, Skills Sync)
pnpm ci:check

# Run unit tests only
pnpm test

# Format code
pnpm format
```
