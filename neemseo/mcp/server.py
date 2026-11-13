"""
neemSEO Model Context Protocol (MCP) Server.
Exposes neemSEO audit, keyword research, and rank tracking tools directly to AI agents
(Claude Code, ChatGPT, Codex, Cursor) with upfront cost transparency and explicit confirmation.
"""

import asyncio
from typing import Optional, List, Dict, Any
from mcp.server.fastmcp import FastMCP

from neemseo.core.auditor import OnPageAuditor
from neemseo.rules.registry import registry
from neemseo.adapters.dataforseo import DataForSEOAdapter

# Initialize FastMCP server with exact naming requirement
mcp = FastMCP("neemseo")


@mcp.tool()
async def audit_url(url: str, keyword: Optional[str] = None) -> Dict[str, Any]:
    """
    Run an on-page SEO audit on a public URL.
    Returns the overall health score, grade, category breakdown, and prioritized fix list.
    Estimated Cost: $0.00 (Free)
    """
    auditor = OnPageAuditor()
    report = await auditor.audit_url(url=url, keyword=keyword, check_pagespeed=False)

    return {
        "url": report.url,
        "overall_score": report.overall_score,
        "grade": report.grade,
        "status_code": report.status_code,
        "response_time_ms": report.response_time_ms,
        "summary": report.page_summary,
        "category_scores": {k: v.model_dump() for k, v in report.category_scores.items()},
        "top_fixes": [
            {
                "impact": fix.impact_score,
                "status": fix.status.value,
                "title": fix.title,
                "message": fix.message,
                "recommendation": fix.recommendation,
                "category": fix.category.value,
            }
            for fix in report.prioritized_fixes[:8]
        ],
        "cost_incurred_usd": 0.0,
    }


@mcp.tool()
def list_available_rules() -> List[Dict[str, Any]]:
    """
    List all available on-page SEO check rules and their impact weights.
    Estimated Cost: $0.00 (Free)
    """
    return registry.list_rules()


@mcp.tool()
async def estimate_action_cost(action: str, count: int = 1) -> Dict[str, Any]:
    """
    Check the estimated cost in USD for a paid SEO data action before executing it.
    """
    adapter = DataForSEOAdapter()
    est = await adapter.estimate_cost(action, {"keywords": [i for i in range(count)]})
    return {
        "action": action,
        "count": count,
        "estimated_usd": float(est.estimated_usd),
        "explanation": est.explanation,
    }


@mcp.tool()
async def keyword_ideas(
    seed: str,
    confirm_cost: bool = False,
) -> Dict[str, Any]:
    """
    Generate keyword ideas and metrics for a seed term.
    Requires BYOK DataForSEO key and explicit confirmation since this queries a paid API.
    """
    adapter = DataForSEOAdapter()
    est = await adapter.estimate_cost("keywords_data", {"keywords": [seed]})

    if not confirm_cost:
        return {
            "status": "confirmation_required",
            "estimated_cost_usd": float(est.estimated_usd),
            "warning": (
                f"This action costs approximately ${est.estimated_usd:.4f} USD via DataForSEO. "
                "Pass confirm_cost=True to authorize this request."
            ),
        }

    # If confirmed, query adapter
    res = await adapter.fetch_with_cache_and_budget("keywords_data", {"keywords": [seed]})
    return {
        "seed": seed,
        "cost_incurred_usd": float(est.estimated_usd),
        "data": res,
    }


def main():
    mcp.run()


if __name__ == "__main__":
    main()
