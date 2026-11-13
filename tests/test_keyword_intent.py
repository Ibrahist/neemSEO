"""
Tests for Search Intent Classification.
"""

from neemseo.keywords.intent import IntentClassifier
from neemseo.keywords.schemas import SearchIntent


def test_transactional_intent():
    intent, conf = IntentClassifier.classify("buy seo software cheap")
    assert intent == SearchIntent.TRANSACTIONAL
    assert conf >= 0.75

    intent2, _ = IntentClassifier.classify("ahrefs discount coupon code")
    assert intent2 == SearchIntent.TRANSACTIONAL

    intent3, _ = IntentClassifier.classify("seo agency for sale")
    assert intent3 == SearchIntent.TRANSACTIONAL


def test_commercial_intent():
    intent, conf = IntentClassifier.classify("best semrush alternatives 2026")
    assert intent == SearchIntent.COMMERCIAL
    assert conf >= 0.70

    intent2, _ = IntentClassifier.classify("ahrefs vs semrush comparison")
    assert intent2 == SearchIntent.COMMERCIAL

    intent3, _ = IntentClassifier.classify("screaming frog reviews and pros and cons")
    assert intent3 == SearchIntent.COMMERCIAL


def test_navigational_intent():
    intent, conf = IntentClassifier.classify("neemseo login portal")
    assert intent == SearchIntent.NAVIGATIONAL
    assert conf >= 0.70

    intent2, _ = IntentClassifier.classify("ahrefs customer support official website")
    assert intent2 == SearchIntent.NAVIGATIONAL


def test_informational_intent():
    intent, conf = IntentClassifier.classify("how to fix duplicate title tags in html")
    assert intent == SearchIntent.INFORMATIONAL
    assert conf >= 0.75

    intent2, _ = IntentClassifier.classify("what is canonical url and how it works")
    assert intent2 == SearchIntent.INFORMATIONAL

    intent3, _ = IntentClassifier.classify("complete on-page seo guide checklist")
    assert intent3 == SearchIntent.INFORMATIONAL

