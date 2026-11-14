# Setting Up Your DataForSEO API Key (BYOK)

**neemSEO** uses a **Bring-Your-Own-Key (BYOK)** model. Instead of paying monthly subscriptions ($120–$500/mo) for SEO software suites, you pay the data provider directly for the exact data points you consume.

---

## 1. Why DataForSEO?
DataForSEO provides live search engine results (SERP), keyword search volumes, and backlink graphs at raw wholesale prices:
- Keyword search volume check: **~$0.0005** per keyword.
- Live SERP rank check: **~$0.002** per query.
- Full backlink profile snapshot: **~$0.02** per domain.

Most individual users and small teams spend less than **$1.00 to $5.00 per month** in data costs.

---

## 2. Creating an Account
1. Visit [DataForSEO](https://dataforseo.com) and register for an account.
2. Navigate to your **Dashboard** -> **API Access**.
3. Copy your **API Login** (typically your account email) and your **API Password / Secret**.

---

## 3. Configuring neemSEO
Add your credentials to your `.env` file:

```env
NEEMSEO_DATAFORSEO_LOGIN="your-dataforseo-login"
NEEMSEO_DATAFORSEO_PASSWORD="your-dataforseo-password"
```

Or pass them as environment variables in Docker Compose:

```yaml
services:
  api:
    environment:
      - NEEMSEO_DATAFORSEO_LOGIN=your-login
      - NEEMSEO_DATAFORSEO_PASSWORD=your-password
```

---

## 4. Safety & Cost Protection
neemSEO is built with strict budget guardrails:
1. **Upfront Cost Estimates**: All paid actions require confirmation before execution or display the calculated cost in USD.
2. **Unified Redis / Memory Caching**: Identical queries are automatically cached for 24 hours to prevent duplicate billings.
3. **Demo / Free Simulation Mode**: If no DataForSEO credentials are configured, neemSEO runs entirely free of charge with simulated realistic metrics and free Google Autocomplete expansion.
