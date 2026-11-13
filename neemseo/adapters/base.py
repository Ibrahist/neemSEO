"""
neemSEO Base Provider Adapter.
Common interface for third-party APIs (PageSpeed, DataForSEO, SerpApi) with caching and pre-flight cost estimation.
"""

from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Dict, Any, Optional
from pydantic import BaseModel

from neemseo.core.cache import cache
from neemseo.core.cost_tracker import cost_tracker


class CostEstimate(BaseModel):
    provider_name: str
    endpoint: str
    estimated_usd: Decimal
    explanation: str


class BaseProviderAdapter(ABC):
    provider_name: str = "base_provider"

    @abstractmethod
    def is_configured(self) -> bool:
        """Check whether credentials for this provider are present."""
        pass

    @abstractmethod
    async def estimate_cost(self, endpoint: str, params: Dict[str, Any]) -> CostEstimate:
        """Calculate estimated cost in USD before executing an API call."""
        pass

    @abstractmethod
    async def execute(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the actual API call against the provider."""
        pass

    async def fetch_with_cache_and_budget(
        self,
        endpoint: str,
        params: Dict[str, Any],
        force_refresh: bool = False,
        ttl_seconds: int = 86400 * 7,
    ) -> Dict[str, Any]:
        """
        Check cache -> return cached result ($0.00) or estimate cost -> execute -> log cost -> cache.
        """
        cache_key = cache.generate_key(self.provider_name, endpoint, params)

        # 1. Check cache
        if not force_refresh:
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                cost_tracker.log_call(
                    provider=self.provider_name,
                    endpoint=endpoint,
                    estimated_usd=Decimal("0.00"),
                    actual_usd=Decimal("0.00"),
                    was_cached=True,
                    details={"params": params},
                )
                return cached_result

        # 2. Estimate cost
        estimate = await self.estimate_cost(endpoint, params)

        # 3. Execute
        raw_result = await self.execute(endpoint, params)

        # 4. Log actual cost (defaulting to estimated cost if provider doesn't report exact invoice value in payload)
        actual_cost = Decimal(str(raw_result.get("cost", estimate.estimated_usd)))
        cost_tracker.log_call(
            provider=self.provider_name,
            endpoint=endpoint,
            estimated_usd=estimate.estimated_usd,
            actual_usd=actual_cost,
            was_cached=False,
            details={"params": params},
        )

        # 5. Store in cache
        cache.set(cache_key, raw_result, ttl_seconds=ttl_seconds)

        return raw_result

