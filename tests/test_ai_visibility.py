"""
Tests for neemSEO AI Visibility Engine (GEO - Generative Engine Optimization).
"""

import asyncio
import pytest
from neemseo.db.session import init_db, SessionLocal
from neemseo.db.models import AIVisibilityRun
from neemseo.aivisibility.schemas import AIVisibilityRequest
from neemseo.aivisibility.service import AIVisibilityService
from neemseo.mcp.server import check_ai_visibility


@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()
    with SessionLocal() as db:
        db.query(AIVisibilityRun).delete()
        db.commit()
    yield
    with SessionLocal() as db:
        db.query(AIVisibilityRun).delete()
        db.commit()


def test_ai_visibility_audit_basic():
    svc = AIVisibilityService()
    req = AIVisibilityRequest(
        domain="https://neemseo.com/",
        brand_name="neemSEO",
    )
    result = svc.audit_visibility(req)

    assert result.domain == "neemseo.com"
    assert result.brand_name == "neemSEO"
    assert 0 <= result.overall_score <= 100
    assert result.queries_count > 0
    assert len(result.engine_breakdown) == 5

    # Check engines
    engines = [b.engine for b in result.engine_breakdown]
    assert "chatgpt" in engines
    assert "claude" in engines
    assert "perplexity" in engines
    assert "gemini" in engines
    assert "google_ai_overview" in engines

    # Check metrics
    assert 0.0 <= result.mention_rate_pct <= 100.0
    assert 0.0 <= result.citation_rate_pct <= 100.0
    assert 0.0 <= result.recommendation_rate_pct <= 100.0

    # Check optimization tips
    assert len(result.optimization_tips) >= 3
    assert any("Schema.org" in tip for tip in result.optimization_tips)

    # Check query results
    assert len(result.query_results) > 0
    sample = result.query_results[0]
    assert sample.query is not None
    assert sample.engine in engines
    assert sample.sentiment in ["positive", "neutral", "absent"]


def test_ai_visibility_custom_queries():
    svc = AIVisibilityService()
    custom_queries = [
        "What is neemSEO and how does it compare to Ahrefs?",
        "Best self-hosted SEO platform with MCP agent skills",
    ]
    req = AIVisibilityRequest(
        domain="neemseo.com",
        brand_name="neemSEO",
        queries=custom_queries,
        engines=["chatgpt", "perplexity"],
    )
    result = svc.audit_visibility(req)

    assert result.queries_count == 2
    assert len(result.engine_breakdown) == 2
    assert len(result.query_results) == 4  # 2 queries * 2 engines


def test_ai_visibility_history_and_persistence():
    svc = AIVisibilityService()
    req1 = AIVisibilityRequest(domain="site1.com", brand_name="SiteOne")
    req2 = AIVisibilityRequest(domain="site2.com", brand_name="SiteTwo")

    res1 = svc.audit_visibility(req1)
    res2 = svc.audit_visibility(req2)

    history = svc.get_history()
    assert len(history) == 2

    # Filter by domain
    history_site1 = svc.get_history(domain="site1.com")
    assert len(history_site1) == 1
    assert history_site1[0].brand_name == "SiteOne"

    # Fetch specific run details
    full_run = svc.get_run(res1.id)
    assert full_run is not None
    assert full_run.id == res1.id
    assert full_run.brand_name == "SiteOne"
    assert len(full_run.engine_breakdown) == 5
    assert len(full_run.optimization_tips) > 0


def test_ai_visibility_mcp_tool():
    res = asyncio.run(check_ai_visibility(
        domain="mybrand.org",
        brand_name="MyBrand",
    ))
    assert "run_id" in res
    assert res["domain"] == "mybrand.org"
    assert 0 <= res["overall_score"] <= 100
    assert len(res["engine_breakdown"]) == 5
    assert len(res["optimization_tips"]) >= 3
    assert len(res["sample_query_results"]) > 0
