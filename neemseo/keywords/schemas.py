"""
neemSEO Keyword Research Schemas and Data Models.
Contracts for keyword metrics, search intents, cluster groupings, and research reports.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SearchIntent(str, Enum):
    INFORMATIONAL = "informational"
    COMMERCIAL = "commercial"
    TRANSACTIONAL = "transactional"
    NAVIGATIONAL = "navigational"


class KeywordItem(BaseModel):
    keyword: str
    search_volume: int = 0
    cpc: float = 0.0
    difficulty: int = 0  # 0 to 100 (KD)
    intent: SearchIntent = SearchIntent.INFORMATIONAL
    cluster: str = "General"
    priority_score: int = 50  # 0 to 100
    source: str = "autocomplete"  # autocomplete, dataforseo, manual
    intent_confidence: float = 0.8


class KeywordClusterGroup(BaseModel):
    cluster_name: str
    keyword_count: int = 0
    total_volume: int = 0
    average_difficulty: float = 0.0
    dominant_intent: SearchIntent = SearchIntent.INFORMATIONAL
    keywords: List[KeywordItem] = Field(default_factory=list)


class KeywordResearchRequest(BaseModel):
    seed_keyword: str
    country_code: str = "US"
    language_code: str = "en"
    expand_alphabet: bool = True
    expand_questions: bool = True
    use_paid_api: bool = False
    max_results: int = 150
    save_to_db: bool = True


class KeywordResearchResult(BaseModel):
    id: Optional[str] = None
    seed_keyword: str
    country_code: str = "US"
    language_code: str = "en"
    total_found: int = 0
    cost_usd: float = 0.0
    clusters: List[KeywordClusterGroup] = Field(default_factory=list)
    keywords: List[KeywordItem] = Field(default_factory=list)
    created_at: Optional[datetime] = None


class ClusterRequest(BaseModel):
    keywords: List[str]


class ClusterResponse(BaseModel):
    total_keywords: int
    clusters: List[KeywordClusterGroup]


class KeywordCostEstimate(BaseModel):
    keyword_count: int
    use_paid_api: bool
    estimated_cost_usd: float
    explanation: str

