"""
neemSEO Authentication and Team Schemas.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class SetupAdminRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str  # admin, member
    api_token: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class CreateInviteRequest(BaseModel):
    email: EmailStr
    role: str = "member"


class InviteResponse(BaseModel):
    id: str
    email: str
    token: str
    role: str
    invite_url: str
    expires_at: datetime


class AcceptInviteRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8)


class TeamMemberResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None


class SystemStatusResponse(BaseModel):
    setup_required: bool  # True if no users registered yet
    total_users: int
