"""
neemSEO Asynchronous Site Crawler Engine.
Performs polite, concurrent whole-site audits, extracts link graphs, and persists crawl records.
"""

import asyncio
import time
from typing import Set, Dict, List, Any, Optional, Callable
from urllib.parse import urlparse, urljoin, urldefrag
from datetime import datetime

from sqlalchemy.orm import Session

from neemseo.crawler.schemas import CrawlConfig, CrawlStatus, CrawlSummaryReport, CrawlProgress
from neemseo.crawler.sitemap import SitemapParser
from neemseo.crawler.analyzer import CrawlAnalyzer
from neemseo.core.fetcher import PageFetcher, FetchResult
from neemseo.core.parser import PageParser
from neemseo.rules.registry import registry
from neemseo.core.scoring import AuditScorer
from neemseo.db.models import Crawl, CrawlPage, CrawlLink
from neemseo.db.session import SessionLocal


class SiteCrawler:
    def __init__(
        self,
        config: CrawlConfig,
        crawl_id: str,
        on_progress: Optional[Callable[[CrawlProgress], None]] = None,
        save_to_db: bool = True,
    ):
        self.config = config
        self.crawl_id = crawl_id
        self.on_progress = on_progress
        self.save_to_db = save_to_db
        self.status = CrawlStatus.PENDING

        self._cancelled = False
        self._paused = False

        # Domain boundary
        parsed_seed = urlparse(config.seed_url)
        self.base_origin = f"{parsed_seed.scheme}://{parsed_seed.netloc}".lower()
        self.base_domain = parsed_seed.netloc.lower()

        # Components
        self.fetcher = PageFetcher(
            respect_robots=config.respect_robots,
        )
        self.sitemap_parser = SitemapParser()

        # In-memory tracking
        self.visited_urls: Set[str] = set()
        self.crawled_pages_data: List[Dict[str, Any]] = []
        self.crawled_links_data: List[Dict[str, Any]] = []
        self.sitemap_urls: List[str] = []

        self.start_time: Optional[float] = None
        self.duration_seconds: float = 0.0

    def cancel(self):
        """Signals the crawler to stop processing queue gracefully."""
        self._cancelled = True
        self.status = CrawlStatus.CANCELLED

    def pause(self):
        self._paused = True
        self.status = CrawlStatus.PAUSED

    def resume(self):
        self._paused = False
        self.status = CrawlStatus.RUNNING

    def _normalize_url(self, url: str) -> str:
        # Strip query fragments and normalize trailing slash
        defragged, _ = urldefrag(url.strip())
        return defragged

    def _is_internal(self, url: str) -> bool:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        return netloc == "" or netloc == self.base_domain or netloc.endswith("." + self.base_domain)

    async def crawl(self) -> CrawlSummaryReport:
        """
        Executes the whole-site crawl.
        """
        self.start_time = time.perf_counter()
        self.status = CrawlStatus.RUNNING
        self._update_db_status(CrawlStatus.RUNNING)

        # Queue: list of (url, depth)
        queue: List[tuple[str, int]] = []
        queued_set: Set[str] = set()

        def enqueue(target_url: str, depth: int):
            norm = self._normalize_url(target_url)
            if norm not in self.visited_urls and norm not in queued_set:
                queued_set.add(norm)
                queue.append((norm, depth))

        # 1. Enqueue seed URL
        norm_seed = self._normalize_url(self.config.seed_url)
        enqueue(norm_seed, depth=0)

        # 2. Check and parse sitemap if enabled
        if self.config.check_sitemap:
            try:
                discovered_sitemaps = await self.sitemap_parser.discover_sitemaps(self.config.seed_url)
                for sm in discovered_sitemaps:
                    s_urls = await self.sitemap_parser.fetch_and_extract_urls(sm, max_urls=self.config.max_pages)
                    self.sitemap_urls.extend(s_urls)
                # Deduplicate sitemap URLs
                self.sitemap_urls = list(dict.fromkeys(self.sitemap_urls))

                # Enqueue top sitemap URLs at depth 1
                for sm_url in self.sitemap_urls[: self.config.max_pages]:
                    if self._is_internal(sm_url):
                        enqueue(sm_url, depth=1)
            except Exception:
                pass

        # Concurrency limiter
        semaphore = asyncio.Semaphore(self.config.concurrency)

        async def process_page(current_url: str, current_depth: int):
            if self._cancelled:
                return

            # Wait while paused
            while self._paused and not self._cancelled:
                await asyncio.sleep(0.5)

            async with semaphore:
                # Polite domain delay
                if self.config.delay_seconds > 0:
                    await asyncio.sleep(self.config.delay_seconds)

                fetch_res: FetchResult = await self.fetcher.fetch(current_url)

                page_record = {
                    "url": fetch_res.url,
                    "initial_url": current_url,
                    "status_code": fetch_res.status_code,
                    "depth": current_depth,
                    "load_time_ms": fetch_res.response_time_ms,
                    "is_blocked_robots": fetch_res.is_blocked_by_robots,
                    "is_noindex": False,
                    "title": None,
                    "meta_description": None,
                    "word_count": 0,
                    "overall_score": 100,
                    "issues": [],
                    "redirect_chain": [h.model_dump() for h in fetch_res.redirect_chain],
                }

                outgoing_links_to_check: List[Dict[str, Any]] = []

                if fetch_res.is_success and fetch_res.html:
                    # Parse HTML
                    parser = PageParser(fetch_res.html, fetch_res.url)
                    parsed_page = parser.parse()

                    page_record["title"] = parsed_page.title
                    page_record["meta_description"] = parsed_page.meta_description
                    page_record["word_count"] = parsed_page.word_count
                    page_record["is_noindex"] = parsed_page.is_noindex

                    # Run audit rules on page
                    rule_results = registry.run_all(parsed_page)
                    report = AuditScorer.generate_report(fetch_res.url, rule_results, parsed_page)
                    page_record["overall_score"] = report.overall_score
                    page_record["issues"] = [r.model_dump() for r in report.prioritized_fixes]

                    # Extract outgoing links
                    for link in parsed_page.links:
                        norm_target = self._normalize_url(link.absolute_url)
                        is_int = self._is_internal(norm_target)

                        link_info = {
                            "source_url": fetch_res.url,
                            "target_url": norm_target,
                            "anchor_text": link.anchor_text,
                            "is_internal": is_int,
                            "is_broken": False,
                            "status_code": 200,
                        }
                        self.crawled_links_data.append(link_info)

                        if is_int and current_depth + 1 <= self.config.max_depth:
                            if len(self.visited_urls) + len(queue) < self.config.max_pages:
                                enqueue(norm_target, current_depth + 1)
                        elif not is_int:
                            outgoing_links_to_check.append(link_info)

                self.crawled_pages_data.append(page_record)
                self.visited_urls.add(current_url)

                # Report progress
                self._emit_progress(len(self.visited_urls), len(queue), current_depth)

        # Process queue concurrently in batches
        while queue and len(self.visited_urls) < self.config.max_pages and not self._cancelled:
            batch = []
            while queue and len(batch) < self.config.concurrency and len(self.visited_urls) + len(batch) < self.config.max_pages:
                u, d = queue.pop(0)
                if u not in self.visited_urls:
                    batch.append((u, d))

            if not batch:
                break

            tasks = [process_page(u, d) for u, d in batch]
            await asyncio.gather(*tasks, return_exceptions=True)

        self.duration_seconds = time.perf_counter() - self.start_time
        final_status = CrawlStatus.CANCELLED if self._cancelled else CrawlStatus.COMPLETED
        self.status = final_status

        # Post-analysis
        summary_report = CrawlAnalyzer.analyze(
            crawl_id=self.crawl_id,
            seed_url=self.config.seed_url,
            pages=self.crawled_pages_data,
            links=self.crawled_links_data,
            sitemap_urls=self.sitemap_urls,
            duration_seconds=self.duration_seconds,
            status=final_status,
        )

        # Update Crawl table record with full report summary
        self._finish_crawl_record(summary_report)

        return summary_report

    def _emit_progress(self, crawled: int, queued: int, depth: int):
        if self.on_progress:
            prog = CrawlProgress(
                crawl_id=self.crawl_id,
                status=self.status,
                pages_crawled=crawled,
                pages_queued=queued,
                current_depth=depth,
                started_at=datetime.utcnow(),
                duration_seconds=time.perf_counter() - self.start_time if self.start_time else 0.0,
            )
            self.on_progress(prog)

    def _update_db_status(self, status: CrawlStatus):
        if not self.save_to_db:
            return
        try:
            with SessionLocal() as db:
                c = db.query(Crawl).filter(Crawl.id == self.crawl_id).first()
                if c:
                    c.status = status.value
                    db.commit()
        except Exception:
            pass

    def _finish_crawl_record(self, report: CrawlSummaryReport):
        if not self.save_to_db:
            return
        try:
            with SessionLocal() as db:
                c = db.query(Crawl).filter(Crawl.id == self.crawl_id).first()
                if c:
                    c.status = report.status.value
                    c.pages_crawled = report.total_pages_crawled
                    c.total_links_found = report.total_links_found
                    c.sitemap_urls_found = report.sitemap_urls_discovered
                    c.duration_seconds = report.duration_seconds
                    c.report_summary = report.model_dump()
                    c.finished_at = datetime.utcnow()

                    for p in self.crawled_pages_data:
                        page_obj = CrawlPage(
                            crawl_id=self.crawl_id,
                            url=p["url"],
                            status_code=p["status_code"],
                            depth=p["depth"],
                            title=p.get("title"),
                            meta_description=p.get("meta_description"),
                            overall_score=p.get("overall_score", 100),
                            word_count=p.get("word_count", 0),
                            is_noindex=p.get("is_noindex", False),
                            is_blocked_robots=p.get("is_blocked_robots", False),
                            load_time_ms=p.get("load_time_ms", 0.0),
                            issues_summary=p.get("issues", []),
                        )
                        db.add(page_obj)

                    # Save broken links
                    for b in report.broken_links:
                        link_obj = CrawlLink(
                            crawl_id=self.crawl_id,
                            source_url=b.source_url,
                            target_url=b.target_url,
                            anchor_text=b.anchor_text,
                            is_internal=b.is_internal,
                            is_broken=True,
                            status_code=b.status_code,
                        )
                        db.add(link_obj)

                    db.commit()
        except Exception:
            pass
