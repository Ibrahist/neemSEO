"""
neemSEO Rank Tracker REST API Endpoints.
Manage keyword/URL tracking targets, run SERP position checks (BYOK),
view historical trends, and detect drop alerts.
"""

import asyncio
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from neemseo.ranker.schemas import (
    RankTarget,
    RankPosition,
    RankTrend,
    RankAlert,
    AddTargetRequest,
    CheckRankRequest,
    RankCheckCostEstimate,
)
from neemseo.ranker.service import RankTrackerService

router = APIRouter(prefix="/rank-tracker", tags=["Rank Tracker"])
_service = RankTrackerService()


@router.post("/targets", response_model=RankTarget)
def add_target(req: AddTargetRequest):
    """Add a keyword + URL + location + device tracking target."""
    return _service.add_target(req)


@router.get("/targets", response_model=List[RankTarget])
def list_targets(active_only: bool = Query(default=True)):
    """List all rank tracking targets."""
    if not isinstance(active_only, bool):
        active_only = True
    return _service.list_targets(active_only=active_only)


@router.delete("/targets/{target_id}")
def delete_target(target_id: str):
    """Soft-delete a rank tracking target (marks inactive)."""
    ok = _service.delete_target(target_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Target not found.")
    return {"status": "deleted", "target_id": target_id}


@router.get("/estimate-cost", response_model=RankCheckCostEstimate)
def estimate_check_cost(target_ids: Optional[str] = Query(default=None)):
    """Pre-flight cost estimate before running SERP checks (BYOK)."""
    ids = target_ids.split(",") if target_ids else None
    return _service.estimate_check_cost(target_ids=ids)


@router.post("/check", response_model=List[RankPosition])
async def run_rank_checks(req: CheckRankRequest):
    """
    Execute SERP position checks for all (or specified) active targets.
    Shows a cost estimate if confirm_cost=False.
    """
    # Pre-flight cost gate
    if not req.confirm_cost:
        est = _service.estimate_check_cost(target_ids=req.target_ids)
        if est.estimated_cost_usd > 0:
            return [{
                "status": "confirmation_required",
                "estimated_cost_usd": est.estimated_cost_usd,
                "target_count": est.target_count,
                "explanation": est.explanation,
                "hint": "Set confirm_cost=true to authorize this request.",
            }]

    results = await _service.run_checks(target_ids=req.target_ids)
    return results


@router.get("/trends/{target_id}", response_model=RankTrend)
def get_rank_trend(target_id: str, limit: int = Query(default=30, ge=1, le=100)):
    """Get full position history and trend data for a rank target."""
    if not isinstance(limit, int):
        limit = 30
    trend = _service.get_trend(target_id, limit=limit)
    if not trend:
        raise HTTPException(status_code=404, detail="Target not found or no data yet.")
    return trend


@router.get("/alerts", response_model=List[RankAlert])
def get_rank_alerts():
    """Return all active drop/gain alerts across all tracked keywords."""
    return _service.detect_alerts()


@router.get("/history")
def list_all_checks(limit: int = Query(default=50, ge=1, le=500)):
    """List all recent SERP check results across all targets."""
    from neemseo.db.session import SessionLocal
    from neemseo.db.models import RankCheck
    from neemseo.ranker.schemas import DeviceType

    try:
        with SessionLocal() as db:
            rows = (
                db.query(RankCheck)
                .order_by(RankCheck.checked_at.desc())
                .limit(limit)
                .all()
            )
            return [
                {
                    "id": r.id,
                    "target_id": r.target_id,
                    "keyword": r.keyword,
                    "target_url": r.target_url,
                    "position": r.position,
                    "previous_position": r.previous_position,
                    "position_change": r.position_change,
                    "device": r.device,
                    "checked_at": r.checked_at.isoformat() if r.checked_at else None,
                    "cost_usd": r.cost_usd,
                    "source": r.source,
                }
                for r in rows
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

