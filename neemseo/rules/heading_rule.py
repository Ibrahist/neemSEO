"""
Rule: Heading Hierarchy and H1 Structure.
Checks for exactly one <h1> tag and logical heading hierarchy order without skipping levels.
"""

from typing import Optional, Dict, Any, List
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class HeadingRule(BaseRule):
    rule_id = "heading_structure"
    title = "H1 Tag and Heading Hierarchy"
    category = Category.CONTENT
    default_impact = 8
    description = "Checks that the page has exactly one H1 tag and a structured heading progression (H1-H6)."
    why_it_matters = (
        "Heading tags organize your content for both readers and search bots. "
        "A single H1 represents the primary topic of the document. Skipping levels (e.g., jumping from H1 directly to H3) "
        "confuses assistive technology (screen readers) and dilutes topical hierarchy."
    )
    how_to_fix = "Ensure there is exactly one H1 element summarizing the page, and structure subheadings logically (H1 -> H2 -> H3)."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        h1_count = page.h1_count
        headings = page.headings

        # Check H1 presence
        if h1_count == 0:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.FAIL,
                title="Missing H1 Tag",
                message="No <h1> tag was found on the page.",
                recommendation=self.how_to_fix,
                impact_score=self.default_impact,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"h1_count": 0},
            )

        if h1_count > 1:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Multiple H1 Tags Detected",
                message=f"Found {h1_count} <h1> tags on the page: {page.h1_list}.",
                recommendation="Use only one <h1> tag as the primary heading, and convert secondary headings to <h2> tags.",
                impact_score=6,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"h1_count": h1_count, "h1_list": page.h1_list},
            )

        # Check heading progression
        skipped_levels: List[str] = []
        last_level = 1
        for h in headings:
            if h.level > last_level + 1:
                skipped_levels.append(f"Jumped from H{last_level} directly to H{h.level} (\"{h.text[:30]}...\")")
            last_level = h.level

        if skipped_levels:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Illogical Heading Hierarchy",
                message=f"Heading levels are skipped: {'; '.join(skipped_levels[:2])}.",
                recommendation="Maintain proper order: do not skip heading ranks (e.g., place an H2 before an H3).",
                impact_score=4,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"skipped_levels": skipped_levels, "h1": page.h1_list[0]},
            )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Heading Structure Is Well-Formed",
            message=f"Page has exactly one H1 (\"{page.h1_list[0]}\") and maintains consistent heading hierarchy across {len(headings)} headings.",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"h1": page.h1_list[0], "total_headings": len(headings)},
        )
