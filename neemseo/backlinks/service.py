"""
neemSEO Backlink Tracker Service.
Fetches backlink profiles via DataForSEO (BYOK), persists snapshots,
computes new/lost link diffs between snapshots, and builds anchor text analysis.
"""

import uuid
from decimal import Decimal
from collections import Counter
from typing import List, Optional
from datetime import datetime, timezone
from urllib.parse import urlparse

from neemseo.backlinks.schemas import (
    BacklinkItem,
    BacklinkDomainSummary,
    BacklinkSnapshot,
    BacklinkDiff,
    BacklinkResearchRequest,
    BacklinkCostEstimate,
    BacklinkType,
)
from neemseo.adapters.dataforseo import DataForSEOAdapter
from neemseo.db.session import SessionLocal
from neemseo.db.models import BacklinkSnapshotRecord, BacklinkRecord

COST_PER_SNAPSHOT = Decimal("0.02")


class BacklinkTrackerService:
    """Manages backlink snapshots and new/lost link detection."""

    def __init__(self, dataforseo: Optional[DataForSEOAdapter] = None):
        self.dataforseo = dataforseo or DataForSEOAdapter()

    def estimate_cost(self, target_domain: str) -> BacklinkCostEstimate:
        """Pre-flight cost estimate for a backlink snapshot."""
        return BacklinkCostEstimate(
            target_domain=target_domain,
            estimated_cost_usd=float(COST_PER_SNAPSHOT),
            explanation=(
                f"One DataForSEO backlink summary snapshot for '{target_domain}' "
                f"costs approximately ${COST_PER_SNAPSHOT}."
            ),
        )

    async def fetch_snapshot(self, req: BacklinkResearchRequest) -> BacklinkSnapshot:
        """
        Fetches a backlink profile snapshot for a domain.
        Uses DataForSEO when BYOK credentials are set; otherwise generates
        a realistic demo snapshot for free mode / testing.
        """
        snapshot_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        target = req.target_domain.strip().lower().lstrip("https://").lstrip("http://").rstrip("/")

        if self.dataforseo.is_configured():
            backlinks, cost = await self._fetch_from_dataforseo(
                target, req.max_backlinks
            )
            source = "dataforseo"
        else:
            backlinks, cost = self._generate_demo_backlinks(target, req.max_backlinks, snapshot_id)
            source = "simulated"

        # Compute aggregates
        dofollow = sum(1 for b in backlinks if b.link_type == BacklinkType.DOFOLLOW)
        nofollow = len(backlinks) - dofollow
        domains = {b.source_domain for b in backlinks}

        # Anchor text analysis
        anchor_counter = Counter(
            b.anchor_text.strip().lower() for b in backlinks if b.anchor_text.strip()
        )
        total = len(backlinks) or 1
        top_anchors = [
            {"text": anchor, "count": cnt, "percentage": round(cnt / total * 100, 1)}
            for anchor, cnt in anchor_counter.most_common(10)
        ]

        # Referring domain summaries
        domain_groups: dict[str, list[BacklinkItem]] = {}
        for b in backlinks:
            domain_groups.setdefault(b.source_domain, []).append(b)

        referring_domains = [
            BacklinkDomainSummary(
                domain=dom,
                total_links=len(links),
                domain_rank=max(l.domain_rank for l in links),
                dofollow_count=sum(1 for l in links if l.link_type == BacklinkType.DOFOLLOW),
                nofollow_count=sum(1 for l in links if l.link_type == BacklinkType.NOFOLLOW),
            )
            for dom, links in sorted(domain_groups.items(), key=lambda x: -len(x[1]))
        ]

        # Compare with previous snapshot
        prev = self._get_latest_snapshot(target)
        new_links, lost_links = self._diff_snapshots(backlinks, prev)
        for b in new_links:
            b.is_new = True
        for b in lost_links:
            b.is_lost = True

        snapshot = BacklinkSnapshot(
            id=snapshot_id,
            target_domain=target,
            total_backlinks=len(backlinks),
            total_referring_domains=len(domains),
            dofollow_count=dofollow,
            nofollow_count=nofollow,
            new_links_since_last=len(new_links),
            lost_links_since_last=len(lost_links),
            top_anchor_texts=top_anchors,
            cost_usd=cost,
            source=source,
            created_at=now,
            backlinks=backlinks,
            referring_domains=referring_domains,
        )

        self._persist_snapshot(snapshot)
        return snapshot

    async def _fetch_from_dataforseo(self, domain: str, max_links: int):
        """Call DataForSEO backlinks summary API."""
        try:
            resp = await self.dataforseo.execute(
                "backlinks/backlinks/live",
                {"target": domain, "limit": max_links},
            )
            items = resp.get("data", {}).get("items", [])
            backlinks = []
            for item in items:
                src = item.get("url_from", "")
                parsed = urlparse(src)
                backlinks.append(BacklinkItem(
                    id=str(uuid.uuid4()),
                    snapshot_id="",  # will be set later
                    source_url=src,
                    source_domain=parsed.netloc or src,
                    target_url=item.get("url_to", domain),
                    anchor_text=item.get("anchor", ""),
                    link_type=BacklinkType.NOFOLLOW if item.get("nofollow") else BacklinkType.DOFOLLOW,
                    domain_rank=item.get("domain_from_rank", 0),
                    page_rank=item.get("page_from_rank", 0),
                ))
            return backlinks, float(COST_PER_SNAPSHOT)
        except Exception:
            return [], 0.0

    @staticmethod
    def _generate_demo_backlinks(domain: str, count: int, snapshot_id: str) -> tuple:
        """Generate realistic demo backlink data for free mode."""
        import hashlib, random
        h = int(hashlib.md5(domain.encode()).hexdigest(), 16)
        random.seed(h)

        demo_domains = [
            ("techcrunch.com", 90), ("moz.com", 88), ("hubspot.com", 85),
            ("searchengineland.com", 83), ("ahrefs.com", 92), ("semrush.com", 91),
            ("backlinko.com", 78), ("neil-patel.com", 82), ("yoast.com", 80),
            ("searchenginejournal.com", 79), ("contentmarketinginstitute.com", 75),
            ("copyblogger.com", 72), ("quicksprout.com", 68), ("bloggingwizard.com", 65),
            ("shanebarker.com", 60), ("localiq.com", 70), ("wordstream.com", 76),
            ("mangools.com", 73), ("rankmath.com", 71), ("seoclarity.net", 64),
        ]

        anchors = [
            domain, "click here", "read more", "source", "via", "reference",
            "seo tool", "site audit", "keyword research", "rank tracker",
            "neemSEO", "open source seo", "seo alternative",
        ]

        link_types = [BacklinkType.DOFOLLOW] * 7 + [BacklinkType.NOFOLLOW] * 3

        backlinks = []
        seen = set()
        for i in range(min(count, len(demo_domains) * 3)):
            d_idx = i % len(demo_domains)
            ref_domain, dr = demo_domains[d_idx]
            if ref_domain in seen and i < len(demo_domains):
                continue
            seen.add(ref_domain)

            path = f"/blog/{random.randint(1000, 9999)}"
            backlinks.append(BacklinkItem(
                id=str(uuid.uuid4()),
                snapshot_id=snapshot_id,
                source_url=f"https://{ref_domain}{path}",
                source_domain=ref_domain,
                target_url=f"https://{domain}/",
                anchor_text=random.choice(anchors),
                link_type=random.choice(link_types),
                domain_rank=dr + random.randint(-5, 5),
                page_rank=random.randint(10, 70),
                first_seen=datetime.now(timezone.utc),
                last_seen=datetime.now(timezone.utc),
            ))

        return backlinks, 0.0

    def _get_latest_snapshot(self, domain: str) -> Optional[List[str]]:
        """Return source URLs from the last snapshot for diff computation."""
        try:
            with SessionLocal() as db:
                snap = (
                    db.query(BacklinkSnapshotRecord)
                    .filter(BacklinkSnapshotRecord.target_domain == domain)
                    .order_by(BacklinkSnapshotRecord.created_at.desc())
                    .first()
                )
                if not snap:
                    return None
                rows = db.query(BacklinkRecord).filter(
                    BacklinkRecord.snapshot_id == snap.id
                ).all()
                return [r.source_url for r in rows]
        except Exception:
            return None

    @staticmethod
    def _diff_snapshots(
        current: List[BacklinkItem],
        prev_urls: Optional[List[str]],
    ) -> tuple[List[BacklinkItem], List[BacklinkItem]]:
        """Compute new and lost backlinks compared to the previous snapshot."""
        if not prev_urls:
            return [], []

        prev_set = set(prev_urls)
        curr_set = {b.source_url for b in current}

        new_links = [b for b in current if b.source_url not in prev_set]
        lost_urls = prev_set - curr_set
        lost_links = [
            BacklinkItem(
                id=str(uuid.uuid4()),
                snapshot_id="",
                source_url=url,
                source_domain=urlparse(url).netloc,
                target_url="",
                is_lost=True,
            )
            for url in lost_urls
        ]
        return new_links, lost_links

    def _persist_snapshot(self, snap: BacklinkSnapshot):
        """Save snapshot record and all backlink rows in a single transaction."""
        try:
            with SessionLocal() as db:
                db.add(BacklinkSnapshotRecord(
                    id=snap.id,
                    target_domain=snap.target_domain,
                    total_backlinks=snap.total_backlinks,
                    total_referring_domains=snap.total_referring_domains,
                    dofollow_count=snap.dofollow_count,
                    nofollow_count=snap.nofollow_count,
                    new_links_since_last=snap.new_links_since_last,
                    lost_links_since_last=snap.lost_links_since_last,
                    top_anchor_texts=snap.top_anchor_texts,
                    cost_usd=snap.cost_usd,
                    source=snap.source,
                    created_at=snap.created_at,
                ))
                for b in snap.backlinks:
                    db.add(BacklinkRecord(
                        id=b.id or str(uuid.uuid4()),
                        snapshot_id=snap.id,
                        source_url=b.source_url,
                        source_domain=b.source_domain,
                        target_url=b.target_url,
                        anchor_text=b.anchor_text,
                        link_type=b.link_type.value,
                        domain_rank=b.domain_rank,
                        page_rank=b.page_rank,
                        is_new=b.is_new,
                        is_lost=b.is_lost,
                    ))
                db.commit()
        except Exception:
            pass

    def list_snapshots(self, domain: Optional[str] = None, limit: int = 20) -> list:
        """List backlink snapshots, optionally filtered by domain."""
        try:
            with SessionLocal() as db:
                q = db.query(BacklinkSnapshotRecord)
                if domain:
                    q = q.filter(BacklinkSnapshotRecord.target_domain == domain)
                rows = q.order_by(BacklinkSnapshotRecord.created_at.desc()).limit(limit).all()
                return rows
        except Exception:
            return []

    def get_snapshot(self, snapshot_id: str) -> Optional[BacklinkSnapshot]:
        """Retrieve full snapshot with all backlink rows."""
        try:
            with SessionLocal() as db:
                snap = db.query(BacklinkSnapshotRecord).filter(
                    BacklinkSnapshotRecord.id == snapshot_id
                ).first()
                if not snap:
                    return None

                rows = db.query(BacklinkRecord).filter(
                    BacklinkRecord.snapshot_id == snapshot_id
                ).all()

                backlinks = [
                    BacklinkItem(
                        id=r.id,
                        snapshot_id=r.snapshot_id,
                        source_url=r.source_url,
                        source_domain=r.source_domain,
                        target_url=r.target_url,
                        anchor_text=r.anchor_text or "",
                        link_type=BacklinkType(r.link_type),
                        domain_rank=r.domain_rank or 0,
                        page_rank=r.page_rank or 0,
                        is_new=r.is_new or False,
                        is_lost=r.is_lost or False,
                    )
                    for r in rows
                ]

                return BacklinkSnapshot(
                    id=snap.id,
                    target_domain=snap.target_domain,
                    total_backlinks=snap.total_backlinks,
                    total_referring_domains=snap.total_referring_domains,
                    dofollow_count=snap.dofollow_count,
                    nofollow_count=snap.nofollow_count,
                    new_links_since_last=snap.new_links_since_last,
                    lost_links_since_last=snap.lost_links_since_last,
                    top_anchor_texts=snap.top_anchor_texts or [],
                    cost_usd=snap.cost_usd or 0.0,
                    source=snap.source or "dataforseo",
                    created_at=snap.created_at,
                    backlinks=backlinks,
                )
        except Exception:
            return None

