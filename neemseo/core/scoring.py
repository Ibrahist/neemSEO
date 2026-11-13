"""
neemSEO Scoring and Report Generator.
Computes overall health scores (0-100), category score breakdowns,
and sorts issues into a prioritized fix list.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from neemseo.rules.base import RuleResult, Severity, Category
from neemseo.core.parser import ParsedPage


class CategoryScore(BaseModel):
    category: str
    score: int
    passed: int
    warned: int
    failed: int


class AuditReport(BaseModel):
    url: str
    status_code: int = 200
    response_time_ms: float = 0.0
    overall_score: int = 100
    grade: str = "A"

    total_checks: int = 0
    passed_count: int = 0
    warning_count: int = 0
    failure_count: int = 0

    category_scores: Dict[str, CategoryScore] = Field(default_factory=dict)
    prioritized_fixes: List[RuleResult] = Field(default_factory=list)
    all_results: List[RuleResult] = Field(default_factory=list)

    page_summary: Dict[str, Any] = Field(default_factory=dict)
    core_web_vitals: Optional[Dict[str, Any]] = None


class AuditScorer:
    """Calculates weighted SEO health score and organizes action items."""

    @staticmethod
    def calculate_grade(score: int) -> str:
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 50:
            return "D"
        else:
            return "F"

    @classmethod
    def generate_report(
        cls,
        url: str,
        results: List[RuleResult],
        parsed_page: Optional[ParsedPage] = None,
        status_code: int = 200,
        response_time_ms: float = 0.0,
        core_web_vitals: Optional[Dict[str, Any]] = None,
    ) -> AuditReport:
        passed = [r for r in results if r.status == Severity.PASS]
        warned = [r for r in results if r.status == Severity.WARN]
        failed = [r for r in results if r.status == Severity.FAIL]

        # Calculate penalty deduction
        total_deduction = 0.0
        for f in failed:
            weight = f.impact_score / 10.0
            total_deduction += 16.0 * weight

        for w in warned:
            weight = w.impact_score / 10.0
            total_deduction += 6.0 * weight

        raw_score = max(0, min(100, round(100.0 - total_deduction)))
        grade = cls.calculate_grade(raw_score)

        # Prioritized action list: failed first, then warned, sorted by impact_score descending
        prioritized = sorted(
            failed + warned,
            key=lambda item: (item.status == Severity.FAIL, item.impact_score),
            reverse=True,
        )

        # Category breakdowns
        categories = set(r.category for r in results)
        category_scores: Dict[str, CategoryScore] = {}

        for cat in categories:
            cat_results = [r for r in results if r.category == cat]
            c_pass = sum(1 for r in cat_results if r.status == Severity.PASS)
            c_warn = sum(1 for r in cat_results if r.status == Severity.WARN)
            c_fail = sum(1 for r in cat_results if r.status == Severity.FAIL)

            cat_deduction = sum(16.0 * (r.impact_score / 10.0) for r in cat_results if r.status == Severity.FAIL)
            cat_deduction += sum(6.0 * (r.impact_score / 10.0) for r in cat_results if r.status == Severity.WARN)
            cat_score = max(0, min(100, round(100.0 - cat_deduction)))

            category_scores[cat.value] = CategoryScore(
                category=cat.value,
                score=cat_score,
                passed=c_pass,
                warned=c_warn,
                failed=c_fail,
            )

        page_summary = {}
        if parsed_page:
            page_summary = {
                "title": parsed_page.title,
                "title_length": parsed_page.title_length,
                "meta_description": parsed_page.meta_description,
                "meta_description_length": parsed_page.meta_description_length,
                "canonical_url": parsed_page.canonical_url,
                "word_count": parsed_page.word_count,
                "h1_count": parsed_page.h1_count,
                "h1_list": parsed_page.h1_list,
                "total_images": len(parsed_page.images),
                "images_missing_alt": parsed_page.images_missing_alt,
                "internal_links_count": parsed_page.internal_links_count,
                "external_links_count": parsed_page.external_links_count,
                "is_noindex": parsed_page.is_noindex,
                "is_nofollow": parsed_page.is_nofollow,
            }

        return AuditReport(
            url=url,
            status_code=status_code,
            response_time_ms=response_time_ms,
            overall_score=raw_score,
            grade=grade,
            total_checks=len(results),
            passed_count=len(passed),
            warning_count=len(warned),
            failure_count=len(failed),
            category_scores=category_scores,
            prioritized_fixes=prioritized,
            all_results=results,
            page_summary=page_summary,
            core_web_vitals=core_web_vitals,
        )
