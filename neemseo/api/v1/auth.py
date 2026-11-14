"""
neemSEO Authentication and Team API Endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from neemseo.auth.service import AuthService
from neemseo.auth.schemas import (
    SetupAdminRequest,
    LoginRequest,
    UserResponse,
    LoginResponse,
    CreateInviteRequest,
    InviteResponse,
    AcceptInviteRequest,
    TeamMemberResponse,
    SystemStatusResponse,
)
from neemseo.api.deps import get_current_user, get_current_admin
from neemseo.db.models import User

router = APIRouter(prefix="/auth", tags=["Authentication & Team"])
auth_service = AuthService()


@router.get("/system-status", response_model=SystemStatusResponse)
def get_system_status():
    """
    Check if initial setup is required.
    Returns True if no users exist in the system yet.
    """
    return auth_service.get_system_status()


@router.post("/setup", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def setup_first_admin(req: SetupAdminRequest):
    """
    First visitor onboarding: create the primary admin account.
    Fails if the system has already been initialized.
    """
    try:
        return auth_service.setup_admin(req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    """Authenticate with email and password to receive bearer token."""
    try:
        return auth_service.authenticate(req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Retrieve profile and MCP API key of the authenticated user."""
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        api_token=user.api_token,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.post("/api-token/regenerate")
def regenerate_api_token(user: User = Depends(get_current_user)):
    """Regenerate MCP client API key for the authenticated user."""
    new_token = auth_service.regenerate_api_token(user.id)
    return {"message": "API token regenerated successfully", "api_token": new_token}


@router.post("/invite", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
def create_invite(
    req: CreateInviteRequest,
    admin: User = Depends(get_current_admin),
):
    """Admin invites a teammate to join neemSEO."""
    try:
        return auth_service.create_invitation(req, invited_by_id=admin.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/accept-invite", response_model=LoginResponse)
def accept_invite(req: AcceptInviteRequest):
    """Accept team invitation link and configure account password."""
    try:
        return auth_service.accept_invitation(req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/team", response_model=List[TeamMemberResponse])
def list_team_members(_user: User = Depends(get_current_user)):
    """List all registered team members."""
    return auth_service.list_team()
