# Keyword Research & Intent Strategy Skill

Use this workflow to find high-value keyword opportunities, evaluate competition, estimate CPC, and prioritize targets by user intent.

## Available MCP Tools

- `neemseo_search_keywords`: Seed keyword exploration with volume, KD, CPC, and intent.
- `neemseo_track_keyword`: Save discovered keywords directly into project rank tracking.

## Autonomous Workflow Steps

1. **Identify Seed Term**: Ask user or inspect target website to choose high-intent seed terms.
2. **Execute Research Query**:
   ```json
   {
     "projectId": "<projectId>",
     "seedKeyword": "seo reporting software",
     "locationCode": 2840
   }
   ```
3. **Analyze Keyword Intent**:
   - Prioritize `commercial` and `transactional` keywords for immediate conversion.
   - Group `informational` keywords for top-of-funnel content marketing.
4. **Filter by Keyword Difficulty (KD)**:
   - Identify low-hanging fruit: KD < 40 and Search Volume > 500.
5. **Track High Priority Terms**:
   - Immediately call `neemseo_track_keyword` for keywords the user wants to monitor.
