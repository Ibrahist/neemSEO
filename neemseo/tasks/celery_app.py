"""
neemSEO Celery Application Configuration.
Manages distributed background workers and periodic beat schedules for site crawls and SERP tracking.
"""

import os
try:
    from celery import Celery
    from celery.schedules import crontab
    HAS_CELERY = True
except ImportError:
    HAS_CELERY = False

    class MockCelery:
        def __init__(self, name="neemseo", **kwargs):
            self.main = name
            self.conf = type("Conf", (), {"beat_schedule": {}, "update": lambda *a, **k: None})()
            self.tasks = {}

        def task(self, *dargs, **dkwargs):
            def decorator(fn):
                task_name = dkwargs.get("name", f"{fn.__module__}.{fn.__name__}")
                self.tasks[task_name] = fn
                fn.delay = fn
                return fn
            if dargs and callable(dargs[0]):
                return decorator(dargs[0])
            return decorator

    Celery = MockCelery
    def crontab(*args, **kwargs):
        return {"crontab": (args, kwargs)}
from neemseo.core.config import settings

# Determine broker URL (defaults to Redis if configured, otherwise falls back to SQLite queue)
broker_url = settings.CELERY_BROKER_URL or settings.REDIS_URL or "redis://localhost:6379/0"
result_backend = settings.CELERY_RESULT_BACKEND or settings.REDIS_URL or "redis://localhost:6379/1"

celery_app = Celery(
    "neemseo",
    broker=broker_url,
    backend=result_backend,
    include=[
        "neemseo.tasks.crawls",
        "neemseo.tasks.rank_checks",
    ],
)

# Celery Configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max for big crawls
    task_soft_time_limit=3300,
    worker_prefetch_multiplier=1,
)

# Periodic Beat Schedule for Daily SERP Position Tracking
celery_app.conf.beat_schedule = {
    "daily-serp-rank-tracking": {
        "task": "neemseo.tasks.rank_checks.execute_scheduled_rank_checks",
        "schedule": crontab(hour=3, minute=0),  # Run daily at 03:00 UTC
        "args": (),
    },
}
