"""
neemSEO Rules Package.
Imports and registers all on-page SEO checking rules.
"""

from neemseo.rules.base import BaseRule, RuleResult, Severity, Category
from neemseo.rules.registry import registry, register_rule

# Import individual rule modules so their decorators execute
from neemseo.rules.title_rule import TitleRule
from neemseo.rules.description_rule import MetaDescriptionRule
from neemseo.rules.heading_rule import HeadingRule
from neemseo.rules.image_rule import ImageAltRule
from neemseo.rules.canonical_rule import CanonicalRule
from neemseo.rules.robots_rule import RobotsDirectivesRule
from neemseo.rules.viewport_rule import ViewportRule
from neemseo.rules.link_rule import LinkAnalysisRule
from neemseo.rules.content_rule import ContentOptimizationRule
from neemseo.rules.schema_rule import SchemaMarkupRule
from neemseo.rules.opengraph_rule import OpenGraphRule

__all__ = [
    "BaseRule",
    "RuleResult",
    "Severity",
    "Category",
    "registry",
    "register_rule",
    "TitleRule",
    "MetaDescriptionRule",
    "HeadingRule",
    "ImageAltRule",
    "CanonicalRule",
    "RobotsDirectivesRule",
    "ViewportRule",
    "LinkAnalysisRule",
    "ContentOptimizationRule",
    "SchemaMarkupRule",
    "OpenGraphRule",
]

