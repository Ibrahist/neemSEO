"""
API v1 Router Package.
"""

from fastapi import APIRouter
from neemseo.api.v1.health import router as health_router
from neemseo.api.v1.auth import router as auth_router
from neemseo.api.v1.audit import router as audit_router
from neemseo.api.v1.crawls import router as crawls_router
from neemseo.api.v1.keywords import router as keywords_router
from neemseo.api.v1.rank_tracker import router as rank_tracker_router
from neemseo.api.v1.backlinks import router as backlinks_router
from neemseo.api.v1.competitors import router as competitors_router
from neemseo.api.v1.ai_visibility import router as ai_visibility_router
from neemseo.api.v1.search_console import router as search_console_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(crawls_router)
api_v1_router.include_router(keywords_router)
api_v1_router.include_router(rank_tracker_router)
api_v1_router.include_router(backlinks_router)
api_v1_router.include_router(competitors_router)
api_v1_router.include_router(ai_visibility_router)
api_v1_router.include_router(search_console_router)

__all__ = ["api_v1_router"]
