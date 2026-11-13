"""
neemSEO Backlink Tracker REST API Endpoints.
Fetch domain backlink snapshots (BYOK DataForSEO), detect new/lost links,
view anchor text analysis, and export data as CSV.
"""

import io
import csv
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Response

from neemseo.backlinks.schemas import (
    BacklinkSnapshot,
    BacklinkResearchRequest,
    BacklinkCostEstimate,
)
from neemseo.backlinks.service import BacklinkTrackerService
from neemseo.db.session import SessionLocal
from neemseo.db.models import BacklinkSnapshotRecord

router = APIRouter(prefix="/backlinks", tags=["Backlink Tracker"])
_service = BacklinkTrackerService()


@router.get("/estimate-cost", response_model=BacklinkCostEstimate)
def estimate_cost(domain: str = Query(..., description="Root domain to analyze, e.g. example.com")):
    """Pre-flight cost estimate for a backlink snapshot (BYOK)."""
    return _service.estimate_cost(domain)


@router.post("/snapshot", response_model=BacklinkSnapshot)
async def fetch_backlink_snapshot(req: BacklinkResearchRequest):
    """
    Fetch a backlink profile snapshot for a domain.
    Requires confirm_cost=true if DataForSEO credentials are configured (paid call).
    Free-mode generates a realistic demo snapshot at $0.00.
    """
    if not req.target_domain.strip():
        raise HTTPException(status_code=400, detail="target_domain cannot be empty.")

    from neemseo.adapters.dataforseo import DataForSEOAdapter
    adapter = DataForSEOAdapter()
    if adapter.is_configured() and not req.confirm_cost:
        est = _service.estimate_cost(req.target_domain)
        raise HTTPException(
            status_code=402,
            detail={
                "status": "confirmation_required",
                "estimated_cost_usd": est.estimated_cost_usd,
                "explanation": est.explanation,
                "hint": "Set confirm_cost=true to authorize this paid API request.",
            },
        )

    snapshot = await _service.fetch_snapshot(req)
    return snapshot


@router.get("/snapshots", response_model=List[dict])
def list_snapshots(
    domain: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
):
    """List all backlink snapshots, optionally filtered by domain."""
    rows = _service.list_snapshots(domain=domain, limit=limit)
    return [
        {
            "id": r.id,
            "target_domain": r.target_domain,
            "total_backlinks": r.total_backlinks,
            "total_referring_domains": r.total_referring_domains,
            "dofollow_count": r.dofollow_count,
            "nofollow_count": r.nofollow_count,
            "new_links_since_last": r.new_links_since_last,
            "lost_links_since_last": r.lost_links_since_last,
            "cost_usd": r.cost_usd,
            "source": r.source,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/snapshots/{snapshot_id}", response_model=BacklinkSnapshot)
def get_snapshot(snapshot_id: str):
    """Get full backlink snapshot with all referring links and anchor text analysis."""
    snap = _service.get_snapshot(snapshot_id)
    if not snap:
        raise HTTPException(status_code=404, detail="Snapshot not found.")
    return snap


@router.get("/snapshots/{snapshot_id}/export.csv")
def export_snapshot_csv(snapshot_id: str):
    """Export backlink data from a snapshot as a downloadable CSV file."""
    snap = _service.get_snapshot(snapshot_id)
    if not snap:
        raise HTTPException(status_code=404, detail="Snapshot not found.")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Source URL",
        "Source Domain",
        "Target URL",
        "Anchor Text",
        "Link Type",
        "Domain Rank (DR)",
        "Page Rank",
        "New Link",
        "Lost Link",
    ])
    for b in snap.backlinks:
        writer.writerow([
            b.source_url,
            b.source_domain,
            b.target_url,
            b.anchor_text,
            b.link_type.value,
            b.domain_rank,
            b.page_rank,
            "Yes" if b.is_new else "No",
            "Yes" if b.is_lost else "No",
        ])

    filename = f"neemseo_backlinks_{snap.target_domain.replace('.', '_')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/new-lost/{snapshot_id}")
def get_new_and_lost(snapshot_id: str):
    """Return only new and lost backlinks from a snapshot (diff view)."""
    snap = _service.get_snapshot(snapshot_id)
    if not snap:
        raise HTTPException(status_code=404, detail="Snapshot not found.")

    new_links = [b for b in snap.backlinks if b.is_new]
    lost_links = [b for b in snap.backlinks if b.is_lost]

    return {
        "snapshot_id": snapshot_id,
        "target_domain": snap.target_domain,
        "new_count": len(new_links),
        "lost_count": len(lost_links),
        "new_backlinks": [b.model_dump() for b in new_links[:50]],
        "lost_backlinks": [b.model_dump() for b in lost_links[:50]],
    }

