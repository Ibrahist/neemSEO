"""
neemSEO Rank Tracker Schemas.
Pydantic contracts for SERP position tracking: target definitions, historical checks,
trend analysis, and scheduled monitoring configurations.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class DeviceType(str, Enum):
    DESKTOP = "desktop"
    MOBILE = "mobile"


class RankCheckStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class RankTarget(BaseModel):
    """A keyword + URL + location + device combination to monitor."""
    id: Optional[str] = None
    keyword: str
    target_url: str
    location_code: int = 2840  # Google location code, 2840 = United States
    location_name: str = "United States"
    language_code: str = "en"
    device: DeviceType = DeviceType.DESKTOP
    is_active: bool = True
    created_at: Optional[datetime] = None


class RankPosition(BaseModel):
    """A single SERP position check result."""
    id: Optional[str] = None
    target_id: str
    keyword: str
    target_url: str
    position: Optional[int] = None   # None = not found in top 100
    previous_position: Optional[int] = None
    position_change: Optional[int] = None   # positive = moved up, negative = dropped
    url_found: Optional[str] = None  # actual URL that ranked (may differ from target)
    is_featured_snippet: bool = False
    is_local_pack: bool = False
    location_code: int = 2840
    device: DeviceType = DeviceType.DESKTOP
    checked_at: Optional[datetime] = None
    cost_usd: float = 0.0
    source: str = "dataforseo"


class RankTrend(BaseModel):
    """Trend data for a single rank target over time."""
    target_id: str
    keyword: str
    target_url: str
    device: DeviceType
    location_name: str
    current_position: Optional[int] = None
    best_position: Optional[int] = None
    worst_position: Optional[int] = None
    checks: List[RankPosition] = Field(default_factory=list)
    has_alert: bool = False
    alert_message: Optional[str] = None


class RankAlert(BaseModel):
    """Alert triggered by significant rank position change."""
    target_id: str
    keyword: str
    target_url: str
    old_position: Optional[int]
    new_position: Optional[int]
    change: int  # negative = dropped
    alert_type: str  # "drop", "gain", "new_entry", "lost"
    created_at: Optional[datetime] = None


class AddTargetRequest(BaseModel):
    keyword: str
    target_url: str
    location_code: int = 2840
    location_name: str = "United States"
    language_code: str = "en"
    device: DeviceType = DeviceType.DESKTOP


class CheckRankRequest(BaseModel):
    target_ids: Optional[List[str]] = None   # None = check all active targets
    confirm_cost: bool = False


class RankCheckCostEstimate(BaseModel):
    target_count: int
    estimated_cost_usd: float
    explanation: str
    cost_per_check_usd: float = 0.002
