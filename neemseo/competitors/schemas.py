"""
neemSEO Competitor Insights Schemas.
Data contracts for competitor comparison, keyword gap analysis, and backlink gap opportunities.
"""

from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class KeywordGapItem(BaseModel):
    """Keyword gap opportunity between target domain and competitors."""
    keyword: str
    search_volume: int = 0
    difficulty: int = 0
    intent: str = "informational"
    # Mapping of domain -> position (e.g. {"mysite.com": None, "competitor.com": 4})
    domain_ranks: Dict[str, Optional[int]] = Field(default_factory=dict)
    gap_type: str = "missing"  # "missing" (competitor ranks, target does not), "shared" (both rank), "untapped" (high volume, low KD)
    priority_score: int = 50


class BacklinkGapItem(BaseModel):
    """Referring domain linking to competitor(s) but not target domain."""
    referring_domain: str
    domain_rank: int = 0
    links_to_competitors: List[str] = Field(default_factory=list)
    links_to_target: bool = False
    estimated_outreach_value: str = "medium"  # "high", "medium", "low"


class CompetitorComparisonReport(BaseModel):
    """Comprehensive competitor gap analysis report."""
    target_domain: str
    competitors: List[str]
    total_shared_keywords: int = 0
    total_missing_keywords: int = 0
    total_backlink_gaps: int = 0
    keyword_gaps: List[KeywordGapItem] = Field(default_factory=list)
    backlink_gaps: List[BacklinkGapItem] = Field(default_factory=list)
    cost_usd: float = 0.0
    created_at: Optional[datetime] = None


class CompetitorGapRequest(BaseModel):
    target_domain: str
    competitors: List[str] = Field(..., min_length=1, max_length=5)
    country_code: str = "US"
    use_paid_api: bool = False
