---
name: neemseo-site-audit
description: Guide an AI agent through auditing a web page with neemSEO, interpreting findings, and creating a prioritized technical fix plan.
---

# neemSEO Site Audit Agent Skill

When a user asks you to audit a page, fix on-page SEO issues, or improve page search rankings, follow this workflow using the `neemseo` MCP server.

## Step 1: Run the Audit
Call the `audit_url` tool:
- `url`: The target URL to audit (e.g. `https://example.com/pricing`).
- `keyword`: (Optional) The primary keyword the user wants to rank for.

## Step 2: Analyze Results
1. **Health Score & Grade**:
   - 90–100 (Grade A): Excellent optimization.
   - 70–89 (Grade B/C): Moderate issues present.
   - <70 (Grade D/F): Critical defects obstructing ranking.

2. **Categorize the Fixes**:
   - **Critical Fixes (FAIL, Impact >= 8)**:
     - Missing title or multiple/missing H1 tags.
     - Missing mobile viewport meta tag.
     - Accidental `noindex` blocking Googlebot.
     - Severely thin body content (<100 words).
   - **Important Warnings (WARN, Impact 5–7)**:
     - Sub-optimal title tag length (keep within 50–60 characters).
     - Missing or truncated meta description (target 120–160 characters).
     - Missing image `alt` attributes.
     - Missing canonical tag.
   - **Content & Keyword Signals (Impact 4–6)**:
     - Absence of target keyword in Title, primary H1, or introduction.
     - Generic anchor texts ("click here", "read more").
     - Missing Open Graph social media tags.
     - Missing Schema.org JSON-LD structured data.

## Step 3: Present the Plan
Format your output cleanly:
1. **Summary Card**: URL, Score, Grade, Word count.
2. **Prioritized Action Plan**: Table sorted by Impact (10 down to 1), with:
   - What is wrong.
   - Exact code snippet or copy to insert.
3. **Verification**: Offer to re-run the audit once the user implements the changes.

