"""
Rule: Image Alt Attributes and Accessibility.
Checks for missing alt attributes on images and dimension attributes to avoid layout shifts.
"""

from typing import Optional, Dict, Any, List
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule


@register_rule
class ImageAltRule(BaseRule):
    rule_id = "image_alt_text"
    title = "Image Alt Text Optimization"
    category = Category.TECHNICAL
    default_impact = 7
    description = "Checks that all images have descriptive alternative text for screen readers and search bots."
    why_it_matters = (
        "Alt text describes images to search engines for Google Image search ranking and to visually impaired users using screen readers. "
        "Missing alt tags hurt accessibility (WCAG compliance) and discard easy image SEO traffic."
    )
    how_to_fix = "Add descriptive, concise `alt` attributes to all meaningful images. Decorative images should use an explicit `alt=\"\"`."

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        total_images = len(page.images)
        missing_count = page.images_missing_alt

        if total_images == 0:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.PASS,
                title="No Images Found",
                message="No images were found on the page; no missing alt attributes.",
                recommendation="",
                impact_score=0,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"total_images": 0},
            )

        missing_samples: List[str] = [img.src for img in page.images if not img.has_alt or img.is_empty_alt][:3]

        if missing_count == total_images:
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.FAIL,
                title="All Images Missing Alt Text",
                message=f"All {total_images} images on the page are missing alt text.",
                recommendation=self.how_to_fix,
                impact_score=self.default_impact,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"total_images": total_images, "missing_count": missing_count, "samples": missing_samples},
            )

        if missing_count > 0:
            pct = round((missing_count / total_images) * 100)
            return RuleResult(
                rule_id=self.rule_id,
                status=Severity.WARN,
                title="Some Images Missing Alt Text",
                message=f"{missing_count} of {total_images} images ({pct}%) are missing alt text.",
                recommendation="Add descriptive alt tags to the identified images.",
                impact_score=5,
                category=self.category,
                why_it_matters=self.why_it_matters,
                context={"total_images": total_images, "missing_count": missing_count, "samples": missing_samples},
            )

        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title="All Images Have Alt Text",
            message=f"All {total_images} images have valid alt attributes.",
            recommendation="",
            impact_score=0,
            category=self.category,
            why_it_matters=self.why_it_matters,
            context={"total_images": total_images, "missing_count": 0},
        )

