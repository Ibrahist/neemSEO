"""
Tests for Keyword Priority Scorer.
"""

from neemseo.keywords.scoring import PriorityScorer
from neemseo.keywords.schemas import SearchIntent


def test_priority_score_opportunity_balance():
    # Low difficulty + High volume + Transactional intent = High Priority
    score_high = PriorityScorer.calculate(
        search_volume=10000,
        difficulty=15,
        intent=SearchIntent.TRANSACTIONAL,
        cpc=3.50,
    )
    assert score_high >= 80

    # High difficulty + Low volume + Navigational intent = Low Priority
    score_low = PriorityScorer.calculate(
        search_volume=50,
        difficulty=85,
        intent=SearchIntent.NAVIGATIONAL,
        cpc=0.0,
    )
    assert score_low <= 40

    # Ensure score is strictly clamped between 1 and 100
    assert 1 <= score_high <= 100
    assert 1 <= score_low <= 100


def test_intent_multiplier_effect():
    # Identical volume & KD, but Transactional vs Informational
    score_trans = PriorityScorer.calculate(
        search_volume=2000,
        difficulty=30,
        intent=SearchIntent.TRANSACTIONAL,
    )
    score_info = PriorityScorer.calculate(
        search_volume=2000,
        difficulty=30,
        intent=SearchIntent.INFORMATIONAL,
    )
    assert score_trans > score_info

