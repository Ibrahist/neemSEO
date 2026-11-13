"""
Unit tests for the Sitemap Parser.
"""

from neemseo.crawler.sitemap import SitemapParser

SAMPLE_URLSET_XML = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-01-01</lastmod>
  </url>
  <url>
    <loc>https://example.com/about</loc>
  </url>
  <url>
    <loc>https://example.com/pricing</loc>
  </url>
</urlset>
"""

SAMPLE_INDEX_XML = """<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/post-sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/page-sitemap.xml</loc>
  </sitemap>
</sitemapindex>
"""


def test_parse_urlset_xml():
    parser = SitemapParser()
    urls, children = parser.parse_sitemap_xml(SAMPLE_URLSET_XML)

    assert len(urls) == 3
    assert "https://example.com/" in urls
    assert "https://example.com/pricing" in urls
    assert len(children) == 0


def test_parse_sitemap_index_xml():
    parser = SitemapParser()
    urls, children = parser.parse_sitemap_xml(SAMPLE_INDEX_XML)

    assert len(urls) == 0
    assert len(children) == 2
    assert "https://example.com/post-sitemap.xml" in children


def test_parse_invalid_xml():
    parser = SitemapParser()
    urls, children = parser.parse_sitemap_xml("Not valid xml content")

    assert len(urls) == 0
    assert len(children) == 0
