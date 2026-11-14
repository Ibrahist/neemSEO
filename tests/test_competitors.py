"""
Tests for neemSEO Competitor Insights Service.
"""

import asyncio
from neemseo.db.session import init_db
from neemseo.competitors.schemas import CompetitorGapRequest
from neemseo.competitors.service import CompetitorService

init_db()


def test_competitor_gap_analysis():
    svc = CompetitorService()
    req = CompetitorGapRequest(
        target_domain="neemseo.com",
        competitors=["semrush.com", "ahrefs.com"],
    )
    report = asyncio.run(svc.analyze_gaps(req))

    assert report.target_domain == "neemseo.com"
    assert "semrush.com" in report.competitors
    assert len(report.keyword_gaps) > 0
    assert len(report.backlink_gaps) > 0

    # Ensure gap types are identified
    gap_types = {k.gap_type for k in report.keyword_gaps}
    assert "missing" in gap_types or "weak" in gap_types or "shared" in gap_types

    # Ensure backlink gaps have outreach estimates
    first_bl = report.backlink_gaps[0]
    assert first_bl.estimated_outreach_value in ("high", "medium", "low")
    assert len(first_bl.links_to_competitors) > 0
