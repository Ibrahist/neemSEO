"""
neemSEO Google Search Console API Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Query, Depends
from neemseo.adapters.search_console import GoogleSearchConsoleAdapter, SearchConsoleReport
from neemseo.api.deps import get_optional_user
from neemseo.db.models import User

router = APIRouter(prefix="/search-console", tags=["Google Search Console (GSC)"])
gsc_adapter = GoogleSearchConsoleAdapter()


@router.get("/performance", response_model=SearchConsoleReport)
async def get_gsc_performance(
    site_url: str = Query(..., description="Target verified site URL or domain"),
    days: int = Query(30, ge=1, le=365, description="Number of past days to query"),
    limit: int = Query(50, ge=1, le=500, description="Max queries to return"),
    _user: Optional[User] = Depends(get_optional_user),
):
    """
    Retrieve real search queries, organic impressions, clicks, CTR, and average ranking positions.
    Zero third-party API cost (free Google integration).
    """
    if not isinstance(days, int):
        days = 30
    if not isinstance(limit, int):
        limit = 50
    return await gsc_adapter.get_performance(site_url=site_url, days=days, limit=limit)
