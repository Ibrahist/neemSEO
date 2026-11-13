"""
Rule: Mobile Viewport Meta Tag.
Checks for mobile viewport configuration required for mobile-first indexing.
"""

from typing import Optional, Dict, Any
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class ViewportRule(BaseRule):
    rule_id = "viewport_meta"
    title = "Mobile Viewport Configuration"
    category = Category.TECHNICAL
    default_impact = 8
    description = "Checks that the page defines a viewport tag to ensure responsive rendering on mobile devices."
    why_it_matters = (
        "Google evaluates and indexes websites using mobile-first indexing. "
        "Pages without a mobile viewport tag render as desktop-width on phones, causing severe readability problems and mobile ranking drops."
    )
    how_to_fix = "Add `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">` into the `<head>`."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        viewport = page.viewport

        if not viewport:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.FAIL,
                title="Missing Mobile Viewport Tag",
                message="No <meta name=\"viewport\"> tag was found on the page.",
                recommendation=self.how_to_fix,
                impact_score=self.default_impact,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"viewport": None},
            )

        if "width=device-width" not in viewport.lower():
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Sub-optimal Viewport Settings",
                message=f"Viewport tag content (\"{viewport}\") is missing 'width=device-width'.",
                recommendation="Use `width=device-width, initial-scale=1.0` in the viewport meta tag content.",
                impact_score=5,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"viewport": viewport},
            )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Mobile Viewport Configured",
            message=f"Responsive mobile viewport tag is properly configured: \"{viewport}\".",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"viewport": viewport},
        )
