"""
neemSEO Celery Background Tasks for Scheduled Rank Tracking.
"""

import asyncio
from neemseo.tasks.celery_app import celery_app
from neemseo.ranker.scheduler import RankScheduler


@celery_app.task(bind=True, name="neemseo.tasks.rank_checks.execute_scheduled_rank_checks")
def execute_scheduled_rank_checks(self=None):
    """
    Periodic task triggered daily via Celery Beat.
    Checks SERP positions for all active keyword targets and dispatches rank drop alerts.
    """
    scheduler = RankScheduler()
    res = asyncio.run(scheduler.execute_scheduled_run())
    return {
        "targets_checked": res.get("checks_run", 0),
        "alerts_created": res.get("alerts_count", 0),
        "total_cost_usd": res.get("cost_usd", 0.0),
    }
