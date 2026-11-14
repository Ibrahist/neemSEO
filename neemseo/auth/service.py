"""
neemSEO Authentication and Team Management Service.
Manages first-user admin setup, teammate invitations, authentication, and MCP client API keys.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any

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
from neemseo.auth.security import (
    hash_password,
    verify_password,
    generate_api_token,
    generate_invite_token,
    create_access_token,
)
from neemseo.db.models import User, Invitation
from neemseo.db.session import SessionLocal
from neemseo.core.config import settings


class AuthService:
    """Core service for user authentication, admin onboarding, and team management."""

    def get_system_status(self) -> SystemStatusResponse:
        """Check if initial setup is required (first visitor becomes admin)."""
        with SessionLocal() as db:
            count = db.query(User).count()
            return SystemStatusResponse(
                setup_required=(count == 0),
                total_users=count,
            )

    def setup_admin(self, req: SetupAdminRequest) -> LoginResponse:
        """
        First visitor creates the admin account.
        Fails if any user already exists in the system.
        """
        with SessionLocal() as db:
            existing = db.query(User).first()
            if existing:
                raise ValueError("Setup has already been completed. Login or request an invitation.")

            user_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc)
            api_token = generate_api_token()
            hashed_pw = hash_password(req.password)

            admin_user = User(
                id=user_id,
                email=req.email.lower().strip(),
                hashed_password=hashed_pw,
                role="admin",
                api_token=api_token,
                is_active=True,
                created_at=now,
            )
            db.add(admin_user)
            db.commit()

            access_token = create_access_token(
                user_id=user_id,
                email=admin_user.email,
                role=admin_user.role,
            )

            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=admin_user.id,
                    email=admin_user.email,
                    role=admin_user.role,
                    api_token=admin_user.api_token,
                    is_active=admin_user.is_active,
                    created_at=admin_user.created_at,
                ),
            )

    def authenticate(self, req: LoginRequest) -> LoginResponse:
        """Authenticate user by email and password, returning signed access token."""
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == req.email.lower().strip()).first()
            if not user or not user.is_active:
                raise ValueError("Invalid email or password.")

            if not verify_password(req.password, user.hashed_password):
                raise ValueError("Invalid email or password.")

            # Ensure API token exists
            if not user.api_token:
                user.api_token = generate_api_token()
                db.commit()

            access_token = create_access_token(
                user_id=user.id,
                email=user.email,
                role=user.role,
            )

            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=user.id,
                    email=user.email,
                    role=user.role,
                    api_token=user.api_token,
                    is_active=user.is_active,
                    created_at=user.created_at,
                ),
            )

    def create_invitation(self, req: CreateInviteRequest, invited_by_id: Optional[str] = None) -> InviteResponse:
        """Admin creates an invitation token for a teammate to join."""
        token = generate_invite_token()
        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=7)
        invite_id = str(uuid.uuid4())

        with SessionLocal() as db:
            existing_user = db.query(User).filter(User.email == req.email.lower().strip()).first()
            if existing_user:
                raise ValueError(f"User {req.email} already has an account.")

            invitation = Invitation(
                id=invite_id,
                email=req.email.lower().strip(),
                token=token,
                role=req.role,
                invited_by_id=invited_by_id,
                is_accepted=False,
                expires_at=expires,
                created_at=now,
            )
            db.add(invitation)
            db.commit()

            invite_url = f"{settings.BASE_URL}/invite?token={token}"

            return InviteResponse(
                id=invite_id,
                email=invitation.email,
                token=token,
                role=invitation.role,
                invite_url=invite_url,
                expires_at=expires,
            )

    def accept_invitation(self, req: AcceptInviteRequest) -> LoginResponse:
        """Teammate accepts invitation and sets password."""
        now = datetime.now(timezone.utc)

        with SessionLocal() as db:
            inv = db.query(Invitation).filter(
                Invitation.token == req.token,
                Invitation.is_accepted == False,
            ).first()

            if not inv:
                raise ValueError("Invalid or expired invitation token.")

            if inv.expires_at.replace(tzinfo=timezone.utc) < now:
                raise ValueError("This invitation link has expired.")

            # Create user
            user_id = str(uuid.uuid4())
            api_token = generate_api_token()
            user = User(
                id=user_id,
                email=inv.email,
                hashed_password=hash_password(req.password),
                role=inv.role,
                api_token=api_token,
                is_active=True,
                created_at=now,
            )
            inv.is_accepted = True
            db.add(user)
            db.commit()

            access_token = create_access_token(
                user_id=user.id,
                email=user.email,
                role=user.role,
            )

            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=user.id,
                    email=user.email,
                    role=user.role,
                    api_token=user.api_token,
                    is_active=user.is_active,
                    created_at=user.created_at,
                ),
            )

    def regenerate_api_token(self, user_id: str) -> str:
        """Generate a new MCP client API key for the user."""
        new_token = generate_api_token()
        with SessionLocal() as db:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found.")
            user.api_token = new_token
            db.commit()
        return new_token

    def list_team(self) -> List[TeamMemberResponse]:
        """List all team members."""
        with SessionLocal() as db:
            users = db.query(User).order_by(User.created_at.asc()).all()
            return [
                TeamMemberResponse(
                    id=u.id,
                    email=u.email,
                    role=u.role,
                    is_active=u.is_active,
                    created_at=u.created_at,
                )
                for u in users
            ]

    def get_user_by_api_token(self, api_token: str) -> Optional[UserResponse]:
        """Lookup active user by MCP API token."""
        with SessionLocal() as db:
            user = db.query(User).filter(
                User.api_token == api_token,
                User.is_active == True,
            ).first()
            if not user:
                return None
            return UserResponse(
                id=user.id,
                email=user.email,
                role=user.role,
                api_token=user.api_token,
                is_active=user.is_active,
                created_at=user.created_at,
            )
