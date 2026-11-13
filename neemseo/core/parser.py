"""
neemSEO HTML Parser module.
Extracts SEO-critical elements: titles, meta tags, headings H1-H6, links,
images, canonical, robots directives, OpenGraph, JSON-LD schema, and text metrics.
"""

import json
import re
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field


class HeadingItem(BaseModel):
    level: int  # 1 to 6
    text: str


class LinkItem(BaseModel):
    href: str
    absolute_url: str
    anchor_text: str
    is_internal: bool
    rel: List[str] = Field(default_factory=list)
    is_nofollow: bool = False


class ImageItem(BaseModel):
    src: str
    alt: Optional[str] = None
    title: Optional[str] = None
    has_alt: bool = False
    is_empty_alt: bool = False
    width: Optional[str] = None
    height: Optional[str] = None


class ParsedPage(BaseModel):
    url: str
    title: Optional[str] = None
    title_length: int = 0
    meta_description: Optional[str] = None
    meta_description_length: int = 0
    canonical_url: Optional[str] = None
    viewport: Optional[str] = None
    charset: Optional[str] = None
    language: Optional[str] = None

    # Directives
    robots_meta: Optional[str] = None
    is_noindex: bool = False
    is_nofollow: bool = False

    # Headings
    headings: List[HeadingItem] = Field(default_factory=list)
    h1_count: int = 0
    h1_list: List[str] = Field(default_factory=list)

    # Images
    images: List[ImageItem] = Field(default_factory=list)
    images_missing_alt: int = 0

    # Links
    links: List[LinkItem] = Field(default_factory=list)
    internal_links_count: int = 0
    external_links_count: int = 0

    # Social & Structured Data
    opengraph: Dict[str, str] = Field(default_factory=dict)
    twitter_card: Dict[str, str] = Field(default_factory=dict)
    hreflang: Dict[str, str] = Field(default_factory=dict)
    schema_jsonld: List[Dict[str, Any]] = Field(default_factory=list)

    # Content
    word_count: int = 0
    character_count: int = 0
    first_paragraph: str = ""
    body_text_sample: str = ""


class PageParser:
    """Parses raw HTML into a structured ParsedPage representation."""

    def __init__(self, html: str, url: str):
        self.raw_html = html or ""
        self.url = url
        self.parsed_url = urlparse(url)
        self.soup = BeautifulSoup(self.raw_html, "html.parser")

    def parse(self) -> ParsedPage:
        page = ParsedPage(url=self.url)

        # 1. HTML tag language
        html_tag = self.soup.find("html")
        if html_tag and html_tag.get("lang"):
            page.language = str(html_tag["lang"]).strip()

        # 2. Title
        title_tag = self.soup.find("title")
        if title_tag and title_tag.string:
            title_text = title_tag.get_text().strip()
            page.title = title_text
            page.title_length = len(title_text)

        # 3. Meta Tags
        for meta in self.soup.find_all("meta"):
            name = meta.get("name", "").lower()
            prop = meta.get("property", "").lower()
            content = meta.get("content", "").strip()

            if name == "description":
                page.meta_description = content
                page.meta_description_length = len(content)
            elif name == "robots":
                page.robots_meta = content
                content_lower = content.lower()
                if "noindex" in content_lower:
                    page.is_noindex = True
                if "nofollow" in content_lower:
                    page.is_nofollow = True
            elif name == "viewport":
                page.viewport = content
            elif meta.get("charset"):
                page.charset = meta.get("charset")

            # Open Graph
            if prop.startswith("og:"):
                page.opengraph[prop] = content

            # Twitter
            if name.startswith("twitter:"):
                page.twitter_card[name] = content

        # 4. Canonical Tag
        canonical_tag = self.soup.find("link", rel=lambda r: r and "canonical" in r)
        if canonical_tag and canonical_tag.get("href"):
            page.canonical_url = urljoin(self.url, canonical_tag.get("href").strip())

        # 5. Hreflang Tags
        for link in self.soup.find_all("link", rel=lambda r: r and "alternate" in r):
            if link.get("hreflang") and link.get("href"):
                page.hreflang[link["hreflang"].strip()] = urljoin(self.url, link["href"].strip())

        # 6. Headings (H1 to H6)
        heading_tags = self.soup.find_all(re.compile(r"^h[1-6]$", re.I))
        for h in heading_tags:
            lvl = int(h.name[1])
            text = h.get_text().strip()
            if text:
                page.headings.append(HeadingItem(level=lvl, text=text))
                if lvl == 1:
                    page.h1_list.append(text)
        page.h1_count = len(page.h1_list)

        # 7. Images
        for img in self.soup.find_all("img"):
            src = img.get("src") or img.get("data-src") or ""
            alt = img.get("alt")
            title = img.get("title")
            has_alt = alt is not None
            is_empty_alt = has_alt and len(alt.strip()) == 0

            image_item = ImageItem(
                src=urljoin(self.url, src),
                alt=alt,
                title=title,
                has_alt=has_alt,
                is_empty_alt=is_empty_alt,
                width=img.get("width"),
                height=img.get("height"),
            )
            page.images.append(image_item)
            if not has_alt or is_empty_alt:
                page.images_missing_alt += 1

        # 8. Links
        base_domain = self.parsed_url.netloc.lower()
        for a in self.soup.find_all("a", href=True):
            raw_href = a["href"].strip()
            if not raw_href or raw_href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue

            abs_url = urljoin(self.url, raw_href)
            link_domain = urlparse(abs_url).netloc.lower()
            is_internal = link_domain == "" or link_domain == base_domain

            rels = []
            rel_attr = a.get("rel")
            if isinstance(rel_attr, list):
                rels = [r.lower() for r in rel_attr]
            elif isinstance(rel_attr, str):
                rels = [r.lower() for r in rel_attr.split()]

            link_item = LinkItem(
                href=raw_href,
                absolute_url=abs_url,
                anchor_text=a.get_text().strip(),
                is_internal=is_internal,
                rel=rels,
                is_nofollow="nofollow" in rels,
            )
            page.links.append(link_item)
            if is_internal:
                page.internal_links_count += 1
            else:
                page.external_links_count += 1

        # 9. Schema.org JSON-LD
        for script in self.soup.find_all("script", type="application/ld+json"):
            if script.string:
                try:
                    data = json.loads(script.string.strip())
                    if isinstance(data, list):
                        page.schema_jsonld.extend(data)
                    elif isinstance(data, dict):
                        page.schema_jsonld.append(data)
                except Exception:
                    # Invalid JSON-LD block
                    pass

        # 10. Content & Word Count
        # Remove script and style tags from text consideration
        for unwanted in self.soup(["script", "style", "noscript", "svg"]):
            unwanted.extract()

        body = self.soup.find("body") or self.soup
        full_text = body.get_text(separator=" ", strip=True)
        words = re.findall(r"\b[\w'-]+\b", full_text)
        page.word_count = len(words)
        page.character_count = len(full_text)
        page.body_text_sample = full_text[:400]

        # First meaningful paragraph
        p_tag = body.find("p")
        if p_tag:
            p_text = p_tag.get_text().strip()
            if p_text:
                page.first_paragraph = p_text

        return page
