"""
neemSEO AI Visibility API Endpoints (GEO - Generative Engine Optimization).
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from neemseo.aivisibility.service import AIVisibilityService
from neemseo.aivisibility.schemas import (
    AIVisibilityRequest,
    AIVisibilityResult,
    AIVisibilityHistoryItem,
)
from neemseo.api.deps import get_optional_user
from neemseo.db.models import User

router = APIRouter(prefix="/ai-visibility", tags=["AI Visibility (GEO)"])
ai_visibility_service = AIVisibilityService()


@router.post("/audit", response_model=AIVisibilityResult, status_code=status.HTTP_201_CREATED)
def run_ai_visibility_audit(
    req: AIVisibilityRequest,
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Run an AI Visibility audit for a domain and brand across AI search engines
    (ChatGPT, Claude, Perplexity, Gemini, Google AI Overview).
    """
    user_id = current_user.id if current_user else None
    return ai_visibility_service.audit_visibility(req, user_id=user_id)


@router.get("/history", response_model=List[AIVisibilityHistoryItem])
def get_ai_visibility_history(
    domain: Optional[str] = Query(None, description="Filter history by target domain"),
    limit: int = Query(10, ge=1, le=100, description="Max history records to return"),
    _current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve historical AI visibility audits and score trends."""
    if not isinstance(limit, int):
        limit = 10
    return ai_visibility_service.get_history(domain=domain, limit=limit)


@router.get("/{run_id}", response_model=AIVisibilityResult)
def get_ai_visibility_run(
    run_id: str,
    _current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve full audit breakdown and optimization tips for a specific run."""
    result = ai_visibility_service.get_run(run_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"AI Visibility run '{run_id}' not found.",
        )
    return result
