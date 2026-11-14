"""
Tests for neemSEO Backlink Tracker Service, Snapshot Diff, and Anchor Analysis.
"""

import asyncio
from neemseo.db.session import init_db
from neemseo.backlinks.schemas import BacklinkResearchRequest, BacklinkType, BacklinkItem
from neemseo.backlinks.service import BacklinkTrackerService

init_db()


def test_backlink_snapshot_generation():
    svc = BacklinkTrackerService()
    req = BacklinkResearchRequest(
        target_domain="neemseo.com",
        max_backlinks=30,
        confirm_cost=True,
    )
    snap = asyncio.run(svc.fetch_snapshot(req))

    assert snap.id is not None
    assert snap.target_domain == "neemseo.com"
    assert snap.total_backlinks > 0
    assert snap.total_referring_domains > 0
    assert snap.dofollow_count + snap.nofollow_count == snap.total_backlinks
    assert len(snap.top_anchor_texts) > 0
    assert len(snap.referring_domains) > 0

    # Test snapshot retrieval from database
    persisted = svc.get_snapshot(snap.id)
    assert persisted is not None
    assert persisted.total_backlinks == snap.total_backlinks


def test_backlink_snapshot_diff():
    item1 = BacklinkItem(
        snapshot_id="1",
        source_url="https://site-a.com/link",
        source_domain="site-a.com",
        target_url="https://target.com/",
    )
    item2 = BacklinkItem(
        snapshot_id="2",
        source_url="https://site-b.com/link",
        source_domain="site-b.com",
        target_url="https://target.com/",
    )

    prev_urls = ["https://site-a.com/link", "https://site-c.com/old-link"]
    current_links = [item1, item2]

    new_links, lost_links = BacklinkTrackerService._diff_snapshots(current_links, prev_urls)

    # site-b was added
    assert any(b.source_url == "https://site-b.com/link" for b in new_links)
    # site-c was lost
    assert any(b.source_url == "https://site-c.com/old-link" for b in lost_links)
