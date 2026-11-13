"""
neemSEO Keyword Research API Endpoints.
Provides routes for keyword idea generation, intent tagging, clustering,
cost estimation, and CSV reporting.
"""

import io
import csv
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from pydantic import BaseModel

from neemseo.keywords.schemas import (
    KeywordResearchRequest,
    KeywordResearchResult,
    ClusterRequest,
    ClusterResponse,
    KeywordCostEstimate,
    KeywordItem,
    SearchIntent,
)
from neemseo.keywords.service import KeywordResearchService
from neemseo.keywords.clustering import KeywordClusterer
from neemseo.keywords.intent import IntentClassifier
from neemseo.keywords.scoring import PriorityScorer
from neemseo.adapters.dataforseo import DataForSEOAdapter
from neemseo.db.session import SessionLocal
from neemseo.db.models import KeywordList, KeywordEntry

router = APIRouter(prefix="/keywords", tags=["Keyword Research"])


class KeywordRunSummary(BaseModel):
    id: str
    seed_keyword: str
    country: str
    language: str
    total_keywords: int
    cost_usd: float
    created_at: str


@router.post("/research", response_model=KeywordResearchResult)
async def research_keywords(request: KeywordResearchRequest):
    """
    Run comprehensive keyword research from a seed keyword.
    Expands ideas via Google Autocomplete/A-Z, labels search intent,
    calculates priority score, clusters topics, and persists data.
    """
    if not request.seed_keyword.strip():
        raise HTTPException(status_code=400, detail="Seed keyword cannot be empty.")

    service = KeywordResearchService()
    result = await service.research(request)
    return result


@router.post("/cluster", response_model=ClusterResponse)
async def cluster_keywords(request: ClusterRequest):
    """
    Group arbitrary list of keywords into thematic clusters.
    Computes intent, lexical groupings, and cluster metrics.
    """
    if not request.keywords:
        raise HTTPException(status_code=400, detail="Keyword list cannot be empty.")

    items: List[KeywordItem] = []
    for kw in request.keywords:
        clean = kw.strip()
        if not clean:
            continue
        intent, conf = IntentClassifier.classify(clean)
        priority = PriorityScorer.calculate(search_volume=1000, difficulty=35, intent=intent)
        items.append(
            KeywordItem(
                keyword=clean,
                search_volume=1000,
                difficulty=35,
                intent=intent,
                priority_score=priority,
                cluster="General",
                intent_confidence=conf,
            )
        )

    clusters = KeywordClusterer.cluster(items)
    return ClusterResponse(total_keywords=len(items), clusters=clusters)


@router.get("/estimate-cost", response_model=KeywordCostEstimate)
async def estimate_keyword_cost(
    count: int = Query(default=100, ge=1, le=5000),
    use_paid_api: bool = Query(default=False),
):
    """
    Pre-flight BYOK cost estimator. Shows estimated USD cost before querying paid APIs.
    """
    if not use_paid_api:
        return KeywordCostEstimate(
            keyword_count=count,
            use_paid_api=False,
            estimated_cost_usd=0.0,
            explanation="Free mode: Suggestions expanded via Google Autocomplete at $0.00.",
        )

    adapter = DataForSEOAdapter()
    est = await adapter.estimate_cost(
        "keywords_data/google/search_volume",
        {"keywords": ["test"] * count},
    )
    return KeywordCostEstimate(
        keyword_count=count,
        use_paid_api=True,
        estimated_cost_usd=float(est.estimated_usd),
        explanation=est.explanation,
    )


@router.get("/runs", response_model=List[KeywordRunSummary])
def list_keyword_runs(limit: int = 50, offset: int = 0):
    """List historical keyword research runs."""
    try:
        with SessionLocal() as db:
            runs = (
                db.query(KeywordList)
                .order_by(KeywordList.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            return [
                KeywordRunSummary(
                    id=r.id,
                    seed_keyword=r.seed_keyword,
                    country=r.country,
                    language=r.language,
                    total_keywords=r.total_keywords,
                    cost_usd=float(r.cost_usd or 0.0),
                    created_at=r.created_at.isoformat() if r.created_at else "",
                )
                for r in runs
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/runs/{run_id}")
def get_keyword_run(run_id: str):
    """Retrieve full details and all keywords for a specific run."""
    try:
        with SessionLocal() as db:
            klist = db.query(KeywordList).filter(KeywordList.id == run_id).first()
            if not klist:
                raise HTTPException(status_code=404, detail="Keyword research run not found.")

            entries = db.query(KeywordEntry).filter(KeywordEntry.list_id == run_id).all()

            return {
                "id": klist.id,
                "seed_keyword": klist.seed_keyword,
                "country": klist.country,
                "language": klist.language,
                "total_keywords": klist.total_keywords,
                "cost_usd": float(klist.cost_usd or 0.0),
                "clusters_summary": klist.clusters_summary,
                "created_at": klist.created_at.isoformat() if klist.created_at else "",
                "keywords": [
                    {
                        "keyword": e.keyword,
                        "search_volume": e.search_volume,
                        "cpc": e.cpc,
                        "difficulty": e.difficulty,
                        "intent": e.intent,
                        "cluster": e.cluster,
                        "priority_score": e.priority_score,
                        "source": e.source,
                    }
                    for e in entries
                ],
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/runs/{run_id}/export.csv")
def export_keywords_csv(run_id: str):
    """Export keywords from a research run as a downloadable CSV."""
    try:
        with SessionLocal() as db:
            klist = db.query(KeywordList).filter(KeywordList.id == run_id).first()
            if not klist:
                raise HTTPException(status_code=404, detail="Keyword research run not found.")

            entries = (
                db.query(KeywordEntry)
                .filter(KeywordEntry.list_id == run_id)
                .order_by(KeywordEntry.priority_score.desc())
                .all()
            )

            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow([
                "Keyword",
                "Search Volume",
                "Keyword Difficulty",
                "CPC ($)",
                "Search Intent",
                "Cluster Theme",
                "Priority Score",
                "Data Source",
            ])

            for e in entries:
                writer.writerow([
                    e.keyword,
                    e.search_volume,
                    e.difficulty,
                    f"{e.cpc:.2f}",
                    e.intent,
                    e.cluster,
                    e.priority_score,
                    e.source,
                ])

            csv_content = output.getvalue()
            filename = f"neemseo_keywords_{klist.seed_keyword.replace(' ', '_')}.csv"
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

