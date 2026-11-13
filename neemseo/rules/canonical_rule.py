"""
Rule: Canonical Tag.
Checks for presence of a canonical URL link tag to avoid duplicate content issues.
"""

from typing import Optional, Dict, Any
from urllib.parse import urlparse
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class CanonicalRule(BaseRule):
    rule_id = "canonical_tag"
    title = "Canonical Tag Implementation"
    category = Category.TECHNICAL
    default_impact = 7
    description = "Checks that the page specifies an unambiguous rel='canonical' tag."
    why_it_matters = (
        "Canonical tags tell search engines which URL represents the master copy of a page. "
        "They prevent duplicate content penalties caused by URL parameters, session IDs, trailing slashes, or HTTP vs HTTPS variants."
    )
    how_to_fix = "Add `<link rel=\"canonical\" href=\"https://example.com/canonical-url\">` to the `<head>` of this page."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        canonical = page.canonical_url

        if not canonical:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Missing Canonical Tag",
                message="The page does not declare a canonical URL tag (<link rel=\"canonical\">).",
                recommendation=self.how_to_fix,
                impact_score=6,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"canonical": None},
            )

        # Check self-referential or canonical mismatch
        current_parsed = urlparse(page.url)
        canonical_parsed = urlparse(canonical)

        is_self_referential = (
            current_parsed.netloc == canonical_parsed.netloc
            and current_parsed.path.rstrip("/") == canonical_parsed.path.rstrip("/")
        )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Canonical Tag Declared",
            message=f"Canonical URL is defined: \"{canonical}\" (Self-referential: {is_self_referential}).",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"canonical": canonical, "is_self_referential": is_self_referential},
        )

