"""
Tests for Keyword Research REST API Endpoints.
"""

import asyncio
from neemseo.db.session import init_db
from neemseo.keywords.schemas import (
    KeywordResearchRequest,
    ClusterRequest,
)
from neemseo.api.v1.keywords import (
    research_keywords,
    cluster_keywords,
    estimate_keyword_cost,
    list_keyword_runs,
    get_keyword_run,
    export_keywords_csv,
)

init_db()


def test_keyword_research_api_flow():
    req = KeywordResearchRequest(
        seed_keyword="python seo crawler",
        country_code="US",
        expand_alphabet=False,
        expand_questions=True,
        use_paid_api=False,
        max_results=10,
        save_to_db=True,
    )
    res = asyncio.run(research_keywords(req))

    assert res.seed_keyword == "python seo crawler"
    assert res.total_found > 0
    assert len(res.keywords) > 0
    assert res.id is not None
    assert any(k.intent for k in res.keywords)
    assert any(k.priority_score >= 1 for k in res.keywords)

    # Verify run is returned in list
    runs = list_keyword_runs(limit=10)
    assert len(runs) >= 1
    assert any(r.id == res.id for r in runs)

    # Verify run details
    details = get_keyword_run(res.id)
    assert details["seed_keyword"] == "python seo crawler"
    assert len(details["keywords"]) > 0

    # Verify CSV export
    csv_resp = export_keywords_csv(res.id)
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.media_type
    assert b"Keyword,Search Volume,Keyword Difficulty" in csv_resp.body


def test_cluster_keywords_api():
    req = ClusterRequest(
        keywords=[
            "best mechanical keyboard",
            "top mechanical keyboards for gaming",
            "python async programming",
            "asyncio in python tutorial",
        ]
    )
    res = asyncio.run(cluster_keywords(req))

    assert res.total_keywords == 4
    assert len(res.clusters) >= 2


def test_cost_estimator_api():
    # Free mode
    free_est = asyncio.run(estimate_keyword_cost(count=100, use_paid_api=False))
    assert free_est.estimated_cost_usd == 0.0

    # Paid mode
    paid_est = asyncio.run(estimate_keyword_cost(count=50, use_paid_api=True))
    assert paid_est.estimated_cost_usd > 0.0
    assert "keyword(s)" in paid_est.explanation

