"""
Tests for Google Search Console Adapter and Endpoints.
"""

import asyncio
from fastapi.testclient import TestClient
from backend.main import app
from neemseo.adapters.search_console import GoogleSearchConsoleAdapter

client = TestClient(app)


def test_gsc_adapter_simulated_flow():
    adapter = GoogleSearchConsoleAdapter()
    report = asyncio.run(adapter.get_performance(site_url="https://neemseo.com", days=30, limit=15))

    assert report.site_url == "https://neemseo.com"
    assert report.total_clicks > 0
    assert report.total_impressions > 0
    assert 0.0 <= report.average_ctr <= 100.0
    assert 1.0 <= report.average_position <= 100.0
    assert len(report.queries) == 15

    top_q = report.queries[0]
    assert top_q.clicks >= 0
    assert top_q.impressions >= top_q.clicks
    assert top_q.ctr >= 0.0


def test_gsc_api_endpoint():
    res = client.get("/api/v1/search-console/performance?site_url=neemseo.com&days=14&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert data["site_url"] == "neemseo.com"
    assert data["total_clicks"] > 0
    assert len(data["queries"]) == 10
