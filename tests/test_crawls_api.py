"""
API tests for Site Crawler endpoints with mocked background jobs.
"""

from unittest.mock import patch
from neemseo.api.v1.crawls import start_site_crawl, list_site_crawls, get_crawl_status
from neemseo.crawler.schemas import CrawlConfig, CrawlStatus
from neemseo.db.models import Crawl
from neemseo.db.session import SessionLocal, init_db

init_db()


def test_start_and_list_crawls():
    config = CrawlConfig(seed_url="https://example.com/api-test", max_pages=10, max_depth=2, check_sitemap=False)

    # Insert a real crawl row into DB so list & get can query it
    with SessionLocal() as db:
        test_crawl = Crawl(
            seed_url="https://example.com/api-test",
            status=CrawlStatus.COMPLETED.value,
            pages_crawled=5,
            max_pages=10,
            max_depth=2,
            duration_seconds=1.2,
            report_summary={"total_pages_crawled": 5},
        )
        db.add(test_crawl)
        db.commit()
        crawl_id = test_crawl.id

    with patch("neemseo.api.v1.crawls.crawler_manager.start_crawl", return_value=crawl_id):
        res = start_site_crawl(config)
        assert res["crawl_id"] == crawl_id
        assert res["status"] == "pending"

    # Test listing crawls
    with SessionLocal() as db:
        crawls = list_site_crawls(limit=10, offset=0, db=db)
        assert len(crawls) >= 1
        ids = [c["id"] for c in crawls]
        assert crawl_id in ids

    # Test get crawl status
    with SessionLocal() as db:
        status_info = get_crawl_status(crawl_id, db=db)
        assert status_info["crawl_id"] == crawl_id
        assert status_info["status"] in [s.value for s in CrawlStatus]
