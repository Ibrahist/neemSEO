"""
neemSEO Crawler Job Manager.
Manages background crawl tasks, cancellation, progress updates, and task lifecycles.
"""

import asyncio
from typing import Dict, Optional
from datetime import datetime

from neemseo.crawler.schemas import CrawlConfig, CrawlStatus, CrawlProgress, CrawlSummaryReport
from neemseo.crawler.engine import SiteCrawler
from neemseo.db.models import Crawl
from neemseo.db.session import SessionLocal, init_db


class CrawlerJobManager:
    def __init__(self):
        self._active_crawlers: Dict[str, SiteCrawler] = {}
        self._latest_progress: Dict[str, CrawlProgress] = {}

    def get_crawler(self, crawl_id: str) -> Optional[SiteCrawler]:
        return self._active_crawlers.get(crawl_id)

    def start_crawl(self, config: CrawlConfig) -> str:
        """
        Creates a database crawl entry and launches background crawling task.
        """
        init_db()

        # 1. Create DB entry
        with SessionLocal() as db:
            crawl_obj = Crawl(
                seed_url=config.seed_url,
                max_pages=config.max_pages,
                max_depth=config.max_depth,
                status=CrawlStatus.PENDING.value,
            )
            db.add(crawl_obj)
            db.commit()
            crawl_id = crawl_obj.id

        # 2. Setup progress callback
        def on_progress(p: CrawlProgress):
            self._latest_progress[crawl_id] = p

        # 3. Instantiate crawler
        crawler = SiteCrawler(
            config=config,
            crawl_id=crawl_id,
            on_progress=on_progress,
        )
        self._active_crawlers[crawl_id] = crawler

        self._latest_progress[crawl_id] = CrawlProgress(
            crawl_id=crawl_id,
            status=CrawlStatus.PENDING,
            pages_crawled=0,
            pages_queued=1,
            current_depth=0,
            started_at=datetime.utcnow(),
        )

        # 4. Launch async task
        async def run_task():
            try:
                await crawler.crawl()
            except Exception as e:
                crawler.status = CrawlStatus.FAILED
                with SessionLocal() as db:
                    c = db.query(Crawl).filter(Crawl.id == crawl_id).first()
                    if c:
                        c.status = CrawlStatus.FAILED.value
                        c.report_summary = {"error": str(e)}
                        db.commit()
            finally:
                # Retain in progress map, remove from active instances once finished
                if crawl_id in self._active_crawlers:
                    del self._active_crawlers[crawl_id]

        try:
            loop = asyncio.get_running_loop()
            loop.create_task(run_task())
        except RuntimeError:
            import threading

            def runner():
                asyncio.run(run_task())

            t = threading.Thread(target=runner, daemon=True)
            t.start()

        return crawl_id

    def cancel_crawl(self, crawl_id: str) -> bool:
        crawler = self._active_crawlers.get(crawl_id)
        if crawler:
            crawler.cancel()
            return True
        return False

    def pause_crawl(self, crawl_id: str) -> bool:
        crawler = self._active_crawlers.get(crawl_id)
        if crawler:
            crawler.pause()
            return True
        return False

    def resume_crawl(self, crawl_id: str) -> bool:
        crawler = self._active_crawlers.get(crawl_id)
        if crawler:
            crawler.resume()
            return True
        return False

    def get_progress(self, crawl_id: str) -> Optional[CrawlProgress]:
        if crawl_id in self._latest_progress:
            return self._latest_progress[crawl_id]

        with SessionLocal() as db:
            c = db.query(Crawl).filter(Crawl.id == crawl_id).first()
            if c:
                return CrawlProgress(
                    crawl_id=c.id,
                    status=CrawlStatus(c.status),
                    pages_crawled=c.pages_crawled,
                    pages_queued=0,
                    current_depth=0,
                    started_at=c.created_at,
                    finished_at=c.finished_at,
                    duration_seconds=c.duration_seconds,
                )
        return None


# Global job manager singleton
crawler_manager = CrawlerJobManager()

