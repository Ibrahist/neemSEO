"""
neemSEO Crawler Post-Analysis and Comparison Engine.
Identifies broken links, redirect chains, duplicate content, orphan pages,
internal link equity, and computes diffs between two crawls.
"""

from collections import defaultdict
from typing import List, Dict, Any, Set
from neemseo.crawler.schemas import (
    BrokenLinkItem,
    RedirectChainItem,
    DuplicateGroup,
    OrphanPageItem,
    CrawlSummaryReport,
    CrawlDiffReport,
    CrawlStatus,
)


class CrawlAnalyzer:
    @classmethod
    def analyze(
        cls,
        crawl_id: str,
        seed_url: str,
        pages: List[Dict[str, Any]],
        links: List[Dict[str, Any]],
        sitemap_urls: Optional[List[str]] = None,
        duration_seconds: float = 0.0,
        status: CrawlStatus = CrawlStatus.COMPLETED,
    ) -> CrawlSummaryReport:
        sitemap_urls = sitemap_urls or []
        sitemap_set = set(sitemap_urls)

        # 1. Map pages by URL and track incoming internal links
        crawled_urls = {p["url"] for p in pages}
        inlinks_count: Dict[str, int] = defaultdict(int)
        outlinks_count: Dict[str, int] = defaultdict(int)

        # 2. Broken links and redirect chains
        broken_links: List[BrokenLinkItem] = []
        for l in links:
            source = l.get("source_url", "")
            target = l.get("target_url", "")
            status_code = l.get("status_code", 200)
            is_internal = l.get("is_internal", True)
            anchor = l.get("anchor_text", "")

            if is_internal:
                inlinks_count[target] += 1
                outlinks_count[source] += 1

            if status_code >= 400 or status_code == 0:
                broken_links.append(
                    BrokenLinkItem(
                        target_url=target,
                        source_url=source,
                        anchor_text=anchor,
                        status_code=status_code,
                        is_internal=is_internal,
                    )
                )

        # 3. Duplicate titles and descriptions
        title_groups: Dict[str, List[str]] = defaultdict(list)
        desc_groups: Dict[str, List[str]] = defaultdict(list)
        redirect_chains: List[RedirectChainItem] = []
        noindex_pages: List[str] = []
        blocked_robots_pages: List[str] = []
        depth_distribution: Dict[int, int] = defaultdict(int)
        scores: List[int] = []

        for p in pages:
            url = p["url"]
            depth = p.get("depth", 0)
            score = p.get("overall_score", 100)
            scores.append(score)
            depth_distribution[depth] += 1

            if p.get("is_noindex"):
                noindex_pages.append(url)
            if p.get("is_blocked_robots"):
                blocked_robots_pages.append(url)

            # Check redirect chain
            chain = p.get("redirect_chain", [])
            if chain and len(chain) > 0:
                redirect_chains.append(
                    RedirectChainItem(
                        initial_url=p.get("initial_url", url),
                        final_url=url,
                        hops_count=len(chain),
                        chain=chain,
                    )
                )

            # Group for duplicates
            title = (p.get("title") or "").strip()
            if title and len(title) > 3:
                title_groups[title].append(url)

            desc = (p.get("meta_description") or "").strip()
            if desc and len(desc) > 10:
                desc_groups[desc].append(url)

        duplicate_titles = [
            DuplicateGroup(item_type="title", content=title, count=len(urls), urls=urls)
            for title, urls in title_groups.items()
            if len(urls) > 1
        ]
        duplicate_descriptions = [
            DuplicateGroup(item_type="meta_description", content=desc, count=len(urls), urls=urls)
            for desc, urls in desc_groups.items()
            if len(urls) > 1
        ]

        # 4. Orphan Pages: URLs discovered in sitemap that have 0 incoming internal links
        orphan_pages: List[OrphanPageItem] = []
        # Check all sitemap URLs
        for s_url in sitemap_set:
            if inlinks_count.get(s_url, 0) == 0 and s_url != seed_url:
                orphan_pages.append(
                    OrphanPageItem(
                        url=s_url,
                        sitemap_source=True,
                        internal_incoming_links=0,
                    )
                )

        # Also check crawled pages (depth > 0) with 0 inlinks
        for p in pages:
            u = p["url"]
            if u != seed_url and inlinks_count.get(u, 0) == 0 and u not in {o.url for o in orphan_pages}:
                orphan_pages.append(
                    OrphanPageItem(
                        url=u,
                        sitemap_source=u in sitemap_set,
                        internal_incoming_links=0,
                    )
                )

        # 5. Top inlinked pages
        top_inlinked = sorted(
            [{"url": u, "inlinks": count} for u, count in inlinks_count.items() if u in crawled_urls],
            key=lambda x: x["inlinks"],
            reverse=True,
        )[:10]

        # 6. Score distribution
        score_dist = {"90-100": 0, "70-89": 0, "50-69": 0, "below-50": 0}
        for s in scores:
            if s >= 90:
                score_dist["90-100"] += 1
            elif s >= 70:
                score_dist["70-89"] += 1
            elif s >= 50:
                score_dist["50-69"] += 1
            else:
                score_dist["below-50"] += 1

        avg_score = round(sum(scores) / len(scores), 1) if scores else 100.0

        return CrawlSummaryReport(
            crawl_id=crawl_id,
            seed_url=seed_url,
            status=status,
            total_pages_crawled=len(pages),
            total_links_found=len(links),
            sitemap_urls_discovered=len(sitemap_urls),
            duration_seconds=round(duration_seconds, 2),
            average_health_score=avg_score,
            score_distribution=score_dist,
            broken_links=broken_links[:100],  # cap in summary
            broken_links_count=len(broken_links),
            redirect_chains=redirect_chains[:50],
            redirect_chains_count=len(redirect_chains),
            duplicate_titles=duplicate_titles,
            duplicate_descriptions=duplicate_descriptions,
            orphan_pages=orphan_pages[:100],
            orphan_pages_count=len(orphan_pages),
            noindex_pages=noindex_pages,
            blocked_robots_pages=blocked_robots_pages,
            depth_distribution=dict(depth_distribution),
            top_inlinked_pages=top_inlinked,
        )

    @classmethod
    def compare_crawls(
        cls,
        base_report: CrawlSummaryReport,
        target_report: CrawlSummaryReport,
    ) -> CrawlDiffReport:
        """
        Compares an earlier crawl (base) against a recent crawl (target) of the same site.
        """
        score_change = round(target_report.average_health_score - base_report.average_health_score, 1)
        pages_change = target_report.total_pages_crawled - base_report.total_pages_crawled

        base_broken_targets = {b.target_url for b in base_report.broken_links}
        target_broken_targets = {b.target_url for b in target_report.broken_links}

        new_broken = [b for b in target_report.broken_links if b.target_url not in base_broken_targets]
        resolved_broken = [b for b in base_report.broken_links if b.target_url not in target_broken_targets]

        new_duplicates = max(0, len(target_report.duplicate_titles) - len(base_report.duplicate_titles))
        resolved_duplicates = max(0, len(base_report.duplicate_titles) - len(target_report.duplicate_titles))

        return CrawlDiffReport(
            base_crawl_id=base_report.crawl_id,
            target_crawl_id=target_report.crawl_id,
            seed_url=target_report.seed_url,
            score_change=score_change,
            pages_change=pages_change,
            new_broken_links=new_broken,
            resolved_broken_links=resolved_broken,
            new_duplicates=new_duplicates,
            resolved_duplicates=resolved_duplicates,
        )

