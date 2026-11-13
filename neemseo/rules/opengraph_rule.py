"""
Rule: Open Graph and Social Sharing Metadata.
Checks for Facebook Open Graph and Twitter Card tags to ensure rich social previews.
"""

from typing import Optional, Dict, Any, List
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class OpenGraphRule(BaseRule):
    rule_id = "social_metadata"
    title = "Open Graph & Social Media Tags"
    category = Category.SOCIAL
    default_impact = 4
    description = "Checks that the page defines Open Graph (og:title, og:description, og:image) and Twitter Card tags."
    why_it_matters = (
        "When people share your links on LinkedIn, Twitter/X, Facebook, Slack, or WhatsApp, Open Graph tags control "
        "the preview image, headline, and summary. Missing tags produce unappealing blank cards with low engagement."
    )
    how_to_fix = "Add `<meta property=\"og:title\">`, `<meta property=\"og:description\">`, and `<meta property=\"og:image\">` to your `<head>`."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        og = page.opengraph
        has_title = bool(og.get("og:title"))
        has_desc = bool(og.get("og:description"))
        has_image = bool(og.get("og:image"))

        missing: List[str] = []
        if not has_title:
            missing.append("og:title")
        if not has_desc:
            missing.append("og:description")
        if not has_image:
            missing.append("og:image")

        if missing:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Incomplete Open Graph Metadata",
                message=f"Missing essential social tags: {', '.join(missing)}.",
                recommendation=self.how_to_fix,
                impact_score=3,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"missing_tags": missing, "found_tags": list(og.keys())},
            )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Complete Social Media Tags",
            message="Open Graph title, description, and preview image tags are present and valid.",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"found_tags": list(og.keys())},
        )
