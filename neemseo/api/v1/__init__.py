"""
API v1 Router Package.
"""

from fastapi import APIRouter
from neemseo.api.v1.health import router as health_router
from neemseo.api.v1.audit import router as audit_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(health_router)
api_v1_router.include_router(audit_router)

__all__ = ["api_v1_router"]
