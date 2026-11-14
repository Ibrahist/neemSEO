"""
Tests for neemSEO Authentication, Onboarding, and Team Access.
"""

import pytest
import uuid
from datetime import datetime, timezone
from neemseo.db.session import init_db, SessionLocal
from neemseo.db.models import User, Invitation
from neemseo.auth.security import (
    hash_password,
    verify_password,
    generate_api_token,
    generate_invite_token,
    create_access_token,
    verify_access_token,
)
from neemseo.auth.service import AuthService
from neemseo.auth.schemas import (
    SetupAdminRequest,
    LoginRequest,
    CreateInviteRequest,
    AcceptInviteRequest,
)


@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()
    with SessionLocal() as db:
        db.query(Invitation).delete()
        db.query(User).delete()
        db.commit()
    yield
    with SessionLocal() as db:
        db.query(Invitation).delete()
        db.query(User).delete()
        db.commit()


def test_password_hashing():
    pw = "supersecret123"
    hashed = hash_password(pw)
    assert hashed != pw
    assert "$" in hashed
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_api_token_format():
    token = generate_api_token()
    assert token.startswith("neemseo_live_")
    assert len(token) > 30


def test_access_token_creation_and_verification():
    uid = "test-user-123"
    email = "admin@neemseo.com"
    role = "admin"
    token = create_access_token(uid, email, role, expires_in_seconds=3600)
    assert "." in token

    payload = verify_access_token(token)
    assert payload is not None
    assert payload["sub"] == uid
    assert payload["email"] == email
    assert payload["role"] == role

    # Test tampering
    tampered = token[:-4] + "abcd"
    assert verify_access_token(tampered) is None


def test_first_visitor_admin_setup_flow():
    svc = AuthService()

    # System status before setup
    status = svc.get_system_status()
    assert status.setup_required is True
    assert status.total_users == 0

    # First user sets up admin
    res = svc.setup_admin(SetupAdminRequest(
        email="founder@neemseo.com",
        password="ComplexPassword123!",
    ))
    assert res.user.role == "admin"
    assert res.user.email == "founder@neemseo.com"
    assert res.user.api_token.startswith("neemseo_live_")
    assert res.access_token is not None

    # Status after setup
    status_after = svc.get_system_status()
    assert status_after.setup_required is False
    assert status_after.total_users == 1

    # Second visitor attempt to setup admin must fail
    with pytest.raises(ValueError) as excinfo:
        svc.setup_admin(SetupAdminRequest(
            email="intruder@neemseo.com",
            password="AnotherPassword123!",
        ))
    assert "already been completed" in str(excinfo.value)


def test_user_login():
    svc = AuthService()
    svc.setup_admin(SetupAdminRequest(
        email="admin@neemseo.com",
        password="SecurePassword456!",
    ))

    # Successful login
    login_res = svc.authenticate(LoginRequest(
        email="admin@neemseo.com",
        password="SecurePassword456!",
    ))
    assert login_res.access_token is not None
    assert login_res.user.email == "admin@neemseo.com"

    # Failed login with wrong password
    with pytest.raises(ValueError) as exc:
        svc.authenticate(LoginRequest(
            email="admin@neemseo.com",
            password="WrongPassword!",
        ))
    assert "Invalid email or password" in str(exc.value)

    # Failed login with nonexistent email
    with pytest.raises(ValueError) as exc:
        svc.authenticate(LoginRequest(
            email="unknown@neemseo.com",
            password="Password123!",
        ))
    assert "Invalid email or password" in str(exc.value)


def test_invitation_and_teammate_onboarding():
    svc = AuthService()
    admin_res = svc.setup_admin(SetupAdminRequest(
        email="admin@neemseo.com",
        password="AdminPassword123!",
    ))

    # Admin invites teammate
    invite = svc.create_invitation(
        CreateInviteRequest(email="engineer@neemseo.com", role="member"),
        invited_by_id=admin_res.user.id,
    )
    assert invite.email == "engineer@neemseo.com"
    assert invite.role == "member"
    assert invite.token is not None
    assert "token=" in invite.invite_url

    # Cannot invite existing user
    with pytest.raises(ValueError):
        svc.create_invitation(CreateInviteRequest(email="admin@neemseo.com", role="member"))

    # Teammate accepts invitation
    member_res = svc.accept_invitation(AcceptInviteRequest(
        token=invite.token,
        password="MemberPassword789!",
    ))
    assert member_res.user.email == "engineer@neemseo.com"
    assert member_res.user.role == "member"
    assert member_res.user.api_token.startswith("neemseo_live_")

    # Re-using the same invite token fails
    with pytest.raises(ValueError) as exc:
        svc.accept_invitation(AcceptInviteRequest(
            token=invite.token,
            password="AnotherPassword!",
        ))
    assert "Invalid or expired" in str(exc.value)

    # List team shows both users
    team = svc.list_team()
    assert len(team) == 2
    emails = [m.email for m in team]
    assert "admin@neemseo.com" in emails
    assert "engineer@neemseo.com" in emails


def test_regenerate_api_token():
    svc = AuthService()
    admin_res = svc.setup_admin(SetupAdminRequest(
        email="admin@neemseo.com",
        password="AdminPassword123!",
    ))
    old_token = admin_res.user.api_token

    new_token = svc.regenerate_api_token(admin_res.user.id)
    assert new_token != old_token
    assert new_token.startswith("neemseo_live_")

    # Lookup by new token works
    user = svc.get_user_by_api_token(new_token)
    assert user is not None
    assert user.email == "admin@neemseo.com"

    # Lookup by old token returns None
    assert svc.get_user_by_api_token(old_token) is None
