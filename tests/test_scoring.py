"""
Unit tests for the Scoring Engine.
"""

from neemseo.core.scoring import AuditScorer
from neemseo.rules.base import RuleResult, Severity, Category


def test_scorer_perfect_pass():
    results = [
        RuleResult(
            rule_id="r1",
            status=Severity.PASS,
            title="Good Title",
            message="Optimal",
            recommendation="",
            impact_score=0,
            category=Category.CONTENT,
        ),
        RuleResult(
            rule_id="r2",
            status=Severity.PASS,
            title="Good Headings",
            message="Optimal",
            recommendation="",
            impact_score=0,
            category=Category.TECHNICAL,
        ),
    ]

    report = AuditScorer.generate_report(
        url="https://example.com",
        results=results,
    )

    assert report.overall_score == 100
    assert report.grade == "A"
    assert report.passed_count == 2
    assert report.failure_count == 0
    assert len(report.prioritized_fixes) == 0


def test_scorer_deductions_and_priority():
    results = [
        RuleResult(
            rule_id="r1",
            status=Severity.FAIL,
            title="Critical H1 Issue",
            message="Missing H1",
            recommendation="Add H1",
            impact_score=8,
            category=Category.CONTENT,
        ),
        RuleResult(
            rule_id="r2",
            status=Severity.WARN,
            title="Minor Alt Issue",
            message="Some missing alts",
            recommendation="Add alts",
            impact_score=4,
            category=Category.TECHNICAL,
        ),
    ]

    report = AuditScorer.generate_report(
        url="https://example.com",
        results=results,
    )

    assert report.overall_score < 90
    assert len(report.prioritized_fixes) == 2
    # Critical FAIL must be first in prioritized fixes
    assert report.prioritized_fixes[0].rule_id == "r1"
