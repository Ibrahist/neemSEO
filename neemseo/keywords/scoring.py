"""
neemSEO Keyword Priority and Opportunity Scorer.
Computes a single actionable score (0-100) combining Search Volume,
Keyword Difficulty (KD), and Search Intent profitability.
"""

import math
from neemseo.keywords.schemas import SearchIntent


INTENT_WEIGHTS = {
    SearchIntent.TRANSACTIONAL: 1.25,
    SearchIntent.COMMERCIAL: 1.10,
    SearchIntent.INFORMATIONAL: 0.90,
    SearchIntent.NAVIGATIONAL: 0.70,
}


class PriorityScorer:
    """Calculates composite priority score for targeting keywords."""

    @classmethod
    def calculate(
        cls,
        search_volume: int = 0,
        difficulty: int = 0,
        intent: SearchIntent = SearchIntent.INFORMATIONAL,
        cpc: float = 0.0,
    ) -> int:
        """
        Combines search volume, keyword difficulty, and intent into a 0-100 score.
        High volume + low difficulty + transactional intent yields the highest priority.
        """
        # 1. Volume Score (Logarithmic scaling from 0 to 100)
        # 0 vol -> 15 (potential long-tail)
        # 10 vol -> 25
        # 100 vol -> 45
        # 1,000 vol -> 65
        # 10,000 vol -> 85
        # 100,000+ vol -> 100
        if search_volume <= 0:
            vol_score = 20.0
        else:
            log_val = math.log10(max(10, search_volume))
            vol_score = min(100.0, max(20.0, log_val * 20.0))

        # 2. Ease Score (Inverse of difficulty)
        # 0 KD (easiest) -> 100 ease
        # 100 KD (hardest) -> 0 ease
        clamped_kd = max(0, min(100, difficulty))
        ease_score = 100.0 - clamped_kd

        # 3. CPC boost (High CPC signals high commercial value)
        cpc_boost = 0.0
        if cpc > 0:
            cpc_boost = min(15.0, math.log10(cpc + 1.0) * 8.0)

        # 4. Weighted combination
        # Ease: 45%, Volume: 45%, CPC: 10%
        base_score = (0.45 * ease_score) + (0.45 * vol_score) + (0.10 * cpc_boost)

        # 5. Intent multiplier
        intent_factor = INTENT_WEIGHTS.get(intent, 1.0)
        final_score = base_score * intent_factor

        # Clamp between 1 and 100
        return max(1, min(100, round(final_score)))

