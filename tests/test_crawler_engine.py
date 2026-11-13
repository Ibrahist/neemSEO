"""
Integration tests for the Site Crawler Engine.
"""

import asyncio
from neemseo.crawler.schemas import CrawlConfig, CrawlStatus
from neemseo.crawler.engine import SiteCrawler
from neemseo.core.fetcher import FetchResult
from neemseo.db.session import init_db

init_db()


def test_crawler_engine_mock_run():
    # Mock HTML pages
    home_html = """
    <html><head><title>Home</title></head>
    <body>
      <h1>Home Page</h1>
      <a href="/pricing">Pricing</a>
      <a href="/about">About</a>
      <a href="https://external-domain.com">External</a>
    </body></html>
    """

    pricing_html = """
    <html><head><title>Pricing</title></head>
    <body>
      <h1>Pricing Details</h1>
      <a href="/">Back Home</a>
      <a href="/pricing/enterprise">Enterprise</a>
    </body></html>
    """

    about_html = """
    <html><head><title>About</title></head>
    <body>
      <h1>About Us</h1>
      <a href="/broken-link">Broken</a>
    </body></html>
    """

    async def mock_fetch(url: str, **kwargs):
        norm_url = url.rstrip("/")
        if norm_url in ("https://example.com", "https://example.com/"):
            return FetchResult(url="https://example.com/", status_code=200, html=home_html)
        elif "pricing" in norm_url and "enterprise" not in norm_url:
            return FetchResult(url="https://example.com/pricing", status_code=200, html=pricing_html)
        elif "about" in norm_url:
            return FetchResult(url="https://example.com/about", status_code=200, html=about_html)
        elif "broken-link" in norm_url:
            return FetchResult(url="https://example.com/broken-link", status_code=404, html="Not found")
        return FetchResult(url=url, status_code=200, html="<html><body><h1>Page</h1></body></html>")

    config = CrawlConfig(
        seed_url="https://example.com",
        max_pages=5,
        max_depth=2,
        check_sitemap=False,
        respect_robots=False,
        delay_seconds=0.0,
    )
    crawler = SiteCrawler(config=config, crawl_id="mock-crawl-test", save_to_db=False)
    crawler.fetcher.fetch = mock_fetch

    report = asyncio.run(crawler.crawl())

    assert report.status == CrawlStatus.COMPLETED
    assert report.total_pages_crawled >= 3
    assert report.total_links_found >= 3
    # Ensure external link was recorded but not enqueued beyond boundary
    visited_hosts = {u for u in crawler.visited_urls}
    assert not any("external-domain.com" in u for u in visited_hosts)


def test_crawler_cancellation():
    config = CrawlConfig(
        seed_url="https://example.com",
        max_pages=10,
        delay_seconds=0.0,
    )
    crawler = SiteCrawler(config=config, crawl_id="cancel-test", save_to_db=False)
    crawler.cancel()
    assert crawler._cancelled is True
    assert crawler.status == CrawlStatus.CANCELLED
