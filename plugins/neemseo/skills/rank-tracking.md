# Rank Tracking & SERP Movement Skill

Use this workflow to monitor daily/weekly search position movements for a project domain.

## Available MCP Tools

- `neemseo_track_keyword`: Add a keyword to rank tracking.
- `neemseo_get_rank_history`: Retrieve historical position charts and movement metrics.

## Autonomous Workflow Steps

1. **Retrieve Current Rankings**:
   - Query `neemseo_get_rank_history` for monitored terms.
2. **Evaluate Rank Volatility**:
   - Highlight keywords that moved into the Top 3 or Top 10.
   - Detect significant drops (> 5 positions) requiring content or backlink remediation.
3. **SERP Feature Analysis**:
   - Check presence in Featured Snippets, Knowledge Panels, or Local Packs.
