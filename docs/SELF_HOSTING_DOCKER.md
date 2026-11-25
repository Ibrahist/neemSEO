# Self-Hosting with Docker

neemSEO provides a production-optimized Docker image built on Next.js standalone output.

## Option A: 1-Click with Docker Compose (SQLite - Recommended)

The simplest way to self-host neemSEO is using Docker Compose with local SQLite storage:

```bash
# Clone the repository
git clone https://github.com/neemseo/neemseo.git
cd neemseo

# Set your secrets in a .env file
echo "BETTER_AUTH_SECRET=$(openssl rand -hex 32)" > .env
echo "AUTH_MODE=hosted" >> .env
echo "BETTER_AUTH_URL=https://your-domain.com" >> .env
echo "DATAFORSEO_LOGIN=your_login" >> .env
echo "DATAFORSEO_PASSWORD=your_password" >> .env

# Start the container
docker compose up -d
```

The app will be available on `http://localhost:3000`. In `hosted` mode, the first visitor to register becomes the initial administrator.

---

## Option B: Docker Compose with PostgreSQL

For multi-node or high-concurrency deployments, run with the `postgres` profile:

```bash
docker compose --profile postgres up -d
```

Compose automatically starts:

- A PostgreSQL 16 container with persistent volumes
- The neemSEO application container connected via `DATABASE_URL=postgresql://...`

---

## Environment Variables Reference

| Variable              | Description                                                         | Default                         |
| --------------------- | ------------------------------------------------------------------- | ------------------------------- |
| `AUTH_MODE`           | Authentication mode (`local_noauth`, `hosted`, `cloudflare_access`) | `local_noauth`                  |
| `BETTER_AUTH_SECRET`  | 32+ character key for sessions and AES-256 token encryption         | Required                        |
| `BETTER_AUTH_URL`     | Public canonical base URL (e.g. `https://seo.company.com`)          | `http://localhost:3000`         |
| `DATABASE_URL`        | Database connection string (`file:...` or `postgresql://...`)       | `file:/app/data/neemseo.sqlite` |
| `DATAFORSEO_LOGIN`    | DataForSEO API username                                             | Optional                        |
| `DATAFORSEO_PASSWORD` | DataForSEO API password                                             | Optional                        |
| `OPENROUTER_API_KEY`  | OpenRouter key for in-app AI Agent                                  | Optional                        |

---

## Data Backup & Restores

### SQLite Backup

Copy the `/app/data/neemseo.sqlite` volume:

```bash
docker compose cp app:/app/data/neemseo.sqlite ./backup_$(date +%F).sqlite
```

### PostgreSQL Backup

```bash
docker compose exec postgres pg_dump -U neemseo neemseo > ./backup_$(date +%F).sql
```
