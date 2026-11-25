# DataForSEO API & Cost Transparency Guide

neemSEO adopts a **Bring Your Own Key (BYOK)** model. You pay DataForSEO directly at wholesale vendor cost, with zero markup or expensive recurring subscription tiers.

## 1. Getting Your API Key

1. Sign up for an account at [dataforseo.com](https://dataforseo.com/).
2. Deposit any balance (e.g. $20 to $50). DataForSEO credits do not expire.
3. In your DataForSEO dashboard, obtain your **Login** and **Password** (or API Key).
4. Configure in your environment:
   ```env
   DATAFORSEO_LOGIN="your_login_here"
   DATAFORSEO_PASSWORD="your_password_here"
   ```

---

## 2. Endpoint Costs Reference

| SEO Operation               | DataForSEO Endpoint                                    | Estimated Wholesale Cost |
| --------------------------- | ------------------------------------------------------ | ------------------------ |
| Keyword Volume & CPC        | `/v3/dataforseo_labs/google/keyword_ideas/live`        | **$0.010**               |
| SERP Rank Check             | `/v3/serp/google/organic/live/regular`                 | **$0.002**               |
| Competitor Organic Keywords | `/v3/dataforseo_labs/google/ranked_keywords/live`      | **$0.010**               |
| Competitor Domain Metrics   | `/v3/dataforseo_labs/google/domain_rank_overview/live` | **$0.010**               |
| Backlinks Overview          | `/v3/backlinks/summary/live`                           | **$0.020**               |
| Referring Domains           | `/v3/backlinks/referring_domains/live`                 | **$0.020**               |
| Technical Site Crawler      | Local crawler (built-in)                               | **$0.000 (Free)**        |
| AI Engine Visibility        | OpenRouter (e.g. Claude 3.5 Haiku)                     | **~$0.001 per query**    |

---

## 3. Caching & Cost Protection

To protect you from paying multiple times for identical requests:

- **7-Day Automatic Caching (`api_cache`)**: Every outbound DataForSEO request is hashed with SHA-256. If an identical query was made within the last 7 days, the cached response is returned with **$0.00** cost.
- **Pre-Execution Cost Estimates**: The UI and Server Actions display estimated costs before making expensive API calls.
- **Audit Logs (`api_usage_logs`)**: Every outbound request logs the endpoint, duration, HTTP status, and credit cost scoped to the active project.
