"""
Tests for Keyword Clustering Engine.
"""

from neemseo.keywords.clustering import KeywordClusterer
from neemseo.keywords.schemas import KeywordItem, SearchIntent


def test_keyword_clustering_by_theme():
    raw_keywords = [
        KeywordItem(keyword="best seo tools", search_volume=5000, difficulty=45, intent=SearchIntent.COMMERCIAL, priority_score=75),
        KeywordItem(keyword="free seo tools for beginners", search_volume=3000, difficulty=30, intent=SearchIntent.COMMERCIAL, priority_score=80),
        KeywordItem(keyword="seo tools comparison", search_volume=1200, difficulty=40, intent=SearchIntent.COMMERCIAL, priority_score=70),
        KeywordItem(keyword="python web scraping guide", search_volume=2000, difficulty=35, intent=SearchIntent.INFORMATIONAL, priority_score=65),
        KeywordItem(keyword="how to web scraping in python", search_volume=1500, difficulty=25, intent=SearchIntent.INFORMATIONAL, priority_score=72),
        KeywordItem(keyword="buy running shoes online", search_volume=8000, difficulty=60, intent=SearchIntent.TRANSACTIONAL, priority_score=85),
    ]

    clusters = KeywordClusterer.cluster(raw_keywords, min_cluster_size=2)

    assert len(clusters) >= 2

    cluster_names = [c.cluster_name for c in clusters]
    # Check that "Seo Tools" cluster was formed
    assert any("Seo Tools" in name for name in cluster_names)
    # Check that "Web Scraping" or "Python" cluster was formed
    assert any("Scraping" in name or "Python" in name for name in cluster_names)

    # Check metrics on clusters
    seo_cluster = next(c for c in clusters if "Seo Tools" in c.cluster_name)
    assert seo_cluster.keyword_count == 3
    assert seo_cluster.total_volume == 5000 + 3000 + 1200
    assert seo_cluster.dominant_intent == SearchIntent.COMMERCIAL

