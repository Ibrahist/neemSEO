"""
neemSEO Rules Base.
Defines rule severities, categories, result structure, and the BaseRule abstract class.
"""

from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class Severity(str, Enum):
    FAIL = "fail"      # Critical SEO defect requiring prompt fix
    WARN = "warn"      # Improvement recommended
    PASS = "pass"      # Good practice followed


class Category(str, Enum):
    CONTENT = "content"
    TECHNICAL = "technical"
    LINKS = "links"
    PERFORMANCE = "performance"
    STRUCTURED_DATA = "structured_data"
    SOCIAL = "social"


class RuleResult(BaseModel):
    rule_id: str
    status: Severity
    title: str
    message: str
    recommendation: str
    impact_score: int = Field(ge=0, le=10, description="1=low, 10=critical fix")
    category: Category
    why_it_matters: str = ""
    context: Dict[str, Any] = Field(default_factory=dict)


class BaseRule:
    rule_id: str = "base_rule"
    title: str = "Base Rule"
    category: Category = Category.TECHNICAL
    default_impact: int = 5
    description: str = ""
    why_it_matters: str = ""
    how_to_fix: str = ""

    def evaluate(self, page: Any, context: Optional[Dict[str, Any]] = None) -> RuleResult:
        """
        Evaluate the parsed page against this rule.
        Must return a RuleResult.
        """
        raise NotImplementedError
