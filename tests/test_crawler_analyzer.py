"""
Unit tests for the Crawl Post-Analysis and Diff Engine.
"""

from neemseo.crawler.analyzer import CrawlAnalyzer
from neemseo.crawler.schemas import CrawlStatus


def test_analyzer_broken_links_and_duplicates():
    pages = [
        {
            "url": "https://example.com/",
            "depth": 0,
            "title": "Example Homepage",
            "meta_description": "Welcome to our website.",
            "overall_score": 90,
        },
        {
            "url": "https://example.com/about",
            "depth": 1,
            "title": "Example Homepage",  # Duplicate title
            "meta_description": "Welcome to our website.",  # Duplicate description
            "overall_score": 85,
        },
        {
            "url": "https://example.com/contact",
            "depth": 1,
            "title": "Contact Us",
            "meta_description": "Get in touch with our team.",
            "overall_score": 95,
        },
    ]

    links = [
        # Internal link from home to about
        {
            "source_url": "https://example.com/",
            "target_url": "https://example.com/about",
            "status_code": 200,
            "is_internal": True,
            "anchor_text": "About",
        },
        # Broken link from about to dead page
        {
            "source_url": "https://example.com/about",
            "target_url": "https://example.com/missing-page",
            "status_code": 404,
            "is_internal": True,
            "anchor_text": "Dead Link",
        },
    ]

    # Sitemap containing contact and an orphan URL
    sitemap = [
        "https://example.com/",
        "https://example.com/about",
        "https://example.com/contact",
        "https://example.com/orphan-article",
    ]

    report = CrawlAnalyzer.analyze(
        crawl_id="test-crawl-1",
        seed_url="https://example.com/",
        pages=pages,
        links=links,
        sitemap_urls=sitemap,
        duration_seconds=2.5,
    )

    # 1. Broken links verification
    assert report.broken_links_count == 1
    assert report.broken_links[0].target_url == "https://example.com/missing-page"
    assert report.broken_links[0].status_code == 404

    # 2. Duplicate titles verification
    assert len(report.duplicate_titles) == 1
    assert report.duplicate_titles[0].content == "Example Homepage"
    assert report.duplicate_titles[0].count == 2

    # 3. Orphan pages verification
    orphan_urls = [o.url for o in report.orphan_pages]
    assert "https://example.com/orphan-article" in orphan_urls

    # 4. Depth distribution
    assert report.depth_distribution[0] == 1
    assert report.depth_distribution[1] == 2


def test_compare_crawls():
    pages_base = [
        {"url": "https://example.com/", "depth": 0, "overall_score": 75},
        {"url": "https://example.com/p1", "depth": 1, "overall_score": 75},
    ]
    links_base = [
        {"source_url": "https://example.com/", "target_url": "https://example.com/404-old", "status_code": 404, "is_internal": True},
    ]
    rep_base = CrawlAnalyzer.analyze("crawl-1", "https://example.com/", pages_base, links_base)

    # Target crawl (fixed the broken link, added 1 page, higher score)
    pages_target = [
        {"url": "https://example.com/", "depth": 0, "overall_score": 92},
        {"url": "https://example.com/p1", "depth": 1, "overall_score": 92},
        {"url": "https://example.com/p2", "depth": 1, "overall_score": 92},
    ]
    links_target = [
        {"source_url": "https://example.com/", "target_url": "https://example.com/p2", "status_code": 200, "is_internal": True},
    ]
    rep_target = CrawlAnalyzer.analyze("crawl-2", "https://example.com/", pages_target, links_target)

    diff = CrawlAnalyzer.compare_crawls(rep_base, rep_target)

    assert diff.score_change > 0  # Score improved
    assert diff.pages_change == 1
    assert len(diff.resolved_broken_links) == 1
    assert diff.resolved_broken_links[0].target_url == "https://example.com/404-old"
    assert len(diff.new_broken_links) == 0

