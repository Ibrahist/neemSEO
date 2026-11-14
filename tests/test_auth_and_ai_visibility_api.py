"""
API Integration tests for neemSEO Auth & AI Visibility endpoints.
"""

from fastapi.testclient import TestClient
from backend.main import app
from neemseo.db.session import init_db, SessionLocal
from neemseo.db.models import User, Invitation, AIVisibilityRun

client = TestClient(app)


def test_auth_and_ai_visibility_api_flow():
    init_db()
    with SessionLocal() as db:
        db.query(Invitation).delete()
        db.query(User).delete()
        db.query(AIVisibilityRun).delete()
        db.commit()

    # 1. System status when fresh
    res = client.get("/api/v1/auth/system-status")
    assert res.status_code == 200
    assert res.json()["setup_required"] is True

    # 2. Setup first admin
    res = client.post("/api/v1/auth/setup", json={
        "email": "owner@neemseo.com",
        "password": "Password1234!",
    })
    assert res.status_code == 201
    data = res.json()
    admin_token = data["access_token"]
    admin_api_key = data["user"]["api_token"]
    assert data["user"]["role"] == "admin"
    assert admin_api_key.startswith("neemseo_live_")

    # Second setup must fail (400)
    res_second = client.post("/api/v1/auth/setup", json={
        "email": "hacker@neemseo.com",
        "password": "Password1234!",
    })
    assert res_second.status_code == 400

    # 3. Check /me with Bearer token
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "owner@neemseo.com"

    # Check /me with X-API-Key
    res_me_key = client.get("/api/v1/auth/me", headers={"X-API-Key": admin_api_key})
    assert res_me_key.status_code == 200
    assert res_me_key.json()["email"] == "owner@neemseo.com"

    # 4. Admin invites a member
    res_inv = client.post(
        "/api/v1/auth/invite",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"email": "teammate@neemseo.com", "role": "member"},
    )
    assert res_inv.status_code == 201
    invite_token = res_inv.json()["token"]

    # 5. Teammate accepts invitation
    res_accept = client.post("/api/v1/auth/accept-invite", json={
        "token": invite_token,
        "password": "TeammatePassword123!",
    })
    assert res_accept.status_code == 200
    member_token = res_accept.json()["access_token"]
    assert res_accept.json()["user"]["role"] == "member"

    # 6. List team
    res_team = client.get("/api/v1/auth/team", headers={"Authorization": f"Bearer {member_token}"})
    assert res_team.status_code == 200
    assert len(res_team.json()) == 2

    # 7. Non-admin cannot invite
    res_denied = client.post(
        "/api/v1/auth/invite",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"email": "other@neemseo.com", "role": "member"},
    )
    assert res_denied.status_code == 403

    # 8. AI Visibility Audit API
    res_geo = client.post(
        "/api/v1/ai-visibility/audit",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"domain": "neemseo.com", "brand_name": "neemSEO"},
    )
    assert res_geo.status_code == 201
    geo_data = res_geo.json()
    assert geo_data["domain"] == "neemseo.com"
    assert 0 <= geo_data["overall_score"] <= 100
    assert len(geo_data["engine_breakdown"]) == 5
    run_id = geo_data["id"]

    # 9. AI Visibility History API
    res_hist = client.get("/api/v1/ai-visibility/history", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_hist.status_code == 200
    assert len(res_hist.json()) >= 1

    # 10. AI Visibility Run Detail API
    res_run = client.get(f"/api/v1/ai-visibility/{run_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_run.status_code == 200
    assert res_run.json()["id"] == run_id
