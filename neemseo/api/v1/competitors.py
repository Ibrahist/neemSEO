"""
neemSEO Competitor Insights REST API Endpoints.
Performs keyword gap and backlink gap analysis between a domain and its competitors.
"""

from fastapi import APIRouter, HTTPException
from neemseo.competitors.schemas import (
    CompetitorGapRequest,
    CompetitorComparisonReport,
)
from neemseo.competitors.service import CompetitorService

router = APIRouter(prefix="/competitors", tags=["Competitor Insights"])
_service = CompetitorService()


@router.post("/gap-analysis", response_model=CompetitorComparisonReport)
async def analyze_competitor_gaps(req: CompetitorGapRequest):
    """
    Compare target domain with 1 to 5 competitors to uncover missing keywords,
    ranking gaps, and unacquired backlink opportunities.
    """
    if not req.target_domain.strip():
        raise HTTPException(status_code=400, detail="Target domain is required.")
    if not req.competitors:
        raise HTTPException(status_code=400, detail="At least one competitor domain is required.")

    report = await _service.analyze_gaps(req)
    return report
