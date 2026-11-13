"""
neemSEO SQLAlchemy Database Models.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Numeric,
)
from sqlalchemy.orm import relationship
from neemseo.db.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="member")  # admin, member
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditRun(Base):
    __tablename__ = "audit_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    url = Column(String(2048), nullable=False, index=True)
    target_keyword = Column(String(255), nullable=True)
    status_code = Column(Integer, default=200)
    response_time_ms = Column(Float, default=0.0)
    overall_score = Column(Integer, default=100)
    grade = Column(String(2), default="A")
    word_count = Column(Integer, default=0)

    # Serialized summaries
    page_summary = Column(JSON, default=dict)
    core_web_vitals = Column(JSON, nullable=True)
    category_scores = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    issues = relationship("AuditIssue", back_populates="audit_run", cascade="all, delete-orphan")


class AuditIssue(Base):
    __tablename__ = "audit_issues"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    audit_run_id = Column(String(36), ForeignKey("audit_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String(100), nullable=False, index=True)
    status = Column(String(20), nullable=False)  # pass, warn, fail
    category = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    recommendation = Column(Text, default="")
    impact_score = Column(Integer, default=0)
    context_data = Column(JSON, default=dict)

    audit_run = relationship("AuditRun", back_populates="issues")


class ProviderCost(Base):
    __tablename__ = "provider_costs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    provider = Column(String(100), nullable=False, index=True)
    endpoint = Column(String(255), nullable=False)
    estimated_usd = Column(Numeric(10, 4), default=0.0)
    actual_usd = Column(Numeric(10, 4), default=0.0)
    was_cached = Column(Boolean, default=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Crawl(Base):
    __tablename__ = "crawls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    seed_url = Column(String(2048), nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed, cancelled, paused
    max_pages = Column(Integer, default=100)
    max_depth = Column(Integer, default=3)
    pages_crawled = Column(Integer, default=0)
    sitemap_urls_found = Column(Integer, default=0)
    total_links_found = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    report_summary = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    finished_at = Column(DateTime, nullable=True)

    pages = relationship("CrawlPage", back_populates="crawl", cascade="all, delete-orphan")
    links = relationship("CrawlLink", back_populates="crawl", cascade="all, delete-orphan")


class CrawlPage(Base):
    __tablename__ = "crawl_pages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    crawl_id = Column(String(36), ForeignKey("crawls.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(2048), nullable=False, index=True)
    status_code = Column(Integer, default=200)
    depth = Column(Integer, default=0)
    title = Column(String(512), nullable=True)
    meta_description = Column(String(1024), nullable=True)
    overall_score = Column(Integer, default=100)
    word_count = Column(Integer, default=0)
    inlinks_count = Column(Integer, default=0)
    outlinks_count = Column(Integer, default=0)
    is_orphan = Column(Boolean, default=False)
    is_blocked_robots = Column(Boolean, default=False)
    is_noindex = Column(Boolean, default=False)
    redirect_to = Column(String(2048), nullable=True)
    load_time_ms = Column(Float, default=0.0)
    issues_summary = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    crawl = relationship("Crawl", back_populates="pages")


class CrawlLink(Base):
    __tablename__ = "crawl_links"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    crawl_id = Column(String(36), ForeignKey("crawls.id", ondelete="CASCADE"), nullable=False, index=True)
    source_url = Column(String(2048), nullable=False, index=True)
    target_url = Column(String(2048), nullable=False, index=True)
    anchor_text = Column(String(512), default="")
    is_internal = Column(Boolean, default=True)
    is_broken = Column(Boolean, default=False)
    status_code = Column(Integer, default=200)

    crawl = relationship("Crawl", back_populates="links")

