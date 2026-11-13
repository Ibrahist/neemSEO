---
name: neemseo-keyword-plan
description: Guide an AI agent through researching keywords, clustering topical themes, scoring opportunity priority, and structuring content strategy.
---

# neemSEO Keyword Research & Content Planning Agent Skill

This skill guides AI agents (Claude Code, ChatGPT, Codex, Cursor) through end-to-end keyword intelligence using **neemSEO**.

## Overview
Keyword research in neemSEO combines free high-volume suggestion sources (Google Autocomplete, question modifiers, A-Z letter expansion) with BYOK paid data providers (DataForSEO) when search volume and SERP difficulty metrics are required.

## Available MCP Tools
- `research_keywords(seed_keyword: str, country: str = "US", expand_alphabet: bool = True, expand_questions: bool = True, use_paid_api: bool = False, max_results: int = 100)`:
  Conducts automated suggestion expansion, intent labeling, clustering, and priority scoring.
- `cluster_keywords(keywords: List[str])`:
  Groups any list of keywords into semantic topic clusters and dominant search intents.
- `estimate_action_cost(action: str, count: int = 1)`:
  Calculates pre-flight estimated cost in USD for paid DataForSEO API queries.

---

## 4-Step Keyword Workflow

### Step 1: Pre-Flight Cost Transparency
Always start by determining whether the user requires free autocomplete expansion ($0.00) or paid SERP/volume data from DataForSEO:
1. Free Autocomplete: Always $0.00. No key required.
2. Paid Data: Call `estimate_action_cost(action="keywords_data", count=50)`.
3. If using paid data, confirm estimated cost with user before execution.

### Step 2: Seed Keyword Expansion
Run `research_keywords(seed_keyword="<seed>")`:
- **Direct Queries**: Captures primary query suggestions.
- **A-Z Expansion**: Appends letters a–z to discover niche long-tail queries.
- **Question Modifiers**: Prepends `how to`, `what is`, `best`, `vs`, `alternatives to`.

### Step 3: Intent Classification & Priority Scoring
Every discovered query is categorized into:
- **Transactional** (Green): High conversion readiness (`buy`, `pricing`, `cheap`, `order`, `hire`).
- **Commercial** (Cyan): Product evaluation and comparison (`best`, `reviews`, `top`, `vs`, `alternatives`).
- **Informational** (Blue): Research and educational intent (`how`, `guide`, `tips`, `tutorial`, `what is`).
- **Navigational** (Magenta): Brand or portal direct navigation (`login`, `support`, `website`).

The **Priority Score (0-100)** balances:
$$\text{Priority} = f(\text{Volume}_{\text{log}}, 100 - \text{KD}, \text{Intent Multiplier})$$
High volume + Low difficulty (KD) + Commercial/Transactional intent receives the top priority score (80–100).

### Step 4: Topic Clustering & Content Architecture
Group related keywords into semantic pillar pages and subtopics:
- Identify the parent cluster theme (e.g., `SEO Audit Tools`).
- Pick 1 primary target keyword with highest priority score.
- Select 4–8 secondary long-tail keywords for subheadings (`<h2>`, `<h3>`).
- Formulate an optimized `<title>` tag (50–60 chars) and meta description (120–160 chars).

---

## CLI Alternatives
Agents or developers working in the terminal can run:
```bash
# Research and display top opportunities in terminal table
neemseo keywords "seo tools" --country US --expand-az

# Export full research to CSV
neemseo keywords "project management software" --csv pm_keywords.csv --limit 100

# View historical runs
neemseo keyword-lists
```
