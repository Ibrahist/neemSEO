"""
neemSEO Celery Background Tasks for Whole-Site Crawling.
"""

import asyncio
from neemseo.tasks.celery_app import celery_app
from neemseo.crawler.schemas import CrawlConfig
from neemseo.crawler.manager import crawler_manager


@celery_app.task(bind=True, name="neemseo.tasks.crawls.run_site_crawl_task")
def run_site_crawl_task(
    self=None,
    seed_url: str = "",
    max_pages: int = 100,
    max_depth: int = 3,
    check_sitemap: bool = True,
    render_js: bool = False,
    user_id: str = None,
):
    """
    Executes a comprehensive background site crawl inside Celery worker.
    Reports progress and records completed metrics.
    """
    config = CrawlConfig(
        seed_url=seed_url,
        max_pages=max_pages,
        max_depth=max_depth,
        check_sitemap=check_sitemap,
        render_js=render_js,
    )

    async def _async_run():
        crawl_id = await crawler_manager.start_crawl(config, user_id=user_id)
        # Poll until finished
        while True:
            progress = crawler_manager.get_progress(crawl_id)
            if not progress:
                break
            self.update_state(
                state="PROGRESS",
                meta={
                    "crawl_id": crawl_id,
                    "pages_crawled": progress.pages_crawled,
                    "status": progress.status.value,
                },
            )
            if progress.status.value in ["completed", "failed", "cancelled"]:
                return {
                    "crawl_id": crawl_id,
                    "pages_crawled": progress.pages_crawled,
                    "status": progress.status.value,
                }
            await asyncio.sleep(2.0)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_async_run())
    finally:
        loop.close()
