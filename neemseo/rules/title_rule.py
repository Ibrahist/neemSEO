"""
Rule: Title Tag Optimization.
Checks title tag presence and optimal length (50-60 characters).
"""

from typing import Optional, Dict, Any
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class TitleRule(BaseRule):
    rule_id = "title_optimization"
    title = "Title Tag Optimization"
    category = Category.CONTENT
    default_impact = 9
    description = "Checks that the page has a title tag within the optimal 50–60 character range."
    why_it_matters = (
        "The title tag is one of the strongest on-page SEO signals and appears as the headline in search engine results. "
        "Too short titles miss ranking opportunities, while titles longer than 60 characters get truncated in Google SERPs."
    )
    how_to_fix = "Write a compelling, descriptive title tag between 50 and 60 characters that includes your primary keyword."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        title = page.title
        length = page.title_length

        if not title or length == 0:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.FAIL,
                title="Missing Title Tag",
                message="The page does not contain a <title> tag.",
                recommendation=self.how_to_fix,
                impact_score=self.default_impact,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"length": 0},
            )

        if length < 30:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Title Tag Is Too Short",
                message=f"The title tag is only {length} characters long: \"{title}\".",
                recommendation="Expand the title tag to 50–60 characters to include relevant target keywords and brand branding.",
                impact_score=6,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"title": title, "length": length},
            )

        if length > 60:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Title Tag May Be Truncated",
                message=f"The title tag is {length} characters long: \"{title}\". Characters beyond ~60 are usually cut off with an ellipsis in SERPs.",
                recommendation="Shorten your title tag to 50–60 characters, placing primary keywords near the beginning.",
                impact_score=6,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"title": title, "length": length},
            )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Title Tag Is Optimal",
            message=f"Title tag is well-optimized ({length} characters): \"{title}\".",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"title": title, "length": length},
        )

