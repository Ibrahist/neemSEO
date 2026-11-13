"""
On-Page Audit API Endpoints.
"""

import csv
import io
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from neemseo.api.deps import get_db
from neemseo.core.auditor import OnPageAuditor
from neemseo.core.scoring import AuditReport
from neemseo.rules.registry import registry
from neemseo.db.models import AuditRun, AuditIssue

router = APIRouter(prefix="/audit", tags=["On-Page SEO Auditor"])


class AuditRequest(BaseModel):
    url: str
    keyword: Optional[str] = None
    check_pagespeed: bool = False


@router.post("", response_model=AuditReport)
async def run_audit(
    payload: AuditRequest,
    db: Session = Depends(get_db),
):
    """
    Run an on-page SEO audit on a single URL.
    Evaluates title, meta description, heading structure, images, canonical, robots,
    link profile, and content depth with optional target keyword checking.
    """
    auditor = OnPageAuditor()
    report = await auditor.audit_url(
        url=payload.url,
        keyword=payload.keyword,
        check_pagespeed=payload.check_pagespeed,
        db=db,
    )
    return report


@router.get("", response_model=List[Dict[str, Any]])
def list_audits(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    List past audit runs ordered by most recent.
    """
    runs = db.query(AuditRun).order_by(AuditRun.created_at.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": r.id,
            "url": r.url,
            "target_keyword": r.target_keyword,
            "status_code": r.status_code,
            "overall_score": r.overall_score,
            "grade": r.grade,
            "word_count": r.word_count,
            "response_time_ms": r.response_time_ms,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in runs
    ]


@router.get("/{audit_id}", response_model=Dict[str, Any])
def get_audit(
    audit_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve full details for an audit run by ID.
    """
    run = db.query(AuditRun).filter(AuditRun.id == audit_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Audit run not found")

    issues = db.query(AuditIssue).filter(AuditIssue.audit_run_id == audit_id).order_by(AuditIssue.impact_score.desc()).all()

    return {
        "id": run.id,
        "url": run.url,
        "target_keyword": run.target_keyword,
        "status_code": run.status_code,
        "overall_score": run.overall_score,
        "grade": run.grade,
        "response_time_ms": run.response_time_ms,
        "word_count": run.word_count,
        "page_summary": run.page_summary,
        "core_web_vitals": run.core_web_vitals,
        "category_scores": run.category_scores,
        "created_at": run.created_at.isoformat() if run.created_at else None,
        "issues": [
            {
                "rule_id": i.rule_id,
                "status": i.status,
                "category": i.category,
                "title": i.title,
                "message": i.message,
                "recommendation": i.recommendation,
                "impact_score": i.impact_score,
                "context": i.context_data,
            }
            for i in issues
        ],
    }


@router.get("/{audit_id}/csv")
def export_audit_csv(
    audit_id: str,
    db: Session = Depends(get_db),
):
    """
    Export the prioritized fix list for an audit as a CSV file.
    """
    run = db.query(AuditRun).filter(AuditRun.id == audit_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Audit run not found")

    issues = db.query(AuditIssue).filter(AuditIssue.audit_run_id == audit_id).order_by(AuditIssue.impact_score.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Impact", "Status", "Category", "Rule ID", "Title", "Message", "Recommendation"])

    for i in issues:
        writer.writerow([
            i.impact_score,
            i.status,
            i.category,
            i.rule_id,
            i.title,
            i.message,
            i.recommendation,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=neemseo-audit-{audit_id}.csv"},
    )


@router.get("/meta/rules", response_model=List[Dict[str, Any]])
def list_rules():
    """
    List all registered check rules and their impact weights.
    """
    return registry.list_rules()
