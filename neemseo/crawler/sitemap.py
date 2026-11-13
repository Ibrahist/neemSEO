"""
neemSEO Sitemap Parser.
Discovers and extracts URLs from standard sitemap.xml files, sitemap indexes, and robots.txt.
"""

import xml.etree.ElementTree as ET
from typing import List, Set, Optional
from urllib.parse import urljoin, urlparse
import httpx

from neemseo.core.config import settings


class SitemapParser:
    def __init__(self, user_agent: Optional[str] = None, timeout: float = 10.0):
        self.user_agent = user_agent or settings.USER_AGENT
        self.timeout = timeout

    async def discover_sitemaps(self, base_url: str) -> List[str]:
        """
        Discovers sitemap URLs by checking robots.txt and standard locations.
        """
        parsed = urlparse(base_url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        sitemaps: List[str] = []

        headers = {"User-Agent": self.user_agent}

        # 1. Check robots.txt for Sitemap directives
        robots_url = urljoin(origin, "/robots.txt")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.get(robots_url, headers=headers)
                if r.status_code == 200:
                    for line in r.text.splitlines():
                        if line.lower().strip().startswith("sitemap:"):
                            parts = line.split(":", 1)
                            if len(parts) == 2:
                                sitemaps.append(parts[1].strip())
        except Exception:
            pass

        # 2. Check standard sitemap paths if none found in robots.txt
        if not sitemaps:
            common_candidates = [
                urljoin(origin, "/sitemap.xml"),
                urljoin(origin, "/sitemap_index.xml"),
                urljoin(origin, "/sitemap/sitemap.xml"),
            ]
            for candidate in common_candidates:
                try:
                    async with httpx.AsyncClient(timeout=self.timeout) as client:
                        r = await client.head(candidate, headers=headers, follow_redirects=True)
                        if r.status_code == 200 and "xml" in r.headers.get("content-type", "").lower():
                            sitemaps.append(candidate)
                            break
                except Exception:
                    continue

        return list(dict.fromkeys(sitemaps))

    def parse_sitemap_xml(self, xml_content: str) -> tuple[List[str], List[str]]:
        """
        Parses sitemap XML text.
        Returns a tuple of (page_urls, child_sitemap_urls).
        """
        page_urls: List[str] = []
        child_sitemaps: List[str] = []

        if not xml_content or not xml_content.strip():
            return page_urls, child_sitemaps

        try:
            root = ET.fromstring(xml_content.strip())
        except ET.ParseError:
            return page_urls, child_sitemaps

        # Remove XML namespace if present
        tag = root.tag.lower()
        if "}" in tag:
            tag = tag.split("}")[1]

        # Case 1: Sitemap Index
        if tag == "sitemapindex":
            for sitemap in root:
                for elem in sitemap:
                    elem_tag = elem.tag.split("}")[1] if "}" in elem.tag else elem.tag
                    if elem_tag.lower() == "loc" and elem.text:
                        child_sitemaps.append(elem.text.strip())

        # Case 2: Regular URL set
        elif tag == "urlset":
            for url_elem in root:
                for elem in url_elem:
                    elem_tag = elem.tag.split("}")[1] if "}" in elem.tag else elem.tag
                    if elem_tag.lower() == "loc" and elem.text:
                        page_urls.append(elem.text.strip())

        return page_urls, child_sitemaps

    async def fetch_and_extract_urls(
        self,
        sitemap_url: str,
        max_sitemaps: int = 5,
        max_urls: int = 1000,
    ) -> List[str]:
        """
        Fetches a sitemap, traversing index files if necessary, and returns all unique page URLs.
        """
        to_fetch = [sitemap_url]
        visited_sitemaps: Set[str] = set()
        collected_urls: Set[str] = set()

        headers = {"User-Agent": self.user_agent}

        while to_fetch and len(visited_sitemaps) < max_sitemaps and len(collected_urls) < max_urls:
            current_sitemap = to_fetch.pop(0)
            if current_sitemap in visited_sitemaps:
                continue
            visited_sitemaps.add(current_sitemap)

            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.get(current_sitemap, headers=headers, follow_redirects=True)
                    if resp.status_code != 200:
                        continue
                    urls, children = self.parse_sitemap_xml(resp.text)
                    for u in urls:
                        if len(collected_urls) < max_urls:
                            collected_urls.add(u)
                    for child in children:
                        if child not in visited_sitemaps:
                            to_fetch.append(child)
            except Exception:
                continue

        return list(collected_urls)

