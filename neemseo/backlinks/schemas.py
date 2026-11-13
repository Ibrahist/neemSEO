"""
neemSEO Backlink Tracker Schemas.
Pydantic contracts for backlink snapshots, referring domain summaries,
new/lost link diffs, anchor text analysis, and competitor gap reports.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class BacklinkType(str, Enum):
    DOFOLLOW = "dofollow"
    NOFOLLOW = "nofollow"
    SPONSORED = "sponsored"
    UGC = "ugc"


class BacklinkItem(BaseModel):
    """A single referring backlink."""
    id: Optional[str] = None
    snapshot_id: str
    source_url: str
    source_domain: str
    target_url: str
    anchor_text: str = ""
    link_type: BacklinkType = BacklinkType.DOFOLLOW
    domain_rank: int = 0           # DR/DA proxy 0-100
    page_rank: int = 0
    is_new: bool = False
    is_lost: bool = False
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None


class BacklinkDomainSummary(BaseModel):
    """Aggregate stats per referring domain."""
    domain: str
    total_links: int = 0
    domain_rank: int = 0
    is_new: bool = False
    is_lost: bool = False
    dofollow_count: int = 0
    nofollow_count: int = 0


class BacklinkSnapshot(BaseModel):
    """A point-in-time backlink profile for a target domain."""
    id: Optional[str] = None
    target_domain: str
    total_backlinks: int = 0
    total_referring_domains: int = 0
    dofollow_count: int = 0
    nofollow_count: int = 0
    new_links_since_last: int = 0
    lost_links_since_last: int = 0
    top_anchor_texts: List[Dict[str, Any]] = Field(default_factory=list)
    cost_usd: float = 0.0
    source: str = "dataforseo"
    created_at: Optional[datetime] = None
    backlinks: List[BacklinkItem] = Field(default_factory=list)
    referring_domains: List[BacklinkDomainSummary] = Field(default_factory=list)


class BacklinkDiff(BaseModel):
    """Delta between two backlink snapshots."""
    target_domain: str
    base_snapshot_id: str
    target_snapshot_id: str
    new_backlinks: List[BacklinkItem] = Field(default_factory=list)
    lost_backlinks: List[BacklinkItem] = Field(default_factory=list)
    new_referring_domains: List[str] = Field(default_factory=list)
    lost_referring_domains: List[str] = Field(default_factory=list)
    dr_change: int = 0
    total_link_change: int = 0


class BacklinkResearchRequest(BaseModel):
    target_domain: str
    include_subdomains: bool = True
    max_backlinks: int = Field(default=100, ge=1, le=1000)
    confirm_cost: bool = False


class BacklinkCostEstimate(BaseModel):
    target_domain: str
    estimated_cost_usd: float
    explanation: str


class AnchorTextItem(BaseModel):
    text: str
    count: int
    percentage: float

