"""
neemSEO Cost Tracker.
Logs every external API call, calculates running spend totals, and enforces budget transparency.
"""

from decimal import Decimal
from typing import Dict, List, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class CostRecord(BaseModel):
    provider: str
    endpoint: str
    estimated_usd: Decimal = Decimal("0.000")
    actual_usd: Decimal = Decimal("0.000")
    was_cached: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = Field(default_factory=dict)


class CostTracker:
    def __init__(self):
        self._records: List[CostRecord] = []

    def log_call(
        self,
        provider: str,
        endpoint: str,
        estimated_usd: Decimal,
        actual_usd: Decimal,
        was_cached: bool = False,
        details: Optional[Dict[str, Any]] = None,
    ) -> CostRecord:
        record = CostRecord(
            provider=provider,
            endpoint=endpoint,
            estimated_usd=estimated_usd,
            actual_usd=Decimal("0.00") if was_cached else actual_usd,
            was_cached=was_cached,
            details=details or {},
        )
        self._records.append(record)
        return record

    def get_total_spend(self) -> Decimal:
        return sum((r.actual_usd for r in self._records), Decimal("0.00"))

    def get_summary(self) -> Dict[str, Any]:
        total_spent = self.get_total_spend()
        total_calls = len(self._records)
        cached_calls = sum(1 for r in self._records if r.was_cached)
        by_provider: Dict[str, Decimal] = {}

        for r in self._records:
            by_provider[r.provider] = by_provider.get(r.provider, Decimal("0.00")) + r.actual_usd

        return {
            "total_spent_usd": float(total_spent),
            "total_calls": total_calls,
            "cached_calls": cached_calls,
            "cache_hit_rate": round(cached_calls / total_calls * 100, 1) if total_calls > 0 else 0.0,
            "by_provider": {k: float(v) for k, v in by_provider.items()},
        }


# Global in-memory cost tracker
cost_tracker = CostTracker()

