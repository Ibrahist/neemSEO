"""
Site Crawler API Endpoints.
Provides endpoints for starting crawls, monitoring progress, fetching reports, and diff comparisons.
"""

import csv
import io
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from neemseo.api.deps import get_db
from neemseo.crawler.schemas import CrawlConfig, CrawlProgress, CrawlSummaryReport, CrawlDiffReport
from neemseo.crawler.manager import crawler_manager
from neemseo.crawler.analyzer import CrawlAnalyzer
from neemseo.db.models import Crawl, CrawlPage, CrawlLink

router = APIRouter(prefix="/crawls", tags=["Site Crawler"])


@router.post("", response_model=Dict[str, Any])
def start_site_crawl(config: CrawlConfig):
    """
    Initiate a background crawl for a domain.
    Discovers sitemaps, follows internal link graph, runs on-page audits, and detects broken links.
    """
    crawl_id = crawler_manager.start_crawl(config)
    return {
        "crawl_id": crawl_id,
        "seed_url": config.seed_url,
        "status": "pending",
        "message": f"Crawl initiated for {config.seed_url}. Monitor progress at /api/v1/crawls/{crawl_id}",
    }


@router.get("", response_model=List[Dict[str, Any]])
def list_site_crawls(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List past and active whole-site crawl runs."""
    crawls = db.query(Crawl).order_by(Crawl.created_at.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": c.id,
            "seed_url": c.seed_url,
            "status": c.status,
            "pages_crawled": c.pages_crawled,
            "max_pages": c.max_pages,
            "max_depth": c.max_depth,
            "duration_seconds": c.duration_seconds,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "finished_at": c.finished_at.isoformat() if c.finished_at else None,
        }
        for c in crawls
    ]


@router.get("/compare", response_model=CrawlDiffReport)
def compare_two_crawls(
    base_id: str = Query(..., description="Earlier crawl ID"),
    target_id: str = Query(..., description="Recent crawl ID"),
    db: Session = Depends(get_db),
):
    """
    Compare two crawl runs for the same domain to highlight score changes, new broken links, and duplicate content trends.
    """
    base_crawl = db.query(Crawl).filter(Crawl.id == base_id).first()
    target_crawl = db.query(Crawl).filter(Crawl.id == target_id).first()

    if not base_crawl or not target_crawl:
        raise HTTPException(status_code=404, detail="One or both crawl IDs not found")

    if not base_crawl.report_summary or not target_crawl.report_summary:
        raise HTTPException(status_code=400, detail="Both crawls must be completed to compute comparison diff")

    base_report = CrawlSummaryReport(**base_crawl.report_summary)
    target_report = CrawlSummaryReport(**target_crawl.report_summary)

    diff = CrawlAnalyzer.compare_crawls(base_report, target_report)
    return diff


@router.get("/{crawl_id}", response_model=Dict[str, Any])
def get_crawl_status(
    crawl_id: str,
    db: Session = Depends(get_db),
):
    """Get live progress and state of a crawl."""
    live_progress = crawler_manager.get_progress(crawl_id)
    if live_progress:
        return live_progress.model_dump()

    crawl_obj = db.query(Crawl).filter(Crawl.id == crawl_id).first()
    if not crawl_obj:
        raise HTTPException(status_code=404, detail="Crawl not found")

    return {
        "crawl_id": crawl_obj.id,
        "seed_url": crawl_obj.seed_url,
        "status": crawl_obj.status,
        "pages_crawled": crawl_obj.pages_crawled,
        "max_pages": crawl_obj.max_pages,
        "max_depth": crawl_obj.max_depth,
        "duration_seconds": crawl_obj.duration_seconds,
        "created_at": crawl_obj.created_at.isoformat() if crawl_obj.created_at else None,
        "finished_at": crawl_obj.finished_at.isoformat() if crawl_obj.finished_at else None,
    }


@router.post("/{crawl_id}/cancel")
def cancel_running_crawl(crawl_id: str):
    """Cancel an ongoing crawl."""
    success = crawler_manager.cancel_crawl(crawl_id)
    if not success:
        raise HTTPException(status_code=400, detail="Crawl is not running or already finished")
    return {"status": "cancelled", "crawl_id": crawl_id}


@router.get("/{crawl_id}/report", response_model=Dict[str, Any])
def get_crawl_summary_report(
    crawl_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve full post-crawl report including broken links, duplicate titles/descriptions,
    orphan pages, and click depth metrics.
    """
    crawl_obj = db.query(Crawl).filter(Crawl.id == crawl_id).first()
    if not crawl_obj:
        raise HTTPException(status_code=404, detail="Crawl not found")

    if not crawl_obj.report_summary:
        return {
            "crawl_id": crawl_id,
            "status": crawl_obj.status,
            "message": "Crawl report is being generated or in progress",
            "pages_crawled": crawl_obj.pages_crawled,
        }

    return crawl_obj.report_summary


@router.get("/{crawl_id}/pages", response_model=List[Dict[str, Any]])
def list_crawl_pages(
    crawl_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_code: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """List pages crawled in a specific crawl run."""
    query = db.query(CrawlPage).filter(CrawlPage.crawl_id == crawl_id)
    if status_code:
        query = query.filter(CrawlPage.status_code == status_code)

    pages = query.order_by(CrawlPage.depth.asc()).offset(offset).limit(limit).all()
    return [
        {
            "id": p.id,
            "url": p.url,
            "status_code": p.status_code,
            "depth": p.depth,
            "title": p.title,
            "overall_score": p.overall_score,
            "word_count": p.word_count,
            "is_noindex": p.is_noindex,
            "is_orphan": p.is_orphan,
            "load_time_ms": p.load_time_ms,
        }
        for p in pages
    ]


@router.get("/{crawl_id}/broken-links/csv")
def export_broken_links_csv(
    crawl_id: str,
    db: Session = Depends(get_db),
):
    """Download CSV export of broken links found during the crawl."""
    crawl_obj = db.query(Crawl).filter(Crawl.id == crawl_id).first()
    if not crawl_obj:
        raise HTTPException(status_code=404, detail="Crawl not found")

    broken_links = db.query(CrawlLink).filter(CrawlLink.crawl_id == crawl_id, CrawlLink.is_broken == True).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Target Broken URL", "Source Page URL", "Anchor Text", "HTTP Status", "Internal Link"])

    for b in broken_links:
        writer.writerow([b.target_url, b.source_url, b.anchor_text, b.status_code, b.is_internal])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=neemseo-broken-links-{crawl_id}.csv"},
    )
