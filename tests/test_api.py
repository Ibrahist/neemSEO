"""
API Endpoint tests testing handlers directly without external network latency.
"""

from neemseo.api.v1.health import health_check
from neemseo.api.v1.bot_page import bot_info_page
from neemseo.api.v1.audit import list_rules, list_audits
from neemseo.api.web_dashboard import index_page
from neemseo.db.session import SessionLocal, init_db

init_db()


def test_health_check_handler():
    data = health_check()
    assert data["product"] == "neemSEO"
    assert data["status"] == "ok"
    assert "version" in data


def test_bot_page_handler():
    resp = bot_info_page()
    assert resp.status_code == 200
    assert "neemSEO-Bot" in resp.body.decode("utf-8")
    assert "robots.txt" in resp.body.decode("utf-8")


def test_rules_meta_handler():
    data = list_rules()
    assert isinstance(data, list)
    assert len(data) >= 8
    rule_ids = [r["rule_id"] for r in data]
    assert "title_optimization" in rule_ids
    assert "heading_structure" in rule_ids


def test_web_dashboard_handler():
    resp = index_page()
    assert resp.status_code == 200
    content = resp.body.decode("utf-8")
    assert "neemSEO" in content
    assert "Prioritized Action Items" in content


def test_list_audits_handler():
    with SessionLocal() as db:
        audits = list_audits(limit=10, offset=0, db=db)
        assert isinstance(audits, list)
