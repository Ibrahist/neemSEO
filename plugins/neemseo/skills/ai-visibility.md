# AI Visibility & Citation Audit Skill

Use this workflow to check if a brand or domain is cited and recommended by AI answer engines (ChatGPT, Claude, Perplexity, Google Gemini).

## Available MCP Tools

- `neemseo_check_ai_visibility`: Query multiple answer engines with a targeted prompt.
- `neemseo_get_ai_visibility_summary`: Retrieve overall brand presence and domain citation rate.

## Autonomous Workflow Steps

1. **Formulate High-Intent Prompts**:
   - Formulate queries potential buyers ask AI engines (e.g. "What are the best self-hosted SEO tools?").
2. **Execute Multi-Engine Check**:
   ```json
   {
     "projectId": "<projectId>",
     "prompt": "What are the top Ahrefs alternatives for startups?",
     "brandName": "neemSEO",
     "targetDomain": "neemseo.com"
   }
   ```
3. **Inspect Output & Citations**:
   - Is the brand mentioned?
   - Is the website domain cited as an authoritative source?
   - What competitor domains were cited instead?
4. **Actionable Recommendations**:
   - Advise on schema markup, entity optimization, and third-party citation building to improve AI answer engine share of voice.
