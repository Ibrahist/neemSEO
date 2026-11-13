---
name: neemseo-rank-tracker
description: Guide an AI agent through tracking keyword rank positions, diagnosing ranking drops, and monitoring competitors.
---

# neemSEO Rank Tracker Agent Skill

Use this workflow to inspect keyword ranking movements, track SERP volatility, and prevent ranking regressions.

## Step 1: SERP Position Checks
Always check rankings with explicit context:
- `keyword`: Exact query term.
- `url`: Target domain or page URL.
- `location`: Location code (e.g. US, UK, DE) because rankings vary by locale.
- `device`: Desktop vs Mobile (Google operates mobile-first index).

## Step 2: Diagnosing Ranking Drops
When a page drops in ranking:
1. Re-run `audit_url` to detect accidental regressions:
   - Was a `noindex` tag added?
   - Did the page title or H1 change?
   - Did Core Web Vitals degrade?
   - Are canonical tags still pointing correctly?
2. Check for competitor movement and SERP feature changes (e.g. AI Overview taking top screen real estate).
3. Provide a clear remediation checklist.
