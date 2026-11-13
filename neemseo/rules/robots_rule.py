"""
Rule: Robots Directives and Indexability.
Detects noindex, nofollow, and other search engine blocking directives.
"""

from typing import Optional, Dict, Any
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class RobotsDirectivesRule(BaseRule):
    rule_id = "robots_directives"
    title = "Robots Directives & Indexability"
    category = Category.TECHNICAL
    default_impact = 10
    description = "Checks for meta robots tags that may block search engine indexing or link equity flow."
    why_it_matters = (
        "A 'noindex' directive instructs search engines not to display this page in search results. "
        "While intentional for private utility pages or thank-you pages, an accidental noindex on a public landing page completely destroys search visibility."
    )
    how_to_fix = "If this page is intended to be indexed, remove the 'noindex' directive from your meta robots tag."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        if page.is_noindex:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Page Has 'noindex' Directive",
                message=f"Meta robots tag contains 'noindex' ({page.robots_meta}). Search engines will not index this page.",
                recommendation=self.how_to_fix,
                impact_score=9,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"robots_meta": page.robots_meta, "is_noindex": True},
            )

        if page.is_nofollow:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Page Has 'nofollow' Directive",
                message=f"Meta robots tag contains 'nofollow' ({page.robots_meta}). Search engines will not follow links on this page.",
                recommendation="Remove 'nofollow' from the page-level meta robots tag unless you deliberately wish to halt crawling.",
                impact_score=5,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"robots_meta": page.robots_meta, "is_nofollow": True},
            )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Page Is Indexable",
            message="No blocking robots directives ('noindex' or 'nofollow') were found; search engines can freely crawl and index.",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"robots_meta": page.robots_meta or "index, follow"},
        )

