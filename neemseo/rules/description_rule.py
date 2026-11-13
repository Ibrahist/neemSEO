"""
Rule: Meta Description Optimization.
Checks presence and optimal length of meta description (120-160 characters).
"""

from typing import Optional, Dict, Any
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class MetaDescriptionRule(BaseRule):
    rule_id = "meta_description"
    title = "Meta Description Optimization"
    category = Category.CONTENT
    default_impact = 8
    description = "Checks that the page has a meta description between 120 and 160 characters."
    why_it_matters = (
        "The meta description often serves as the snippet text in search engine results. "
        "A compelling description directly improves your Organic Click-Through Rate (CTR). "
        "Descriptions over 160 characters get cut off on desktop, and over 120 on mobile."
    )
    how_to_fix = "Add a unique, informative meta description of 120–160 characters containing a clear call to action."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        desc = page.meta_description
        length = page.meta_description_length

        if not desc or length == 0:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.FAIL,
                title="Missing Meta Description",
                message="The page has no meta description specified in the <head>.",
                recommendation=self.how_to_fix,
                impact_score=self.default_impact,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"length": 0},
            )

        if length < 70:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Meta Description Is Too Short",
                message=f"Meta description is only {length} characters long: \"{desc}\".",
                recommendation="Expand the description to 120–160 characters to provide helpful context and encourage clicks.",
                impact_score=5,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"description": desc, "length": length},
            )

        if length > 160:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Meta Description Is Too Long",
                message=f"Meta description is {length} characters long. Search engines may truncate it on both desktop and mobile.",
                recommendation="Trim your meta description down to between 120 and 160 characters.",
                impact_score=4,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"description": desc, "length": length},
            )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Meta Description Is Optimal",
            message=f"Meta description length ({length} characters) is in the sweet spot (120–160 chars).",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"description": desc, "length": length},
        )
