"""
neemSEO On-Page Auditor Service.
Orchestrates page fetching, parsing, rule evaluation, Core Web Vitals, scoring, and storage.
"""

from typing import Optional
from sqlalchemy.orm import Session

from neemseo.core.fetcher import PageFetcher, FetchResult
from neemseo.core.parser import PageParser, ParsedPage
from neemseo.rules.registry import registry
from neemseo.rules.base import Severity
from neemseo.core.scoring import AuditScorer, AuditReport
from neemseo.adapters.pagespeed import GooglePageSpeedAdapter
from neemseo.db.models import AuditRun, AuditIssue


class OnPageAuditor:
    def __init__(self, fetcher: Optional[PageFetcher] = None):
        self.fetcher = fetcher or PageFetcher()
        self.pagespeed_adapter = GooglePageSpeedAdapter()

    async def audit_url(
        self,
        url: str,
        keyword: Optional[str] = None,
        check_pagespeed: bool = False,
        db: Optional[Session] = None,
    ) -> AuditReport:
        """
        Executes a complete on-page SEO audit for a single URL.
        """
        # 1. Fetch page
        fetch_result: FetchResult = await self.fetcher.fetch(url)

        if not fetch_result.is_success and not fetch_result.html:
            # Handle fetch failure or blocking
            empty_page = ParsedPage(url=url)
            report = AuditScorer.generate_report(
                url=url,
                results=[],
                parsed_page=empty_page,
                status_code=fetch_result.status_code or 500,
                response_time_ms=fetch_result.response_time_ms,
            )
            # Add fetch failure issue
            from neemseo.rules.base import RuleResult, Category
            fetch_issue = RuleResult(
                rule_id="fetch_status",
                status=Severity.FAIL,
                title="Page Failed to Load",
                message=fetch_result.error or f"Received HTTP error code {fetch_result.status_code}",
                recommendation="Ensure the server is online, accessible publicly, and not blocking the neemSEO-Bot user agent.",
                impact_score=10,
                category=Category.TECHNICAL,
                why_it_matters="Search engines cannot index or rank pages that return HTTP errors or time out.",
                context={"status_code": fetch_result.status_code, "error": fetch_result.error},
            )
            report.prioritized_fixes.append(fetch_issue)
            report.all_results.append(fetch_issue)
            report.overall_score = 0
            report.grade = "F"
            report.failure_count = 1
            return report

        # 2. Parse HTML
        parser = PageParser(html=fetch_result.html, url=fetch_result.url)
        parsed_page: ParsedPage = parser.parse()

        # 3. Evaluate on-page checks
        context = {
            "keyword": keyword,
            "status_code": fetch_result.status_code,
            "headers": fetch_result.headers,
            "redirect_chain": [h.model_dump() for h in fetch_result.redirect_chain],
        }
        rule_results = registry.run_all(parsed_page, context=context)

        # 4. Core Web Vitals (optional or non-blocking)
        cwv_data = None
        if check_pagespeed:
            try:
                cwv = await self.pagespeed_adapter.get_core_web_vitals(fetch_result.url)
                cwv_data = cwv.model_dump()
            except Exception:
                pass

        # 5. Score and generate report
        report: AuditReport = AuditScorer.generate_report(
            url=fetch_result.url,
            results=rule_results,
            parsed_page=parsed_page,
            status_code=fetch_result.status_code,
            response_time_ms=fetch_result.response_time_ms,
            core_web_vitals=cwv_data,
        )

        # 6. Persist to DB if session provided
        if db:
            try:
                run_record = AuditRun(
                    url=report.url,
                    target_keyword=keyword,
                    status_code=report.status_code,
                    response_time_ms=report.response_time_ms,
                    overall_score=report.overall_score,
                    grade=report.grade,
                    word_count=parsed_page.word_count,
                    page_summary=report.page_summary,
                    core_web_vitals=report.core_web_vitals,
                    category_scores={k: v.model_dump() for k, v in report.category_scores.items()},
                )
                db.add(run_record)
                db.flush()

                for res in report.all_results:
                    issue = AuditIssue(
                        audit_run_id=run_record.id,
                        rule_id=res.rule_id,
                        status=res.status.value,
                        category=res.category.value,
                        title=res.title,
                        message=res.message,
                        recommendation=res.recommendation,
                        impact_score=res.impact_score,
                        context_data=res.context,
                    )
                    db.add(issue)

                db.commit()
            except Exception as e:
                db.rollback()

        return report
