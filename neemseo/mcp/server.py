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
from neemseo.crawler.schemas import CrawlConfig, CrawlSummaryReport
from neemseo.crawler.manager import crawler_manager
from neemseo.crawler.analyzer import CrawlAnalyzer
from neemseo.db.models import Crawl
from neemseo.db.session import SessionLocal
from neemseo.keywords.schemas import KeywordResearchRequest, ClusterRequest, KeywordItem
from neemseo.keywords.service import KeywordResearchService
from neemseo.keywords.clustering import KeywordClusterer
from neemseo.keywords.intent import IntentClassifier
from neemseo.keywords.scoring import PriorityScorer
from neemseo.ranker.schemas import AddTargetRequest, CheckRankRequest, DeviceType
from neemseo.ranker.service import RankTrackerService
from neemseo.backlinks.schemas import BacklinkResearchRequest
from neemseo.backlinks.service import BacklinkTrackerService

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


@mcp.tool()
def start_site_crawl(
    seed_url: str,
    max_pages: int = 50,
    max_depth: int = 3,
    check_sitemap: bool = True,
) -> Dict[str, Any]:
    """
    Start an autonomous background crawl across an entire domain.
    Inspects internal link architecture, finds broken links (4xx/5xx), duplicate titles, and orphan pages.
    Estimated Cost: $0.00 (Free)
    """
    config = CrawlConfig(
        seed_url=seed_url,
        max_pages=max_pages,
        max_depth=max_depth,
        check_sitemap=check_sitemap,
    )
    crawl_id = crawler_manager.start_crawl(config)
    return {
        "crawl_id": crawl_id,
        "seed_url": seed_url,
        "status": "started",
        "message": f"Crawl started for {seed_url}. Check progress with get_crawl_progress(crawl_id='{crawl_id}').",
    }


@mcp.tool()
def get_crawl_progress(crawl_id: str) -> Dict[str, Any]:
    """
    Get live progress updates for an active or completed site crawl.
    """
    prog = crawler_manager.get_progress(crawl_id)
    if not prog:
        return {"error": "Crawl ID not found"}
    return prog.model_dump()


@mcp.tool()
def get_site_crawl_report(crawl_id: str) -> Dict[str, Any]:
    """
    Retrieve full post-crawl audit report including broken links, duplicate titles, and orphan pages.
    """
    with SessionLocal() as db:
        c = db.query(Crawl).filter(Crawl.id == crawl_id).first()
        if not c:
            return {"error": "Crawl ID not found"}
        if not c.report_summary:
            return {"status": c.status, "message": "Report generation in progress", "pages_crawled": c.pages_crawled}
        return c.report_summary


@mcp.tool()
def compare_site_crawls(base_crawl_id: str, target_crawl_id: str) -> Dict[str, Any]:
    """
    Compare two completed crawls of the same website to identify SEO improvements, regressions, and resolved broken links.
    """
    with SessionLocal() as db:
        c1 = db.query(Crawl).filter(Crawl.id == base_crawl_id).first()
        c2 = db.query(Crawl).filter(Crawl.id == target_crawl_id).first()

        if not c1 or not c2:
            return {"error": "One or both crawl IDs not found"}
        if not c1.report_summary or not c2.report_summary:
            return {"error": "Both crawls must be completed with report summaries"}

        r1 = CrawlSummaryReport(**c1.report_summary)
        r2 = CrawlSummaryReport(**c2.report_summary)
        diff = CrawlAnalyzer.compare_crawls(r1, r2)
        return diff.model_dump()


@mcp.tool()
async def research_keywords(
    seed_keyword: str,
    country: str = "US",
    expand_alphabet: bool = True,
    expand_questions: bool = True,
    use_paid_api: bool = False,
    max_results: int = 100,
) -> Dict[str, Any]:
    """
    Research keyword opportunities from a seed term with intent labeling, topic clustering, and priority scoring.
    Free mode ($0.00) uses Google Autocomplete + A-Z expansion.
    """
    service = KeywordResearchService()
    req = KeywordResearchRequest(
        seed_keyword=seed_keyword,
        country_code=country,
        expand_alphabet=expand_alphabet,
        expand_questions=expand_questions,
        use_paid_api=use_paid_api,
        max_results=max_results,
        save_to_db=True,
    )
    result = await service.research(req)
    return {
        "id": result.id,
        "seed_keyword": result.seed_keyword,
        "total_found": result.total_found,
        "cost_usd": result.cost_usd,
        "clusters": [
            {
                "cluster_name": c.cluster_name,
                "keyword_count": c.keyword_count,
                "total_volume": c.total_volume,
                "average_difficulty": c.average_difficulty,
                "dominant_intent": c.dominant_intent.value,
            }
            for c in result.clusters
        ],
        "top_keywords": [
            {
                "keyword": k.keyword,
                "priority_score": k.priority_score,
                "search_volume": k.search_volume,
                "difficulty": k.difficulty,
                "cpc": k.cpc,
                "intent": k.intent.value,
                "cluster": k.cluster,
            }
            for k in sorted(result.keywords, key=lambda x: x.priority_score, reverse=True)[:30]
        ],
    }


@mcp.tool()
def cluster_keywords(keywords: List[str]) -> Dict[str, Any]:
    """
    Group arbitrary list of keywords into thematic topic clusters with intent classification.
    """
    items = []
    for kw in keywords:
        clean = kw.strip()
        if not clean:
            continue
        intent, conf = IntentClassifier.classify(clean)
        priority = PriorityScorer.calculate(search_volume=1000, difficulty=35, intent=intent)
        items.append(
            KeywordItem(
                keyword=clean,
                search_volume=1000,
                difficulty=35,
                intent=intent,
                priority_score=priority,
                cluster="General",
                intent_confidence=conf,
            )
        )

    clusters = KeywordClusterer.cluster(items)
    return {
        "total_keywords": len(items),
        "clusters": [
            {
                "cluster_name": c.cluster_name,
                "keyword_count": c.keyword_count,
                "dominant_intent": c.dominant_intent.value,
                "keywords": [k.keyword for k in c.keywords],
            }
            for c in clusters
        ],
    }


