"""
FastAPI Dependencies for neemSEO.
Handles database sessions, user authentication, and admin authorization.
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from sqlalchemy.orm import Session

from neemseo.db.session import SessionLocal
from neemseo.db.models import User
from neemseo.auth.security import verify_access_token

security_bearer = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    api_key: Optional[str] = Security(api_key_header),
    db: Session = Depends(get_db),
) -> User:
    """
    Authenticate user via Bearer JWT token or X-API-Key header.
    Returns the authenticated User model.
    """
    token = None
    if auth_header and auth_header.credentials:
        token = auth_header.credentials
    elif api_key:
        token = api_key

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Try MCP / API Token lookup (e.g. neemseo_live_...)
    if token.startswith("neemseo_live_"):
        user = db.query(User).filter(User.api_token == token, User.is_active == True).first()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Try Bearer access token
    payload = verify_access_token(token)
    if not payload or "sub" not in payload:
        # Also check if token is stored directly as an api_token
        user = db.query(User).filter(User.api_token == token, User.is_active == True).first()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure the authenticated user has the 'admin' role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required for this operation.",
        )
    return current_user


def get_optional_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    api_key: Optional[str] = Security(api_key_header),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Retrieve user if token provided, otherwise returns None without 401."""
    try:
        return get_current_user(auth_header=auth_header, api_key=api_key, db=db)
    except HTTPException:
        return None
