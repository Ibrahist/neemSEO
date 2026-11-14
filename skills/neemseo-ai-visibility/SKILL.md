---
name: neemseo-ai-visibility
description: Guide an AI agent through tracking brand mentions, citations, and visibility inside AI Overviews and answer engines (ChatGPT, Claude, Perplexity, Gemini).
---

# neemSEO AI Visibility Engine (GEO) Agent Skill

This skill guides AI agents through evaluating Generative Engine Optimization (GEO), tracking how often a brand or domain appears in LLM responses and AI Overviews, and identifying actionable ways to increase AI citations using **neemSEO**.

## Overview
As search evolves toward generative answer engines (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews), traditional rank tracking alone is no longer sufficient. neemSEO's AI Visibility engine tests targeted user prompt queries across leading AI engines, measures citation rates and brand sentiment, and calculates an overall AI Visibility Score (0–100).

## Available MCP Tools
- `check_ai_visibility(domain: str, brand_name: str, queries: Optional[List[str]] = None)`:
  Runs an AI visibility evaluation across ChatGPT, Claude, Perplexity, Gemini, and Google AI Overview. Returns overall score, citation percentages, engine breakdowns, sample citations, and prioritized GEO optimization tips.
- `audit_url(url: str)`:
  Audits on-page structured data, Schema.org JSON-LD, headings, and semantic clarity needed for AI model grounding.

---

## 4-Step Generative Engine Optimization (GEO) Workflow

### Step 1: Baseline AI Visibility Audit
1. Call `check_ai_visibility(domain="example.com", brand_name="ExampleBrand")`.
2. Review the **AI Visibility Score** (0–100):
   - **80–100**: Strong authoritative presence; recognized as a market standard in AI responses.
   - **50–79**: Moderate visibility; present in some comparison queries but missing direct URL citations.
   - **0–49**: Low AI footprint; the brand is rarely synthesized or cited when users ask conversational questions.
3. Check the **Citation Rate**:
   - Measures what percentage of queries include a direct hyperlinked source or domain citation back to the site.

### Step 2: Engine-by-Engine Diagnosis
1. Inspect `engine_breakdown`:
   - **Perplexity & Google AI Overview**: Heavily rely on live search groundings, top-ranking organic URLs, and fresh reviews.
   - **ChatGPT & Claude**: Prioritize authoritative training corpora, Wikipedia/Wikidata entities, GitHub stars, and high-frequency brand mentions across technical forums (Reddit, Hacker News).
   - **Gemini**: Strongly correlates with Google Knowledge Graph entities and Google Search index structure.

### Step 3: Identify Citation Gaps & Competitors
1. Review `sample_query_results` to see which queries produced `sentiment == "absent"`.
2. Note competitor brands frequently co-cited in the same answers.
3. Formulate targeted comparison and alternative pages addressing those exact query intents.

### Step 4: Implement GEO Recommendations
1. **Schema.org Structured Data**:
   Ensure `Organization`, `Product`, or `SoftwareApplication` JSON-LD schemas are embedded with detailed properties (`name`, `description`, `sameAs`, `features`).
2. **Comparison & Alternative Tables**:
   Build high-density markdown/HTML comparison tables (`Brand vs Competitor`) highlighting specific architectural differences. AI search synthesizers prefer concise table data.
3. **Third-Party Review Profiles**:
   Verify presence on G2, Capterra, ProductHunt, and GitHub. These are crawled as high-confidence sources by Perplexity and Claude.
4. **FAQ and Conversational Headings**:
   Structure on-page content with explicit H2/H3 question headers that directly match user prompts.
