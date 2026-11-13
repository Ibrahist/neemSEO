"""
Rule: Structured Data and Schema.org Markup.
Checks for the presence of JSON-LD Schema markup for rich snippets.
"""

from typing import Optional, Dict, Any, List
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class SchemaMarkupRule(BaseRule):
    rule_id = "structured_data"
    title = "Structured Data (Schema.org / JSON-LD)"
    category = Category.STRUCTURED_DATA
    default_impact = 5
    description = "Checks that the page implements Schema.org structured data via JSON-LD."
    why_it_matters = (
        "Structured data helps search engines understand page context and qualifies your listing for Rich Results "
        "(ratings stars, FAQs, breadcrumbs, product pricing) in Google SERPs, substantially increasing click-through rates."
    )
    how_to_fix = "Implement relevant Schema.org markup (such as Article, Organization, BreadcrumbList, or Product) inside a `<script type=\"application/ld+json\">` block."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        schemas = page.schema_jsonld

        if not schemas:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="No Structured Data Detected",
                message="No JSON-LD structured data was found on the page.",
                recommendation=self.how_to_fix,
                impact_score=4,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"schema_count": 0},
            )

        types: List[str] = []
        for s in schemas:
            t = s.get("@type")
            if isinstance(t, str):
                types.append(t)
            elif isinstance(t, list):
                types.extend([str(item) for item in t])

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="Structured Data Present",
            message=f"Found {len(schemas)} JSON-LD schema blocks (Types: {', '.join(types[:4]) if types else 'Schema detected'}).",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"schema_count": len(schemas), "types": types},
        )

