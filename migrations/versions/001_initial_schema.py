"""initial schema for neemSEO

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-14 18:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), server_default='member'),
        sa.Column('api_token', sa.String(length=128), unique=True, index=True, nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )

    # 2. invitations
    op.create_table(
        'invitations',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, index=True),
        sa.Column('token', sa.String(length=128), unique=True, index=True, nullable=False),
        sa.Column('role', sa.String(length=50), server_default='member'),
        sa.Column('invited_by_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('is_accepted', sa.Boolean(), server_default=sa.false()),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )

    # 3. audit_runs
    op.create_table(
        'audit_runs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('url', sa.String(length=2048), nullable=False, index=True),
        sa.Column('overall_score', sa.Integer(), nullable=False),
        sa.Column('grade', sa.String(length=2), nullable=False),
        sa.Column('category_scores', sa.JSON(), nullable=True),
        sa.Column('page_summary', sa.JSON(), nullable=True),
        sa.Column('passed_count', sa.Integer(), server_default='0'),
        sa.Column('warn_count', sa.Integer(), server_default='0'),
        sa.Column('fail_count', sa.Integer(), server_default='0'),
        sa.Column('status_code', sa.Integer(), nullable=True),
        sa.Column('response_time_ms', sa.Float(), server_default='0.0'),
        sa.Column('target_keyword', sa.String(length=255), nullable=True),
        sa.Column('prioritized_fixes', sa.JSON(), nullable=True),
        sa.Column('cost_incurred_usd', sa.Float(), server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )

    # 4. crawls
    op.create_table(
        'crawls',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('seed_url', sa.String(length=2048), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='pending'),
        sa.Column('max_pages', sa.Integer(), server_default='100'),
        sa.Column('max_depth', sa.Integer(), server_default='3'),
        sa.Column('pages_crawled', sa.Integer(), server_default='0'),
        sa.Column('sitemap_urls_found', sa.Integer(), server_default='0'),
        sa.Column('total_links_found', sa.Integer(), server_default='0'),
        sa.Column('duration_seconds', sa.Float(), server_default='0.0'),
        sa.Column('report_summary', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
        sa.Column('finished_at', sa.DateTime(), nullable=True),
    )

    # 5. crawl_pages
    op.create_table(
        'crawl_pages',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('crawl_id', sa.String(length=36), sa.ForeignKey('crawls.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('url', sa.String(length=2048), nullable=False, index=True),
        sa.Column('status_code', sa.Integer(), server_default='200'),
        sa.Column('depth', sa.Integer(), server_default='0'),
        sa.Column('title', sa.String(length=512), nullable=True),
        sa.Column('meta_description', sa.String(length=1024), nullable=True),
        sa.Column('overall_score', sa.Integer(), server_default='100'),
        sa.Column('word_count', sa.Integer(), server_default='0'),
        sa.Column('inlinks_count', sa.Integer(), server_default='0'),
        sa.Column('outlinks_count', sa.Integer(), server_default='0'),
        sa.Column('is_orphan', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_blocked_robots', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_noindex', sa.Boolean(), server_default=sa.false()),
        sa.Column('redirect_to', sa.String(length=2048), nullable=True),
        sa.Column('load_time_ms', sa.Float(), server_default='0.0'),
        sa.Column('issues_summary', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # 6. crawl_links
    op.create_table(
        'crawl_links',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('crawl_id', sa.String(length=36), sa.ForeignKey('crawls.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('source_url', sa.String(length=2048), nullable=False, index=True),
        sa.Column('target_url', sa.String(length=2048), nullable=False, index=True),
        sa.Column('anchor_text', sa.String(length=512), server_default=''),
        sa.Column('is_internal', sa.Boolean(), server_default=sa.true()),
        sa.Column('status_code', sa.Integer(), server_default='200'),
        sa.Column('is_broken', sa.Boolean(), server_default=sa.false()),
        sa.Column('rel', sa.String(length=100), server_default=''),
    )

    # 7. keyword_lists
    op.create_table(
        'keyword_lists',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('seed_keyword', sa.String(length=255), nullable=False, index=True),
        sa.Column('country', sa.String(length=10), server_default='US'),
        sa.Column('total_keywords', sa.Integer(), server_default='0'),
        sa.Column('cost_usd', sa.Float(), server_default='0.0'),
        sa.Column('clusters_summary', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )

    # 8. keyword_entries
    op.create_table(
        'keyword_entries',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('list_id', sa.String(length=36), sa.ForeignKey('keyword_lists.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('keyword', sa.String(length=255), nullable=False, index=True),
        sa.Column('search_volume', sa.Integer(), server_default='0'),
        sa.Column('difficulty', sa.Integer(), server_default='0'),
        sa.Column('cpc', sa.Float(), server_default='0.0'),
        sa.Column('intent', sa.String(length=50), server_default='informational'),
        sa.Column('cluster', sa.String(length=100), server_default='general'),
        sa.Column('priority_score', sa.Integer(), server_default='50'),
        sa.Column('source', sa.String(length=50), server_default='autocomplete'),
    )

    # 9. rank_targets
    op.create_table(
        'rank_targets',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('keyword', sa.String(length=255), nullable=False, index=True),
        sa.Column('target_url', sa.String(length=2048), nullable=False),
        sa.Column('location', sa.String(length=100), server_default='United States'),
        sa.Column('device', sa.String(length=20), server_default='desktop'),
        sa.Column('language', sa.String(length=10), server_default='en'),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )

    # 10. rank_history
    op.create_table(
        'rank_history',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('target_id', sa.String(length=36), sa.ForeignKey('rank_targets.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('position', sa.Integer(), nullable=True),
        sa.Column('previous_position', sa.Integer(), nullable=True),
        sa.Column('position_change', sa.Integer(), server_default='0'),
        sa.Column('url_found', sa.String(length=2048), nullable=True),
        sa.Column('serp_features', sa.JSON(), nullable=True),
        sa.Column('cost_usd', sa.Float(), server_default='0.0'),
        sa.Column('checked_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )

    # 11. rank_alerts
    op.create_table(
        'rank_alerts',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('target_id', sa.String(length=36), sa.ForeignKey('rank_targets.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('alert_type', sa.String(length=50), nullable=False),
        sa.Column('message', sa.String(length=1024), nullable=False),
        sa.Column('old_position', sa.Integer(), nullable=True),
        sa.Column('new_position', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )

    # 12. backlink_snapshots
    op.create_table(
        'backlink_snapshots',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('target_domain', sa.String(length=512), nullable=False, index=True),
        sa.Column('total_backlinks', sa.Integer(), server_default='0'),
        sa.Column('total_referring_domains', sa.Integer(), server_default='0'),
        sa.Column('dofollow_count', sa.Integer(), server_default='0'),
        sa.Column('nofollow_count', sa.Integer(), server_default='0'),
        sa.Column('new_links_since_last', sa.Integer(), server_default='0'),
        sa.Column('lost_links_since_last', sa.Integer(), server_default='0'),
        sa.Column('top_anchor_texts', sa.JSON(), nullable=True),
        sa.Column('cost_usd', sa.Float(), server_default='0.0'),
        sa.Column('source', sa.String(length=50), server_default='dataforseo'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )

    # 13. backlink_records
    op.create_table(
        'backlink_records',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('snapshot_id', sa.String(length=36), sa.ForeignKey('backlink_snapshots.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('source_url', sa.String(length=2048), nullable=False),
        sa.Column('source_domain', sa.String(length=512), nullable=False, index=True),
        sa.Column('target_url', sa.String(length=2048), nullable=False),
        sa.Column('anchor_text', sa.String(length=512), server_default=''),
        sa.Column('link_type', sa.String(length=20), server_default='dofollow'),
        sa.Column('domain_rank', sa.Integer(), server_default='0'),
        sa.Column('page_rank', sa.Integer(), server_default='0'),
        sa.Column('is_new', sa.Boolean(), server_default=sa.false()),
        sa.Column('is_lost', sa.Boolean(), server_default=sa.false()),
    )

    # 14. ai_visibility_runs
    op.create_table(
        'ai_visibility_runs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('domain', sa.String(length=512), nullable=False, index=True),
        sa.Column('brand_name', sa.String(length=255), nullable=False),
        sa.Column('overall_score', sa.Integer(), server_default='0'),
        sa.Column('queries_count', sa.Integer(), server_default='0'),
        sa.Column('citations_count', sa.Integer(), server_default='0'),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True),
    )


def downgrade() -> None:
    op.drop_table('ai_visibility_runs')
    op.drop_table('backlink_records')
    op.drop_table('backlink_snapshots')
    op.drop_table('rank_alerts')
    op.drop_table('rank_history')
    op.drop_table('rank_targets')
    op.drop_table('keyword_entries')
    op.drop_table('keyword_lists')
    op.drop_table('crawl_links')
    op.drop_table('crawl_pages')
    op.drop_table('crawls')
    op.drop_table('audit_runs')
    op.drop_table('invitations')
    op.drop_table('users')
