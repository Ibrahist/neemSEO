"""
neemSEO HTTP Fetcher module.
Handles async page fetching, redirects tracking, timing, robots.txt compliance, and backoff retries.
"""

import asyncio
import time
from typing import List, Optional, Tuple, Dict
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
import httpx
from pydantic import BaseModel, Field

from neemseo.core.config import settings


class RedirectHop(BaseModel):
    url: str
    status_code: int


class FetchResult(BaseModel):
    url: str
    initial_url: str
    status_code: int = 0
    html: str = ""
    headers: Dict[str, str] = Field(default_factory=dict)
    redirect_chain: List[RedirectHop] = Field(default_factory=list)
    response_time_ms: float = 0.0
    is_blocked_by_robots: bool = False
    robots_txt_url: Optional[str] = None
    error: Optional[str] = None

    @property
    def is_success(self) -> bool:
        return 200 <= self.status_code < 400 and not self.error


class PageFetcher:
    def __init__(
        self,
        user_agent: Optional[str] = None,
        timeout: float = settings.REQUEST_TIMEOUT,
        max_redirects: int = settings.MAX_REDIRECTS,
        respect_robots: bool = settings.RESPECT_ROBOTS_TXT,
        verify_ssl: bool = settings.VERIFY_SSL,
    ):
        self.user_agent = user_agent or settings.USER_AGENT
        self.timeout = timeout
        self.max_redirects = max_redirects
        self.respect_robots = respect_robots
        self.verify_ssl = verify_ssl
        self._robots_cache: Dict[str, Optional[RobotFileParser]] = {}

    def _normalize_url(self, url: str) -> str:
        url = url.strip()
        if not (url.startswith("http://") or url.startswith("https://")):
            url = "https://" + url
        return url

    async def get_robots_parser(self, url: str) -> Optional[RobotFileParser]:
        """Fetch and parse robots.txt for the given URL's origin domain."""
        parsed = urlparse(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin in self._robots_cache:
            return self._robots_cache[origin]

        robots_url = urljoin(origin, "/robots.txt")
        parser = RobotFileParser()
        parser.set_url(robots_url)

        try:
            headers = {"User-Agent": self.user_agent}
            async with httpx.AsyncClient(timeout=5.0, verify=self.verify_ssl) as client:
                resp = await client.get(robots_url, headers=headers)
                if resp.status_code == 200:
                    parser.parse(resp.text.splitlines())
                    self._robots_cache[origin] = parser
                    return parser
                elif resp.status_code in (401, 403):
                    # Disallow all if explicitly forbidden
                    parser.parse(["User-agent: *", "Disallow: /"])
                    self._robots_cache[origin] = parser
                    return parser
                else:
                    # 404 or other status means no restrictions
                    parser.parse(["User-agent: *", "Allow: /"])
                    self._robots_cache[origin] = parser
                    return parser
        except Exception:
            # If robots.txt cannot be reached, permit crawling conservatively
            self._robots_cache[origin] = None
            return None

    async def is_allowed_by_robots(self, url: str) -> bool:
        """Check if neemSEO crawler is permitted to access the target URL."""
        if not self.respect_robots:
            return True
        parser = await self.get_robots_parser(url)
        if parser is None:
            return True
        # Check specific bot name then general wildcard
        can_fetch = parser.can_fetch("neemSEO-Bot", url) or parser.can_fetch("*", url)
        return can_fetch

    async def fetch(
        self,
        url: str,
        max_retries: int = 2,
        backoff_factor: float = 0.5,
    ) -> FetchResult:
        """
        Fetch a page, record timing, redirect chain, headers, and handle retries.
        """
        normalized_url = self._normalize_url(url)
        result = FetchResult(
            url=normalized_url,
            initial_url=normalized_url,
        )

        # 1. Check robots.txt
        if self.respect_robots:
            parsed = urlparse(normalized_url)
            result.robots_txt_url = urljoin(f"{parsed.scheme}://{parsed.netloc}", "/robots.txt")
            allowed = await self.is_allowed_by_robots(normalized_url)
            if not allowed:
                result.is_blocked_by_robots = True
                result.error = "Crawling forbidden by robots.txt"
                return result

        # 2. Perform HTTP request with custom client
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

        current_url = normalized_url
        redirect_chain: List[RedirectHop] = []

        for attempt in range(max_retries + 1):
            try:
                start_time = time.perf_counter()
                async with httpx.AsyncClient(
                    follow_redirects=True,
                    max_redirects=self.max_redirects,
                    timeout=self.timeout,
                    verify=self.verify_ssl,
                ) as client:
                    response = await client.get(current_url, headers=headers)
                    elapsed = (time.perf_counter() - start_time) * 1000

                    # Process redirect history if any
                    for hop in response.history:
                        redirect_chain.append(
                            RedirectHop(
                                url=str(hop.url),
                                status_code=hop.status_code,
                            )
                        )

                    result.url = str(response.url)
                    result.status_code = response.status_code
                    result.html = response.text
                    result.headers = dict(response.headers)
                    result.redirect_chain = redirect_chain
                    result.response_time_ms = round(elapsed, 2)
                    result.error = None
                    return result

            except httpx.TimeoutException:
                if attempt < max_retries:
                    await asyncio.sleep(backoff_factor * (2**attempt))
                    continue
                result.error = f"Request timed out after {self.timeout}s"
                return result
            except httpx.ConnectError as e:
                result.error = f"Connection error: {str(e)}"
                return result
            except Exception as e:
                if attempt < max_retries:
                    await asyncio.sleep(backoff_factor * (2**attempt))
                    continue
                result.error = f"Fetch failed: {str(e)}"
                return result

        return result
