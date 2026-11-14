"""
neemSEO AI Visibility Schemas (GEO - Generative Engine Optimization).
"""

from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class QueryPromptResult(BaseModel):
    query: str
    engine: str  # chatgpt, claude, perplexity, gemini, google_ai_overview
    is_cited: bool
    is_recommended: bool
    position: Optional[int] = None
    sentiment: str = "neutral"  # positive, neutral, absent
    excerpt: Optional[str] = None
    competitors_cited: List[str] = Field(default_factory=list)


class EngineBreakdown(BaseModel):
    engine: str
    display_name: str
    visibility_score: int  # 0-100
    mentions: int
    citations: int
    total_queries: int


class AIVisibilityRequest(BaseModel):
    domain: str
    brand_name: str
    queries: Optional[List[str]] = None
    engines: Optional[List[str]] = Field(
        default=["chatgpt", "claude", "perplexity", "gemini", "google_ai_overview"]
    )


class AIVisibilityResult(BaseModel):
    id: str
    domain: str
    brand_name: str
    overall_score: int  # 0-100
    queries_count: int
    citations_count: int
    mention_rate_pct: float
    citation_rate_pct: float
    recommendation_rate_pct: float
    engine_breakdown: List[EngineBreakdown]
    query_results: List[QueryPromptResult]
    optimization_tips: List[str]
    created_at: datetime


class AIVisibilityHistoryItem(BaseModel):
    id: str
    domain: str
    brand_name: str
    overall_score: int
    queries_count: int
    citations_count: int
    created_at: datetime
