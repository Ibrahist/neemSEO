"""
neemSEO Scheduled SERP Rank Checker and Drop Alert Dispatcher.
Executes periodic rank checks (via Celery, cron, or CLI) and sends webhook alerts on position drops.
"""

from typing import List, Dict, Any, Optional
import httpx

from neemseo.ranker.service import RankTrackerService
from neemseo.ranker.schemas import RankAlert, RankPosition
from neemseo.core.config import settings


class RankScheduler:
    """Orchestrates scheduled rank checks and sends webhook notifications on drops."""

    def __init__(self, service: Optional[RankTrackerService] = None, webhook_url: Optional[str] = None):
        self.service = service or RankTrackerService()
        self.webhook_url = webhook_url or settings.ALERT_WEBHOOK_URL

    async def execute_scheduled_run(self) -> Dict[str, Any]:
        """
        Runs checks on all active targets, checks for significant rank drops,
        and fires alerts to the configured webhook.
        """
        # 1. Run SERP checks
        checks: List[RankPosition] = await self.service.run_checks()

        # 2. Detect rank movement alerts
        alerts: List[RankAlert] = self.service.detect_alerts()

        # 3. Dispatch webhook if alerts detected
        webhook_dispatched = False
        if alerts and self.webhook_url:
            webhook_dispatched = await self._dispatch_webhook(alerts)

        return {
            "checks_run": len(checks),
            "alerts_count": len(alerts),
            "alerts": [a.model_dump() for a in alerts],
            "webhook_dispatched": webhook_dispatched,
            "cost_usd": sum(c.cost_usd for c in checks),
        }

    async def _dispatch_webhook(self, alerts: List[RankAlert]) -> bool:
        if not self.webhook_url:
            return False

        payload = {
            "source": "neemSEO Rank Tracker",
            "alert_count": len(alerts),
            "alerts": [
                {
                    "keyword": a.keyword,
                    "target_url": a.target_url,
                    "old_position": a.old_position,
                    "new_position": a.new_position,
                    "change": a.change,
                    "alert_type": a.alert_type,
                }
                for a in alerts
            ],
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(self.webhook_url, json=payload)
                return resp.status_code < 400
        except Exception:
            return False
