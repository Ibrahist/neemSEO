"""
Health Check and Version API Endpoint.
"""

from fastapi import APIRouter
from neemseo import __version__
from neemseo.core.config import settings
from neemseo.core.cost_tracker import cost_tracker

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "product": "neemSEO",
        "version": __version__,
        "environment": settings.ENV,
        "database": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql",
        "user_agent": settings.USER_AGENT,
        "spend_summary": cost_tracker.get_summary(),
    }
