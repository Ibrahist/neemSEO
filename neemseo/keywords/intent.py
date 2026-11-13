"""
neemSEO Search Intent Classifier.
Classifies search queries into standard SEO intent categories:
Informational, Commercial, Transactional, and Navigational.
"""

import re
from typing import Tuple
from neemseo.keywords.schemas import SearchIntent


TRANSACTIONAL_SIGNALS = {
    "buy", "cheap", "price", "pricing", "cost", "discount", "deal", "deals",
    "coupon", "coupons", "order", "purchase", "purchasing", "hire", "for sale",
    "quote", "shop", "shopping", "store", "subscription", "checkout", "promo",
    "voucher", "affordable", "wholesale", "pay",
}

COMMERCIAL_SIGNALS = {
    "best", "top", "review", "reviews", "vs", "versus", "comparison", "compare",
    "alternative", "alternatives", "recommended", "ranking", "rankings", "ratings",
    "rating", "features", "specs", "pros and cons", "pros & cons", "difference between",
}

NAVIGATIONAL_SIGNALS = {
    "login", "log in", "sign in", "signin", "portal", "official site", "official website",
    "support", "contact", "customer service", "dashboard", "helpdesk", "account",
    "download", "app", "website",
}

INFORMATIONAL_SIGNALS = {
    "how", "how to", "what", "what is", "why", "where", "when", "who", "which",
    "guide", "tutorial", "tips", "learn", "ideas", "example", "examples",
    "template", "checklist", "definition", "define", "meaning", "explain",
    "strategy", "strategies", "causes", "symptoms", "history", "documentation",
    "docs", "faq", "calculator",
}


class IntentClassifier:
    """Fast, deterministic lexical intent classifier for keyword analysis."""

    @classmethod
    def classify(cls, keyword: str) -> Tuple[SearchIntent, float]:
        """
        Classifies keyword into (SearchIntent, confidence_score).
        Returns the primary intent and confidence (0.0 to 1.0).
        """
        lower = keyword.strip().lower()
        tokens = set(re.findall(r"\b[\w\-']+\b", lower))

        # Check multi-word signals first
        for signal in ("how to", "what is", "pros and cons", "difference between", "for sale", "sign in", "log in", "official website"):
            if signal in lower:
                if signal in ("how to", "what is"):
                    return SearchIntent.INFORMATIONAL, 0.95
                if signal in ("pros and cons", "difference between"):
                    return SearchIntent.COMMERCIAL, 0.95
                if signal == "for sale":
                    return SearchIntent.TRANSACTIONAL, 0.95
                if signal in ("sign in", "log in", "official website"):
                    return SearchIntent.NAVIGATIONAL, 0.95

        # Check transactional signals
        trans_overlap = tokens.intersection(TRANSACTIONAL_SIGNALS)
        if trans_overlap:
            confidence = min(0.95, 0.75 + len(trans_overlap) * 0.1)
            return SearchIntent.TRANSACTIONAL, confidence

        # Check commercial signals
        comm_overlap = tokens.intersection(COMMERCIAL_SIGNALS)
        if comm_overlap:
            confidence = min(0.95, 0.70 + len(comm_overlap) * 0.1)
            return SearchIntent.COMMERCIAL, confidence

        # Check navigational signals
        nav_overlap = tokens.intersection(NAVIGATIONAL_SIGNALS)
        if nav_overlap:
            confidence = min(0.95, 0.70 + len(nav_overlap) * 0.1)
            return SearchIntent.NAVIGATIONAL, confidence

        # Check informational signals
        info_overlap = tokens.intersection(INFORMATIONAL_SIGNALS)
        if info_overlap:
            confidence = min(0.95, 0.70 + len(info_overlap) * 0.1)
            return SearchIntent.INFORMATIONAL, confidence

        # Default fallback
        # Longer multi-word queries without transactional/commercial triggers tend to be informational
        word_count = len(tokens)
        if word_count >= 4:
            return SearchIntent.INFORMATIONAL, 0.75

        return SearchIntent.INFORMATIONAL, 0.60

