"""
Unit tests for the HTML Parser.
"""

from neemseo.core.parser import PageParser


SAMPLE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>neemSEO: Open Source SEO Audit Tool for Modern Teams</title>
  <meta name="description" content="neemSEO is a fast, transparent on-page SEO analyzer that delivers actionable technical audit fixes.">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/blog/seo-guide">
  <meta property="og:title" content="neemSEO Guide">
  <meta property="og:description" content="Complete guide to on-page SEO.">
  <meta property="og:image" content="https://example.com/cover.jpg">
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "On-Page SEO Checklist"
    }
  </script>
</head>
<body>
  <h1>Mastering On-Page SEO in 2026</h1>
  <p>Search engine optimization requires attention to metadata, technical semantics, and content value.</p>
  <h2>Heading 2 Subtitle</h2>
  <p>Content paragraph with some words here to ensure our word count parser functions accurately.</p>
  <img src="/logo.png" alt="Company Logo" width="120" height="40">
  <img src="/banner.jpg">
  <a href="/about">About Us</a>
  <a href="https://google.com" rel="nofollow">External Link</a>
</body>
</html>
"""


def test_parser_title_and_description():
    parser = PageParser(SAMPLE_HTML, "https://example.com/blog/seo-guide")
    page = parser.parse()

    assert page.title == "neemSEO: Open Source SEO Audit Tool for Modern Teams"
    assert page.title_length == len(page.title)
    assert "neemSEO is a fast" in page.meta_description
    assert page.canonical_url == "https://example.com/blog/seo-guide"
    assert page.viewport == "width=device-width, initial-scale=1.0"
    assert page.is_noindex is False
    assert page.is_nofollow is False


def test_parser_headings():
    parser = PageParser(SAMPLE_HTML, "https://example.com/blog/seo-guide")
    page = parser.parse()

    assert page.h1_count == 1
    assert page.h1_list[0] == "Mastering On-Page SEO in 2026"
    assert len(page.headings) == 2
    assert page.headings[0].level == 1
    assert page.headings[1].level == 2


def test_parser_images_and_links():
    parser = PageParser(SAMPLE_HTML, "https://example.com/blog/seo-guide")
    page = parser.parse()

    assert len(page.images) == 2
    assert page.images[0].has_alt is True
    assert page.images[1].has_alt is False
    assert page.images_missing_alt == 1

    assert len(page.links) == 2
    assert page.internal_links_count == 1
    assert page.external_links_count == 1


def test_parser_schema_and_opengraph():
    parser = PageParser(SAMPLE_HTML, "https://example.com/blog/seo-guide")
    page = parser.parse()

    assert len(page.schema_jsonld) == 1
    assert page.schema_jsonld[0]["@type"] == "Article"
    assert page.opengraph.get("og:title") == "neemSEO Guide"
    assert page.word_count > 20
