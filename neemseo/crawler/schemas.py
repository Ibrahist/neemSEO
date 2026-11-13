"""
neemSEO Crawler Pydantic Schemas.
Data contracts for crawl configuration, live progress, page results, and comprehensive audit reports.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class CrawlStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class CrawlConfig(BaseModel):
    seed_url: str
    max_pages: int = Field(default=100, ge=1, le=5000)
    max_depth: int = Field(default=3, ge=1, le=10)
    concurrency: int = Field(default=5, ge=1, le=20)
    delay_seconds: float = Field(default=0.1, ge=0.0, le=5.0)
    check_sitemap: bool = True
    respect_robots: bool = True
    js_rendering: bool = False


class CrawlProgress(BaseModel):
    crawl_id: str
    status: CrawlStatus
    pages_crawled: int = 0
    pages_queued: int = 0
    current_depth: int = 0
    started_at: datetime
    finished_at: Optional[datetime] = None
    duration_seconds: float = 0.0
    error_message: Optional[str] = None


class BrokenLinkItem(BaseModel):
    target_url: str
    source_url: str
    anchor_text: str
    status_code: int
    is_internal: bool


class RedirectChainItem(BaseModel):
    initial_url: str
    final_url: str
    hops_count: int
    chain: List[Dict[str, Any]]


class DuplicateGroup(BaseModel):
    item_type: str  # "title" or "meta_description"
    content: str
    count: int
    urls: List[str]


class OrphanPageItem(BaseModel):
    url: str
    sitemap_source: bool = True
    internal_incoming_links: int = 0


class CrawlSummaryReport(BaseModel):
    crawl_id: str
    seed_url: str
    status: CrawlStatus
    total_pages_crawled: int = 0
    total_links_found: int = 0
    sitemap_urls_discovered: int = 0
    duration_seconds: float = 0.0

    # Scores
    average_health_score: float = 100.0
    score_distribution: Dict[str, int] = Field(default_factory=dict)

    # Core Issues
    broken_links: List[BrokenLinkItem] = Field(default_factory=list)
    broken_links_count: int = 0

    redirect_chains: List[RedirectChainItem] = Field(default_factory=list)
    redirect_chains_count: int = 0

    duplicate_titles: List[DuplicateGroup] = Field(default_factory=list)
    duplicate_descriptions: List[DuplicateGroup] = Field(default_factory=list)

    orphan_pages: List[OrphanPageItem] = Field(default_factory=list)
    orphan_pages_count: int = 0

    noindex_pages: List[str] = Field(default_factory=list)
    blocked_robots_pages: List[str] = Field(default_factory=list)

    # Architecture
    depth_distribution: Dict[int, int] = Field(default_factory=dict)
    top_inlinked_pages: List[Dict[str, Any]] = Field(default_factory=list)


class CrawlDiffReport(BaseModel):
    base_crawl_id: str
    target_crawl_id: str
    seed_url: str
    score_change: float = 0.0
    pages_change: int = 0
    new_pages: List[str] = Field(default_factory=list)
    removed_pages: List[str] = Field(default_factory=list)
    new_broken_links: List[BrokenLinkItem] = Field(default_factory=list)
    resolved_broken_links: List[BrokenLinkItem] = Field(default_factory=list)
    new_duplicates: int = 0
    resolved_duplicates: int = 0

