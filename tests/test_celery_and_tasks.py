"""
Tests for Celery task definitions and scheduled beat jobs.
"""

from neemseo.tasks.celery_app import celery_app
from neemseo.tasks.rank_checks import execute_scheduled_rank_checks
from neemseo.tasks.crawls import run_site_crawl_task
from neemseo.db.session import init_db


def test_celery_app_configuration():
    assert celery_app.main == "neemseo"
    assert "daily-serp-rank-tracking" in celery_app.conf.beat_schedule
    task_name = celery_app.conf.beat_schedule["daily-serp-rank-tracking"]["task"]
    assert task_name == "neemseo.tasks.rank_checks.execute_scheduled_rank_checks"


def test_celery_task_registration():
    registered = list(celery_app.tasks.keys())
    assert "neemseo.tasks.rank_checks.execute_scheduled_rank_checks" in registered
    assert "neemseo.tasks.crawls.run_site_crawl_task" in registered


def test_execute_scheduled_rank_checks_direct():
    init_db()
    res = execute_scheduled_rank_checks()
    assert isinstance(res, dict)
    assert "targets_checked" in res
    assert "alerts_created" in res
