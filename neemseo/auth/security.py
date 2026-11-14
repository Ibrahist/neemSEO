"""
neemSEO Cryptographic and Security Utilities.
Handles secure PBKDF2 password hashing, token generation, and MCP API keys.
"""

import hashlib
import hmac
import secrets
import json
import base64
import time
from typing import Optional, Dict, Any
from neemseo.core.config import settings


def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with a cryptographically secure random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000,
    )
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored salt$hash."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 2:
            return False
        salt, expected_hash = parts
        key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            100000,
        )
        return hmac.compare_digest(key.hex(), expected_hash)
    except Exception:
        return False


def generate_api_token() -> str:
    """Generate a persistent API key for MCP clients (Claude Code, ChatGPT, Codex, Cursor)."""
    return f"neemseo_live_{secrets.token_hex(24)}"


def generate_invite_token() -> str:
    """Generate a high-entropy URL-safe invitation token."""
    return secrets.token_urlsafe(32)


def create_access_token(user_id: str, email: str, role: str, expires_in_seconds: int = 86400 * 7) -> str:
    """
    Creates a tamper-proof HMAC-SHA256 signed bearer access token.
    Contains user_id, email, role, and expiration timestamp.
    """
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": int(time.time()) + expires_in_seconds,
        "iat": int(time.time()),
    }
    raw_json = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(raw_json).decode("utf-8").rstrip("=")
    
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return f"{payload_b64}.{signature}"


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Validates an access token's HMAC signature and expiration."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, signature = parts
        
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode("utf-8"),
            payload_b64.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_sig, signature):
            return None
            
        # Add padding back for base64 decode
        padding = "=" * (4 - (len(payload_b64) % 4)) if (len(payload_b64) % 4) != 0 else ""
        raw_json = base64.urlsafe_b64decode(payload_b64 + padding).decode("utf-8")
        payload = json.loads(raw_json)
        
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None
