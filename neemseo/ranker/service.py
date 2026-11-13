"""
neemSEO Rank Tracker Service.
Manages rank target definitions, executes SERP position checks via DataForSEO (BYOK),
persists historical position data, computes trends, and fires drop alerts.
"""

import uuid
from decimal import Decimal
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from neemseo.ranker.schemas import (
    RankTarget,
    RankPosition,
    RankTrend,
    RankAlert,
    AddTargetRequest,
    CheckRankRequest,
    RankCheckCostEstimate,
    DeviceType,
    RankCheckStatus,
)
from neemseo.adapters.dataforseo import DataForSEOAdapter
from neemseo.db.session import SessionLocal
from neemseo.db.models import RankTrackerTarget, RankCheck

DATAFORSEO_COST_PER_SERP = Decimal("0.002")
DROP_ALERT_THRESHOLD = 5  # positions dropped to trigger alert


class RankTrackerService:
    """Manages keyword rank targets and SERP position history."""

    def __init__(self, dataforseo: Optional[DataForSEOAdapter] = None):
        self.dataforseo = dataforseo or DataForSEOAdapter()

    # ─────────────────────────── Target Management ───────────────────────────

    def add_target(self, req: AddTargetRequest) -> RankTarget:
        """Create a new rank-tracking target and persist it."""
        target_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        with SessionLocal() as db:
            obj = RankTrackerTarget(
                id=target_id,
                keyword=req.keyword,
                target_url=req.target_url,
                location_code=req.location_code,
                location_name=req.location_name,
                language_code=req.language_code,
                device=req.device.value,
                is_active=True,
                created_at=now,
            )
            db.add(obj)
            db.commit()

        return RankTarget(
            id=target_id,
            keyword=req.keyword,
            target_url=req.target_url,
            location_code=req.location_code,
            location_name=req.location_name,
            language_code=req.language_code,
            device=req.device,
            is_active=True,
            created_at=now,
        )

    def list_targets(self, active_only: bool = True) -> List[RankTarget]:
        """Return all rank tracking targets."""
        with SessionLocal() as db:
            q = db.query(RankTrackerTarget)
            if active_only:
                q = q.filter(RankTrackerTarget.is_active == True)
            rows = q.order_by(RankTrackerTarget.created_at.desc()).all()
            return [self._target_from_db(r) for r in rows]

    def delete_target(self, target_id: str) -> bool:
        """Soft-delete a rank target by marking it inactive."""
        with SessionLocal() as db:
            obj = db.query(RankTrackerTarget).filter(RankTrackerTarget.id == target_id).first()
            if not obj:
                return False
            obj.is_active = False
            db.commit()
        return True

    # ───────────────────────── SERP Position Checks ──────────────────────────

    def estimate_check_cost(self, target_ids: Optional[List[str]] = None) -> RankCheckCostEstimate:
        """Pre-flight cost estimate before running SERP checks."""
        with SessionLocal() as db:
            if target_ids:
                count = db.query(RankTrackerTarget).filter(
                    RankTrackerTarget.id.in_(target_ids),
                    RankTrackerTarget.is_active == True,
                ).count()
            else:
                count = db.query(RankTrackerTarget).filter(
                    RankTrackerTarget.is_active == True
                ).count()

        total_cost = DATAFORSEO_COST_PER_SERP * count
        return RankCheckCostEstimate(
            target_count=count,
            estimated_cost_usd=float(total_cost),
            explanation=(
                f"Checking {count} keyword target(s) via DataForSEO SERP API "
                f"at ${DATAFORSEO_COST_PER_SERP} per check = ${total_cost:.4f} total."
            ),
            cost_per_check_usd=float(DATAFORSEO_COST_PER_SERP),
        )

    async def run_checks(
        self,
        target_ids: Optional[List[str]] = None,
    ) -> List[RankPosition]:
        """
        Execute SERP position checks for all (or specified) active targets.
        Uses DataForSEO SERP API when configured, otherwise returns simulated positions
        (for testing / free mode fallback).
        """
        with SessionLocal() as db:
            q = db.query(RankTrackerTarget).filter(RankTrackerTarget.is_active == True)
            if target_ids:
                q = q.filter(RankTrackerTarget.id.in_(target_ids))
            targets = q.all()

        if not targets:
            return []

        results: List[RankPosition] = []
        now = datetime.now(timezone.utc)

        for target in targets:
            # Get previous position for this target
            prev_pos = self._get_last_position(target.id)

            if self.dataforseo.is_configured():
                position, url_found, is_snippet = await self._fetch_serp_position(
                    keyword=target.keyword,
                    target_url=target.target_url,
                    location_code=target.location_code,
                    language_code=target.language_code,
                    device=target.device,
                )
                cost = float(DATAFORSEO_COST_PER_SERP)
                source = "dataforseo"
            else:
                # Free mode: simulate position (for demo/testing)
                position, url_found, is_snippet = self._simulate_position(
                    target.keyword, target.target_url, prev_pos
                )
                cost = 0.0
                source = "simulated"

            change = None
            if position is not None and prev_pos is not None:
                change = prev_pos - position  # positive = improved

            rank_pos = RankPosition(
                id=str(uuid.uuid4()),
                target_id=target.id,
                keyword=target.keyword,
                target_url=target.target_url,
                position=position,
                previous_position=prev_pos,
                position_change=change,
                url_found=url_found,
                is_featured_snippet=is_snippet,
                location_code=target.location_code,
                device=DeviceType(target.device),
                checked_at=now,
                cost_usd=cost,
                source=source,
            )

            # Persist to DB
            self._save_check(rank_pos)
            results.append(rank_pos)

        return results

    async def _fetch_serp_position(
        self,
        keyword: str,
        target_url: str,
        location_code: int,
        language_code: str,
        device: str,
    ):
        """Query DataForSEO SERP Organic endpoint for the keyword."""
        try:
            resp = await self.dataforseo.execute(
                "serp/google/organic/live/advanced",
                {
                    "keyword": keyword,
                    "location_code": location_code,
                    "language_code": language_code,
                    "device": device,
                    "depth": 100,
                },
            )
            items = resp.get("data", {}).get("items", [])
            for item in items:
                if target_url in item.get("url", ""):
                    return (
                        item.get("rank_absolute"),
                        item.get("url"),
                        item.get("type") == "featured_snippet",
                    )
        except Exception:
            pass
        return None, None, False

    @staticmethod
    def _simulate_position(keyword: str, target_url: str, prev_pos: Optional[int]):
        """Deterministic simulation for free-mode / testing."""
        import hashlib
        h = int(hashlib.md5(f"{keyword}{target_url}".encode()).hexdigest(), 16)
        base = (h % 50) + 1
        # Slight random drift per check
        import random
        random.seed(h % 10000)
        drift = random.randint(-3, 3)
        pos = max(1, min(100, base + drift))
        return pos, target_url, False

    def _get_last_position(self, target_id: str) -> Optional[int]:
        """Return the most recent recorded position for a target."""
        try:
            with SessionLocal() as db:
                row = (
                    db.query(RankCheck)
                    .filter(RankCheck.target_id == target_id)
                    .order_by(RankCheck.checked_at.desc())
                    .first()
                )
                return row.position if row else None
        except Exception:
            return None

    def _save_check(self, pos: RankPosition):
        try:
            with SessionLocal() as db:
                db.add(RankCheck(
                    id=pos.id,
                    target_id=pos.target_id,
                    keyword=pos.keyword,
                    target_url=pos.target_url,
                    position=pos.position,
                    previous_position=pos.previous_position,
                    position_change=pos.position_change,
                    url_found=pos.url_found,
                    is_featured_snippet=pos.is_featured_snippet,
                    is_local_pack=pos.is_local_pack,
                    location_code=pos.location_code,
                    device=pos.device.value,
                    cost_usd=pos.cost_usd,
                    source=pos.source,
                    checked_at=pos.checked_at,
                ))
                db.commit()
        except Exception:
            pass

    # ─────────────────────────── Trends & History ────────────────────────────

    def get_trend(self, target_id: str, limit: int = 30) -> Optional[RankTrend]:
        """Return position history trend for a rank target."""
        try:
            with SessionLocal() as db:
                target_obj = db.query(RankTrackerTarget).filter(
                    RankTrackerTarget.id == target_id
                ).first()
                if not target_obj:
                    return None

                checks = (
                    db.query(RankCheck)
                    .filter(RankCheck.target_id == target_id)
                    .order_by(RankCheck.checked_at.desc())
                    .limit(limit)
                    .all()
                )

                positions = [c.position for c in checks if c.position is not None]
                current_pos = checks[0].position if checks else None
                best_pos = min(positions) if positions else None
                worst_pos = max(positions) if positions else None

                # Drop alert
                has_alert = False
                alert_msg = None
                if len(checks) >= 2 and checks[0].position and checks[1].position:
                    drop = checks[0].position - checks[1].position
                    if drop >= DROP_ALERT_THRESHOLD:
                        has_alert = True
                        alert_msg = f"Position dropped {drop} spots: #{checks[1].position} → #{checks[0].position}"

                history = [
                    RankPosition(
                        id=c.id,
                        target_id=c.target_id,
                        keyword=c.keyword,
                        target_url=c.target_url,
                        position=c.position,
                        previous_position=c.previous_position,
                        position_change=c.position_change,
                        url_found=c.url_found,
                        is_featured_snippet=c.is_featured_snippet or False,
                        location_code=c.location_code,
                        device=DeviceType(c.device),
                        checked_at=c.checked_at,
                        cost_usd=c.cost_usd or 0.0,
                        source=c.source or "dataforseo",
                    )
                    for c in reversed(checks)  # oldest first for chart
                ]

                return RankTrend(
                    target_id=target_id,
                    keyword=target_obj.keyword,
                    target_url=target_obj.target_url,
                    device=DeviceType(target_obj.device),
                    location_name=target_obj.location_name,
                    current_position=current_pos,
                    best_position=best_pos,
                    worst_position=worst_pos,
                    checks=history,
                    has_alert=has_alert,
                    alert_message=alert_msg,
                )
        except Exception:
            return None

    def detect_alerts(self) -> List[RankAlert]:
        """Scan all recent checks for significant position drops."""
        alerts: List[RankAlert] = []
        try:
            with SessionLocal() as db:
                targets = db.query(RankTrackerTarget).filter(
                    RankTrackerTarget.is_active == True
                ).all()
                for t in targets:
                    recent = (
                        db.query(RankCheck)
                        .filter(RankCheck.target_id == t.id)
                        .order_by(RankCheck.checked_at.desc())
                        .limit(2)
                        .all()
                    )
                    if len(recent) < 2:
                        continue
                    new_p, old_p = recent[0].position, recent[1].position
                    if new_p is None or old_p is None:
                        continue
                    change = old_p - new_p
                    if abs(change) >= DROP_ALERT_THRESHOLD:
                        alert_type = "drop" if change < 0 else "gain"
                        alerts.append(RankAlert(
                            target_id=t.id,
                            keyword=t.keyword,
                            target_url=t.target_url,
                            old_position=old_p,
                            new_position=new_p,
                            change=change,
                            alert_type=alert_type,
                            created_at=recent[0].checked_at,
                        ))
        except Exception:
            pass
        return alerts

    @staticmethod
    def _target_from_db(r: "RankTrackerTarget") -> RankTarget:
        return RankTarget(
            id=r.id,
            keyword=r.keyword,
            target_url=r.target_url,
            location_code=r.location_code,
            location_name=r.location_name,
            language_code=r.language_code,
            device=DeviceType(r.device),
            is_active=r.is_active,
            created_at=r.created_at,
        )

