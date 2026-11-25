# Self-Hosting on Cloudflare Workers

neemSEO runs natively on the Cloudflare edge using the **OpenNext Cloudflare adapter** (`@opennextjs/cloudflare`), **Cloudflare D1** (serverless SQLite), and **Cloudflare Access**.

## 1. Prerequisites

- A Cloudflare account
- Node.js 22 & pnpm installed locally
- Cloudflare Wrangler CLI authenticated:
  ```bash
  pnpm dlx wrangler login
  ```

## 2. Provision D1 Database

Create your production D1 database:

```bash
pnpm dlx wrangler d1 create neemseo-db
```

Copy the `database_id` output into your `wrangler.json`:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "neemseo-db",
    "database_id": "YOUR_DATABASE_ID_HERE"
  }
]
```

## 3. Apply Remote Migrations

Run Drizzle migrations against your remote D1 instance:

```bash
pnpm dlx wrangler d1 migrations apply DB --remote
```

## 4. Set Production Secrets

Set sensitive tokens as encrypted Cloudflare Worker secrets:

```bash
pnpm dlx wrangler secret put BETTER_AUTH_SECRET
pnpm dlx wrangler secret put DATAFORSEO_LOGIN
pnpm dlx wrangler secret put DATAFORSEO_PASSWORD
pnpm dlx wrangler secret put OPENROUTER_API_KEY
```

## 5. Cloudflare Access (Zero Trust)

To restrict access behind your organization's SSO without passwords:

1. In Cloudflare Zero Trust dashboard, create an Access Application for your domain (e.g. `seo.yourcompany.com`).
2. Add the environment variables:
   ```env
   AUTH_MODE=cloudflare_access
   CF_ACCESS_TEAM_DOMAIN=yourcompany.cloudflareaccess.com
   CF_ACCESS_POLICY_AUD=your_access_application_aud_tag
   ```
3. Incoming requests validate the `Cf-Access-Jwt-Assertion` cryptographic signature header.

## 6. Build and Deploy

```bash
# Build the OpenNext Cloudflare bundle
pnpm build:cf

# Deploy to Cloudflare Workers
pnpm dlx wrangler deploy
```

Your deployment is globally distributed across Cloudflare's 300+ data centers.
