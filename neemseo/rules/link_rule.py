"""
Rule: Internal and External Link Analysis.
Checks link counts, distribution, empty anchor texts, and generic anchor texts.
"""

from typing import Optional, Dict, Any, List
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


GENERIC_ANCHORS = {"click here", "here", "read more", "learn more", "more", "link", "website"}


@register_rule
class LinkAnalysisRule(BaseRule):
    rule_id = "link_analysis"
    title = "Link Structure and Anchor Text"
    category = Category.LINKS
    default_impact = 6
    description = "Checks internal/external link balance and detects empty or generic anchor text."
    why_it_matters = (
        "Internal links pass link equity (PageRank) and establish topical architecture. "
        "Descriptive anchor texts tell search engines what the target page is about, whereas generic text ('click here') wastes ranking value."
    )
    how_to_fix = "Ensure meaningful internal links point to related topics with descriptive anchor texts, and avoid orphan or dead-end pages."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        internal_count = page.internal_links_count
        external_count = page.external_links_count
        total_links = len(page.links)

        if total_links == 0:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="No Links on Page",
                message="The page has no internal or external links, acting as a navigational dead end.",
                recommendation="Add internal links to help users navigate and allow search bots to discover other pages.",
                impact_score=5,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"total_links": 0},
            )

        # Check empty or generic anchor text
        empty_anchors = 0
        generic_anchors: List[str] = []

        for link in page.links:
            text = link.anchor_text.strip().lower()
            if not text:
                empty_anchors += 1
            elif text in GENERIC_ANCHORS:
                generic_anchors.append(link.anchor_text)

        if empty_anchors > 3:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Links with Missing Anchor Text",
                message=f"Found {empty_anchors} links with empty or non-textual anchors (e.g. unlabelled image links).",
                recommendation="Provide informative anchor text or image alt text inside links for accessibility and search clarity.",
                impact_score=4,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"empty_anchors": empty_anchors, "internal_count": internal_count, "external_count": external_count},
            )

        if generic_anchors:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Generic Anchor Text Used",
                message=f"Detected {len(generic_anchors)} links using generic anchor text (e.g. \"{generic_anchors[0]}\").",
                recommendation="Replace generic terms like 'click here' with keyword-rich phrases describing the target destination.",
                impact_score=3,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"generic_count": len(generic_anchors), "samples": generic_anchors[:3]},
            )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Healthy Link Profile",
            message=f"Found {internal_count} internal links and {external_count} external links with informative anchor texts.",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"internal_links": internal_count, "external_links": external_count},
        )

