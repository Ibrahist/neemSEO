"""
Tests for neemSEO Rank Tracker Service and Trend Analysis.
"""

import asyncio
from neemseo.db.session import init_db
from neemseo.ranker.schemas import AddTargetRequest, DeviceType, RankPosition
from neemseo.ranker.service import RankTrackerService
from datetime import datetime, timezone

init_db()


def test_add_and_list_rank_targets():
    svc = RankTrackerService()
    target = svc.add_target(AddTargetRequest(
        keyword="open source seo tool",
        target_url="https://neemseo.com/features",
        location_code=2840,
        location_name="United States",
        device=DeviceType.DESKTOP,
    ))

    assert target.id is not None
    assert target.keyword == "open source seo tool"
    assert target.device == DeviceType.DESKTOP

    targets = svc.list_targets(active_only=True)
    assert any(t.id == target.id for t in targets)


def test_run_serp_checks_and_trend():
    svc = RankTrackerService()
    target = svc.add_target(AddTargetRequest(
        keyword="best rank tracker python",
        target_url="https://neemseo.com/rank-tracker",
        device=DeviceType.DESKTOP,
    ))

    # First check
    results1 = asyncio.run(svc.run_checks(target_ids=[target.id]))
    assert len(results1) == 1
    assert results1[0].position is not None
    pos1 = results1[0].position

    # Second check
    results2 = asyncio.run(svc.run_checks(target_ids=[target.id]))
    assert len(results2) == 1
    assert results2[0].previous_position == pos1

    # Check trend
    trend = svc.get_trend(target.id)
    assert trend is not None
    assert trend.keyword == "best rank tracker python"
    assert trend.current_position is not None
    assert len(trend.checks) >= 2


def test_delete_rank_target():
    svc = RankTrackerService()
    target = svc.add_target(AddTargetRequest(
        keyword="to be deleted keyword",
        target_url="https://neemseo.com/delete-me",
    ))

    ok = svc.delete_target(target.id)
    assert ok is True

    # Should not appear in active targets
    active = svc.list_targets(active_only=True)
    assert not any(t.id == target.id for t in active)
