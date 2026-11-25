# Keyword Gap Analysis Skill

## Goal

Identify organic keyword opportunities where competitors rank in top 10 positions but the target project domain either does not rank or ranks outside the top 20.

## Workflow

1. Call `neemseo_get_project` to retrieve the project's primary domain and configured competitors.
2. Call `neemseo_get_competitor_keywords` for the target domain and up to 3 competitors.
3. Compare the keyword lists to identify high-volume, low-to-medium difficulty keywords where the competitor ranks ≤ 10 and target domain ranks > 20 or is unranked.
4. Output a prioritized markdown table with Keyword, Search Volume, Keyword Difficulty (KD), Competitor Position, Target Position, and Recommended Content Action.
