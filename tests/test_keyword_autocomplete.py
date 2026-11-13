"""
Tests for Google Autocomplete Expansion.
"""

from neemseo.keywords.autocomplete import GoogleAutocompleteSource


def test_offline_keyword_expansion():
    # Test synthetic generator ensures robust fallback when offline or sandboxed
    expansions = GoogleAutocompleteSource._generate_offline_expansions("seo audit", max_results=50)

    assert len(expansions) >= 20
    assert "seo audit" in expansions
    assert any("how to" in item or "best" in item for item in expansions)
    assert any("for" in item or "small business" in item for item in expansions)

