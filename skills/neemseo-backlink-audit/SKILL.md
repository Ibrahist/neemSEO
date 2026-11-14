---
name: neemseo-backlink-audit
description: Guide an AI agent through auditing a website's backlink profile, analyzing referring domains and anchor texts, and finding competitor link gaps.
---

# neemSEO Backlink Profile & Link Gap Audit Agent Skill

This skill guides AI agents through evaluating referring domain quality, dofollow/nofollow distributions, toxic/generic anchor texts, and competitor link building opportunities using **neemSEO**.

## Overview
Rather than attempting to build a web-wide crawler index, neemSEO uses provider adapters (DataForSEO, Ahrefs, Moz) with BYOK pay-as-you-go pricing, snapshots historical profiles to track new and lost links, and computes competitor link gaps.

## Available MCP Tools
- `fetch_backlinks(target_domain: str, max_backlinks: int = 100, confirm_cost: bool = False)`:
  Fetches a backlink profile snapshot with referring domains, DR metrics, and top anchor texts. Cost: ~$0.02 via DataForSEO or $0.00 in free demo mode.
- `compare_competitors(target_domain: str, competitors: List[str])`:
  Identifies referring domains that link to competitors but not yet to the target domain (`backlink_gaps`).

---

## 3-Step Backlink Audit Workflow

### Step 1: Profile Health & Anchor Distribution
1. Run `fetch_backlinks(target_domain="example.com", confirm_cost=True)`.
2. Inspect **Dofollow vs Nofollow** ratio:
   - Natural profiles typically range between 60%–85% dofollow links.
3. Review **Anchor Text Diversity**:
   - Brand anchors (brand name, URL) should represent the majority (50%+).
   - Exact-match commercial anchors over 20% can indicate over-optimization or link spam risk.

### Step 2: New vs. Lost Link Monitoring
1. Check `new_links_since_last` and `lost_links_since_last`.
2. For high-DR lost links (DR >= 60):
   - Check if the referring page was deleted (404) or link was removed.
   - Set up an outreach task or reclaim opportunity.

### Step 3: Competitor Backlink Gap Outreach
1. Run `compare_competitors(target_domain="...", competitors=["competitor1.com", "competitor2.com"])`.
2. Filter `top_backlink_gaps` by `outreach_value == "high"` (DR >= 75).
3. These domains already link to competitor solutions in the same space, making them high-converting link building prospects for guest posts, product mentions, or directory listings.
