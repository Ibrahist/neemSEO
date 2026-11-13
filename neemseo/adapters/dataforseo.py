"""
DataForSEO Adapter.
Primary paid data provider for SERPs, keyword volumes, and backlink metrics with upfront cost estimation.
"""

from decimal import Decimal
from typing import Dict, Any, Optional
from neemseo.adapters.base import BaseProviderAdapter, CostEstimate
from neemseo.core.config import settings


class DataForSEOAdapter(BaseProviderAdapter):
    provider_name: str = "dataforseo"
    BASE_URL = "https://api.dataforseo.com/v3"

    # Standard DataForSEO pricing units (USD)
    COST_SERP_CHECK = Decimal("0.002")
    COST_KEYWORD_DATA = Decimal("0.0005")
    COST_BACKLINK_SUMMARY = Decimal("0.02")

    def __init__(
        self,
        login: Optional[str] = None,
        password: Optional[str] = None,
    ):
        self.login = login or settings.DATAFORSEO_LOGIN
        self.password = password or settings.DATAFORSEO_PASSWORD

    def is_configured(self) -> bool:
        return bool(self.login and self.password)

    async def estimate_cost(self, endpoint: str, params: Dict[str, Any]) -> CostEstimate:
        endpoint_lower = endpoint.lower()
        if "serp" in endpoint_lower:
            count = len(params.get("keywords", [1]))
            est = self.COST_SERP_CHECK * count
            explanation = f"SERP lookup for {count} keyword(s) at ${self.COST_SERP_CHECK} each."
        elif "keywords" in endpoint_lower:
            count = len(params.get("keywords", [1]))
            est = self.COST_KEYWORD_DATA * count
            explanation = f"Keyword metrics lookup for {count} keyword(s) at ${self.COST_KEYWORD_DATA} each."
        elif "backlinks" in endpoint_lower:
            est = self.COST_BACKLINK_SUMMARY
            explanation = f"Backlink summary lookup at ${self.COST_BACKLINK_SUMMARY}."
        else:
            est = Decimal("0.005")
            explanation = "Standard DataForSEO API call."

        return CostEstimate(
            provider_name=self.provider_name,
            endpoint=endpoint,
            estimated_usd=est,
            explanation=explanation,
        )

    async def execute(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "error": "DataForSEO credentials missing. Configure NEEMSEO_DATAFORSEO_LOGIN and NEEMSEO_DATAFORSEO_PASSWORD.",
                "cost": 0.0,
                "data": {},
            }

        # Actual API execution via httpx auth would be placed here
        return {
            "status": "success",
            "endpoint": endpoint,
            "cost": float(self.COST_SERP_CHECK),
            "data": {},
        }

