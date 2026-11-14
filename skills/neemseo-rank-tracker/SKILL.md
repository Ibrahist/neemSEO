---
name: neemseo-rank-tracker
description: Guide an AI agent through tracking keyword rank positions, diagnosing ranking drops, running SERP checks, and monitoring competitor movements.
---

# neemSEO Rank Tracker & Competitor Intelligence Agent Skill

This skill guides AI agents (Claude Code, ChatGPT, Codex, Cursor) through SERP position tracking, ranking drop diagnostics, and competitor gap analysis using **neemSEO**.

## Overview
Rank tracking in neemSEO monitors exact `keyword + URL + location + device` tuples over time to account for Google's personalized, mobile-first, localized search indexes.

## Available MCP Tools
- `add_rank_target(keyword: str, target_url: str, location_name: str = "United States", location_code: int = 2840, device: str = "desktop")`:
  Registers a new keyword + page URL combination for continuous tracking.
- `list_rank_targets()`:
  Lists all active tracking targets with their location and device settings.
- `check_serp_positions(target_ids: Optional[List[str]] = None, confirm_cost: bool = False)`:
  Runs SERP position checks via DataForSEO (BYOK: ~$0.002/keyword) or simulated demo mode ($0.00). Requires `confirm_cost=True` for paid execution.
- `get_rank_trend(target_id: str, limit: int = 30)`:
  Retrieves historical position movement, current position, best/worst rank, and drop alerts.
- `compare_competitors(target_domain: str, competitors: List[str])`:
  Conducts keyword gap and backlink gap analysis between target domain and competitors.

---

## 4-Step Ranking Workflow

### Step 1: Target Registration
Ensure target keywords have defined URLs, locations, and device types:
```python
# Add target keyword for desktop search in US
add_rank_target(
    keyword="open source seo tool",
    target_url="https://neemseo.com/features",
    location_name="United States",
    device="desktop"
)
```

### Step 2: SERP Position Checking & Cost Confirmation
1. Call `check_serp_positions()` without confirmation to review estimated cost:
   `{"status": "confirmation_required", "estimated_cost_usd": 0.002, ...}`
2. Request user authorization if paid DataForSEO credentials are configured.
3. Execute with `check_serp_positions(confirm_cost=True)`.

### Step 3: Diagnosing Position Drops
When `get_rank_trend` flags `has_alert: true` (drop >= 5 spots):
1. **On-page regression**: Run `audit_url` on the target URL to verify:
   - Was a `noindex` or `nofollow` directive inadvertently published?
   - Did title or `<h1>` heading content change?
   - Did Core Web Vitals degrade (LCP > 2.5s, CLS > 0.1)?
2. **SERP feature displacement**: Check if AI Overviews, Featured Snippets, or Local Packs displaced organic results.
3. **Internal links**: Run `start_site_crawl` to ensure internal link equity wasn't disconnected.

### Step 4: Competitor Movement Analysis
Run `compare_competitors(target_domain="...", competitors=["..."])`:
- Identify keywords competitors recently gained ranking for.
- Uncover missing keyword clusters to develop targeted content.