@mcp.tool()
def add_rank_target(
    keyword: str,
    target_url: str,
    location_code: int = 2840,
    location_name: str = "United States",
    device: str = "desktop",
) -> Dict[str, Any]:
    """
    Add a keyword + URL + location + device combination to the rank tracker.
    Rankings vary by location and device, so all four fields are required.
    Estimated Cost: $0.00 (Free — cost only incurred on SERP check)
    """
    svc = RankTrackerService()
    target = svc.add_target(AddTargetRequest(
        keyword=keyword,
        target_url=target_url,
        location_code=location_code,
        location_name=location_name,
        device=DeviceType(device),
    ))
    return {
        "target_id": target.id,
        "keyword": target.keyword,
        "target_url": target.target_url,
        "device": target.device.value,
        "location": target.location_name,
        "message": f"Tracking target created. Run check_serp_positions to record first position.",
    }


@mcp.tool()
def list_rank_targets() -> Dict[str, Any]:
    """List all active keyword rank tracking targets."""
    svc = RankTrackerService()
    targets = svc.list_targets()
    return {
        "total": len(targets),
        "targets": [
            {
                "id": t.id,
                "keyword": t.keyword,
                "target_url": t.target_url,
                "device": t.device.value,
                "location": t.location_name,
            }
            for t in targets
        ],
    }


@mcp.tool()
async def check_serp_positions(
    target_ids: Optional[List[str]] = None,
    confirm_cost: bool = False,
) -> Dict[str, Any]:
    """
    Run SERP position checks for tracked keywords via DataForSEO (BYOK).
    Shows cost estimate first. Set confirm_cost=True to execute the paid check.
    Free-mode generates simulated positions at $0.00 when no key is configured.
    """
    svc = RankTrackerService()
    est = svc.estimate_check_cost(target_ids=target_ids)

    if not confirm_cost and est.estimated_cost_usd > 0:
        return {
            "status": "confirmation_required",
            "estimated_cost_usd": est.estimated_cost_usd,
            "target_count": est.target_count,
            "explanation": est.explanation,
            "hint": "Set confirm_cost=True to authorize this paid check.",
        }

    results = await svc.run_checks(target_ids=target_ids)
    return {
        "checked": len(results),
        "total_cost_usd": sum(r.cost_usd for r in results),
        "results": [
            {
                "keyword": r.keyword,
                "position": r.position,
                "previous_position": r.previous_position,
                "change": r.position_change,
                "device": r.device.value,
                "source": r.source,
            }
            for r in results
        ],
    }


@mcp.tool()
def get_rank_trend(target_id: str, limit: int = 30) -> Dict[str, Any]:
    """
    Get historical position trend and drop alerts for a rank tracking target.
    """
    svc = RankTrackerService()
    trend = svc.get_trend(target_id, limit=limit)
    if not trend:
        return {"error": "Target not found or no position history yet."}
    return {
        "keyword": trend.keyword,
        "target_url": trend.target_url,
        "current_position": trend.current_position,
        "best_position": trend.best_position,
        "worst_position": trend.worst_position,
        "has_alert": trend.has_alert,
        "alert_message": trend.alert_message,
        "history": [
            {"position": c.position, "checked_at": c.checked_at.isoformat() if c.checked_at else None}
            for c in trend.checks
        ],
    }


@mcp.tool()
async def fetch_backlinks(
    target_domain: str,
    max_backlinks: int = 100,
    confirm_cost: bool = False,
) -> Dict[str, Any]:
    """
    Fetch a backlink profile snapshot for a domain.
    Free-mode generates realistic demo data at $0.00.
    Requires confirm_cost=True when DataForSEO credentials are configured (paid call: ~$0.02).
    """
    svc = BacklinkTrackerService()
    est = svc.estimate_cost(target_domain)

    from neemseo.adapters.dataforseo import DataForSEOAdapter
    adapter = DataForSEOAdapter()
    if adapter.is_configured() and not confirm_cost:
        return {
            "status": "confirmation_required",
            "estimated_cost_usd": est.estimated_cost_usd,
            "explanation": est.explanation,
            "hint": "Set confirm_cost=True to authorize this paid snapshot.",
        }

    req = BacklinkResearchRequest(
        target_domain=target_domain,
        max_backlinks=max_backlinks,
        confirm_cost=confirm_cost,
    )
    snapshot = await svc.fetch_snapshot(req)
    return {
        "snapshot_id": snapshot.id,
        "target_domain": snapshot.target_domain,
        "total_backlinks": snapshot.total_backlinks,
        "total_referring_domains": snapshot.total_referring_domains,
        "dofollow_count": snapshot.dofollow_count,
        "nofollow_count": snapshot.nofollow_count,
        "new_links_since_last": snapshot.new_links_since_last,
        "lost_links_since_last": snapshot.lost_links_since_last,
        "cost_usd": snapshot.cost_usd,
        "source": snapshot.source,
        "top_anchors": snapshot.top_anchor_texts[:5],
        "top_referring_domains": [
            {"domain": d.domain, "links": d.total_links, "dr": d.domain_rank}
            for d in snapshot.referring_domains[:10]
        ],
    }


def main():
    mcp.run()


if __name__ == "__main__":
    main()
