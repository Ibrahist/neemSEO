"""
neemSEO Rule Registry.
Provides automated registration and execution of on-page SEO checks.
"""

from typing import Dict, List, Type, Optional, Any
from neemseo.rules.base import BaseRule, RuleResult


class RuleRegistry:
    def __init__(self):
        self._rules: Dict[str, BaseRule] = {}

    def register(self, rule_cls: Type[BaseRule]) -> Type[BaseRule]:
        """Class decorator to register a rule."""
        instance = rule_cls()
        self._rules[instance.rule_id] = instance
        return rule_cls

    def get_rule(self, rule_id: str) -> Optional[BaseRule]:
        return self._rules.get(rule_id)

    def list_rules(self) -> List[Dict[str, Any]]:
        return [
            {
                "rule_id": rule.rule_id,
                "title": rule.title,
                "category": rule.category.value,
                "default_impact": rule.default_impact,
                "why_it_matters": rule.why_it_matters,
                "how_to_fix": rule.how_to_fix,
            }
            for rule in self._rules.values()
        ]

    def run_all(
        self,
        page: Any,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[RuleResult]:
        """
        Runs all registered rules against the parsed page.
        """
        results: List[RuleResult] = []
        for rule in self._rules.values():
            try:
                res = rule.evaluate(page, context=context)
                results.append(res)
            except Exception as e:
                # Rule failure should not crash the entire audit
                from neemseo.rules.base import Severity, Category
                results.append(
                    RuleResult(
                        rule_id=rule.rule_id,
                        status=Severity.WARN,
                        title=f"{rule.title} (Evaluation error)",
                        message=f"Rule check encountered an error: {str(e)}",
                        recommendation="Check the page structure for non-standard HTML.",
                        impact_score=1,
                        category=rule.category,
                        why_it_matters=rule.why_it_matters,
                    )
                )
        return results


# Global singleton registry
registry = RuleRegistry()
register_rule = registry.register

