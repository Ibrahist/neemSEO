"""
Unit tests for on-page SEO check rules.
"""

from neemseo.core.parser import PageParser
from neemseo.rules.title_rule import TitleRule
from neemseo.rules.description_rule import MetaDescriptionRule
from neemseo.rules.heading_rule import HeadingRule
from neemseo.rules.image_rule import ImageAltRule
from neemseo.rules.canonical_rule import CanonicalRule
from neemseo.rules.robots_rule import RobotsDirectivesRule
from neemseo.rules.viewport_rule import ViewportRule
from neemseo.rules.content_rule import ContentOptimizationRule
from neemseo.rules.base import Severity


def test_title_rule_pass():
    html = "<title>neemSEO: Free On-Page SEO Auditor & Analyzer Tool</title>"
    page = PageParser(html, "https://example.com").parse()
    rule = TitleRule()
    res = rule.evaluate(page)
    assert res.status == Severity.PASS


def test_title_rule_fail_when_missing():
    html = "<html><body><h1>Hello</h1></body></html>"
    page = PageParser(html, "https://example.com").parse()
    rule = TitleRule()
    res = rule.evaluate(page)
    assert res.status == Severity.FAIL
    assert res.impact_score == 9


def test_meta_description_rule():
    # Missing description
    html = "<title>Page Title</title>"
    page = PageParser(html, "https://example.com").parse()
    rule = MetaDescriptionRule()
    res = rule.evaluate(page)
    assert res.status == Severity.FAIL

    # Optimal description (130 chars)
    optimal_desc = "Discover neemSEO, an open-source SEO suite alternative to expensive tools. Fast audits, site crawls, and keyword metrics."
    html_ok = f'<meta name="description" content="{optimal_desc}">'
    page_ok = PageParser(html_ok, "https://example.com").parse()
    res_ok = rule.evaluate(page_ok)
    assert res_ok.status == Severity.PASS


def test_heading_rule_multiple_h1():
    html = "<h1>First Title</h1><h1>Second Title</h1>"
    page = PageParser(html, "https://example.com").parse()
    rule = HeadingRule()
    res = rule.evaluate(page)
    assert res.status == Severity.WARN
    assert "Found 2 <h1> tags" in res.message


def test_heading_rule_missing_h1():
    html = "<h2>Subtitle</h2>"
    page = PageParser(html, "https://example.com").parse()
    rule = HeadingRule()
    res = rule.evaluate(page)
    assert res.status == Severity.FAIL


def test_image_alt_rule():
    html = '<img src="/test.jpg"><img src="/pic.png">'
    page = PageParser(html, "https://example.com").parse()
    rule = ImageAltRule()
    res = rule.evaluate(page)
    assert res.status == Severity.FAIL
    assert res.impact_score == 7


def test_robots_noindex_warning():
    html = '<meta name="robots" content="noindex, follow">'
    page = PageParser(html, "https://example.com").parse()
    rule = RobotsDirectivesRule()
    res = rule.evaluate(page)
    assert res.status == Severity.WARN
    assert "noindex" in res.message


def test_viewport_missing():
    html = "<html><head><title>Test</title></head></html>"
    page = PageParser(html, "https://example.com").parse()
    rule = ViewportRule()
    res = rule.evaluate(page)
    assert res.status == Severity.FAIL


def test_content_keyword_targeting():
    # Long text (>300 words for optimal depth)
    long_body = " ".join(["shoes running comfort durable athletic quality footwear"] * 60)
    html = f"""
    <title>Buy Best Shoes Online</title>
    <body>
      <h1>Top Athletic Shoes Store</h1>
      <p>Looking to buy shoes? We have the highest quality running shoes.</p>
      <p>{long_body}</p>
    </body>
    """
    page = PageParser(html, "https://example.com").parse()
    rule = ContentOptimizationRule()

    # When keyword is present in title, h1, intro
    res_pass = rule.evaluate(page, context={"keyword": "shoes"})
    assert res_pass.status == Severity.PASS

    # When keyword is missing
    res_missing = rule.evaluate(page, context={"keyword": "backpacks"})
    assert res_missing.status == Severity.WARN
    assert "missing" in res_missing.message.lower()
