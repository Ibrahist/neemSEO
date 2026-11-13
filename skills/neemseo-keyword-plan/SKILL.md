---
name: neemseo-keyword-plan
description: Guide an AI agent through researching keywords, clustering topical themes, and structuring optimized page content.
---

# neemSEO Keyword Planning Agent Skill

When a user asks to plan keywords for a new page or expand an existing topic, follow this structured process.

## Step 1: Pre-flight Cost Estimation
Before running any paid keyword lookup:
1. Call `estimate_action_cost(action="keywords_data", count=1)`.
2. Present the estimated cost to the user if paid sources are needed.
3. If confirmed, call `keyword_ideas(seed=keyword, confirm_cost=True)`.

## Step 2: Search Intent Classification
Classify all candidate keywords into one of the four search intent buckets:
- **Informational**: User wants an answer or guide (e.g., "how to fix broken links").
- **Commercial**: User is comparing solutions (e.g., "best semrush alternatives").
- **Transactional**: User is ready to buy or sign up (e.g., "ahrefs pricing discount").
- **Navigational**: User is seeking a specific brand or login page (e.g., "neemseo login").

## Step 3: Content Architecture
Using the chosen primary keyword and secondary semantic variations:
- Recommend an optimal `<title>` tag (50–60 characters).
- Recommend an optimal `<meta name="description">` (120–160 characters).
- Outline the `<h1>` and `<h2>` headings incorporating secondary intent clusters.
- Define internal linking targets.

