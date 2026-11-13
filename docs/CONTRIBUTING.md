# Contributing to neemSEO

Thank you for contributing to neemSEO!

## Adding a New SEO Check Rule

Adding an on-page SEO check is strictly a **single-file change**:

1. Create a new file in `neemseo/rules/your_rule.py`.
2. Inherit from `BaseRule` and decorate with `@register_rule`.
3. Implement `evaluate(self, page: ParsedPage, context: dict = None) -> RuleResult`.

Example:

```python
from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import register_rule

@register_rule
class FaviconRule(BaseRule):
    rule_id = "favicon_presence"
    title = "Favicon Declaration"
    category = Category.TECHNICAL
    default_impact = 4
    why_it_matters = "A favicon appears next to your search listing in mobile SERPs and improves brand recall."
    how_to_fix = "Add <link rel=\"icon\" href=\"/favicon.ico\"> to the <head>."

    def evaluate(self, page, context=None) -> RuleResult:
        # Inspection logic
        return RuleResult(
            rule_id=self.rule_id,
            status=Severity.PASS,
            title=self.title,
            message="Favicon correctly declared.",
            recommendation="",
            impact_score=0,
            category=self.category,
        )
```

4. Export your rule in `neemseo/rules/__init__.py`.
5. Add unit tests under `tests/test_rules.py`.

## Code Style & Standards

- Formatter: `ruff format`
- Linter: `ruff check`
- Type hinting: Type hints on all public interfaces and Pydantic models.

