"""
Tests for Rank Tracker, Backlinks, and Competitor REST API Endpoints.
"""

import asyncio
from neemseo.db.session import init_db
from neemseo.ranker.schemas import AddTargetRequest, CheckRankRequest, DeviceType
from neemseo.backlinks.schemas import BacklinkResearchRequest
from neemseo.competitors.schemas import CompetitorGapRequest
from neemseo.api.v1.rank_tracker import (
    add_target,
    list_targets,
    run_rank_checks,
    get_rank_trend,
    get_rank_alerts,
)
from neemseo.api.v1.backlinks import (
    fetch_backlink_snapshot,
    list_snapshots,
    get_snapshot,
    export_snapshot_csv,
)
from neemseo.api.v1.competitors import analyze_competitor_gaps

init_db()


def test_rank_tracker_api_flow():
    # 1. Add target
    target = add_target(AddTargetRequest(
        keyword="fastapi seo framework",
        target_url="https://neemseo.com/fastapi",
        device=DeviceType.DESKTOP,
    ))
    assert target.id is not None

    # 2. List targets
    targets = list_targets()
    assert any(t.id == target.id for t in targets)

    # 3. Run check
    checks = asyncio.run(run_rank_checks(CheckRankRequest(
        target_ids=[target.id],
        confirm_cost=True,
    )))
    assert len(checks) >= 1
    assert checks[0].position is not None

    # 4. View trend
    trend = get_rank_trend(target.id)
    assert trend.keyword == "fastapi seo framework"

    # 5. Get alerts
    alerts = get_rank_alerts()
    assert isinstance(alerts, list)


def test_backlinks_api_flow():
    # 1. Fetch snapshot
    snap = asyncio.run(fetch_backlink_snapshot(BacklinkResearchRequest(
        target_domain="target-site.org",
        max_backlinks=20,
        confirm_cost=True,
    )))
    assert snap.id is not None
    assert snap.target_domain == "target-site.org"

    # 2. List snapshots
    snaps = list_snapshots(domain="target-site.org")
    assert len(snaps) >= 1

    # 3. Get single snapshot
    detail = get_snapshot(snap.id)
    assert detail.id == snap.id

    # 4. Export CSV
    csv_resp = export_snapshot_csv(snap.id)
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.media_type
    assert b"Source URL,Source Domain,Target URL" in csv_resp.body


def test_competitor_api_flow():
    report = asyncio.run(analyze_competitor_gaps(CompetitorGapRequest(
        target_domain="target-site.org",
        competitors=["rival-a.com", "rival-b.com"],
    )))
    assert report.target_domain == "target-site.org"
    assert len(report.keyword_gaps) > 0
    assert len(report.backlink_gaps) > 0
