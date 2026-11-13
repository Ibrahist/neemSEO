"""
Rule: Content Depth and Keyword Targeting.
Checks body word count (thin content threshold) and target keyword presence in Title, H1, and introduction.
"""

from typing import Optional, Dict, Any
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class ContentOptimizationRule(BaseRule):
    rule_id = "content_optimization"
    title = "Content Depth & Keyword Targeting"
    category = Category.CONTENT
    default_impact = 7
    description = "Evaluates content word count depth and keyword optimization across title, H1, and intro text."
    why_it_matters = (
        "Search engines favor comprehensive, substantive content that satisfies user intent over thin pages. "
        "Placing your primary target keyword in the Title tag, primary H1, and initial body text signals strong topic relevance."
    )
    how_to_fix = "Expand thin content beyond 300 words and include your target keyword naturally in the title, H1, and first paragraph."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        word_count = page.word_count
        keyword = (context.get("keyword") or "").strip().lower() if context else ""

        # 1. Thin content check
        if word_count < 100:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.FAIL,
                title="Critically Thin Content",
                message=f"Page contains only {word_count} words. Search engines may flag this page as low-quality thin content.",
                recommendation=self.how_to_fix,
                impact_score=self.default_impact,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"word_count": word_count},
            )

        if word_count < 300:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Low Word Count",
                message=f"Page word count is {word_count} words (minimum recommended: 300+ words).",
                recommendation="Expand the text to answer user search intent in greater depth.",
                impact_score=5,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"word_count": word_count},
            )

        # 2. Keyword targeting check (if target keyword supplied)
        if keyword:
            title_text = (page.title or "").lower()
            h1_text = " ".join(page.h1_list).lower()
            intro_text = (page.first_paragraph or "").lower()

            missing_locations = []
            if keyword not in title_text:
                missing_locations.append("Title tag")
            if keyword not in h1_text:
                missing_locations.append("H1 heading")
            if keyword not in intro_text:
                missing_locations.append("First paragraph")

            if missing_locations:
                return RuleResult(
                    rule_id=self.rule_id,
                    status=Severity.WARN,
                    title="Target Keyword Placement Missing",
                    message=f"Target keyword '{keyword}' is missing from: {', '.join(missing_locations)}.",
                    recommendation=f"Incorporate '{keyword}' naturally into your {', '.join(missing_locations)}.",
                    impact_score=6,
                    category=self.category,
                    why_it_matters=self.why_it_matters,
                    context={"keyword": keyword, "missing_locations": missing_locations, "word_count": word_count},
                )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Sufficient Content Depth",
            message=f"Page has healthy content volume ({word_count} words)"
            + (f" and properly features the target keyword '{keyword}'." if keyword else "."),
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"word_count": word_count, "keyword": keyword or None},
        )
