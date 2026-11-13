# Self-Hosting neemSEO

neemSEO is built from the ground up for easy self-hosting. There are no subscriptions, and all data belongs to you.

## Quickstart with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/neemseo.git
   cd neemseo
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Update the required variables in `.env`:
   - `NEEMSEO_SECRET_KEY`: Set a secure random 32-character key.
   - `NEEMSEO_BASE_URL`: Your public domain (e.g., `https://seo.yourdomain.com`).
   - `NEEMSEO_DATAFORSEO_LOGIN` & `NEEMSEO_DATAFORSEO_PASSWORD`: (Optional) If you want paid SERP/Keyword lookups.

4. Start the services:
   ```bash
   docker compose up -d
   ```

5. Access the web dashboard at `http://localhost:8000`.

## Docker Compose Configuration

The default `docker-compose.yml` provides:
- **api**: FastAPI backend serving web endpoints, CLI, and audit workers.
- **db**: PostgreSQL 16 database for audit history, crawls, and keyword tracking.
- **redis**: Redis 7 for caching and job queueing.

## Platforms Supported

- **VPS**: Hetzner, DigitalOcean, Linode, OVH
- **Self-hosted PaaS**: Coolify, Portainer, Dokploy
- **Managed PaaS**: Railway, Render
