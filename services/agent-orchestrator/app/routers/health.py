"""Health and readiness probes.

Exposes:
- GET /health (Liveness Probe): Returns HTTP 200 immediately if the Python process is alive.
- GET /ready (Readiness Probe): Concurrently pings Redis, Neo4j, and ChromaDB.
  Returns HTTP 200 OK if all backing services are healthy, or HTTP 503 Service Unavailable
  if any dependency is offline.

Distributed Systems & Kubernetes Rationale:
- Liveness Probe failure causes the container engine to SIGKILL and restart the container.
- Readiness Probe failure temporarily removes the container from the ingress load balancer
  without restarting it, protecting in-flight requests during transient network blips.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, Response, status

from app.config import get_settings
from app.db.chroma_client import get_chroma_client
from app.db.neo4j_client import get_neo4j_client
from app.services.job_manager import get_job_manager

router = APIRouter(tags=["health"])


@router.get("/health", summary="Liveness probe")
async def health() -> Dict[str, Any]:
    """Liveness probe confirming that the FastAPI application process is running."""
    settings = get_settings()
    return {
        "status": "healthy",
        "service": settings.service_name,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready", summary="Readiness probe")
async def ready(response: Response) -> Dict[str, Any]:
    """Readiness probe verifying active connections to Redis, Neo4j, and ChromaDB."""
    job_mgr = get_job_manager()
    neo4j_client = get_neo4j_client()
    chroma_client = get_chroma_client()

    # Run health checks concurrently across all three backing datastores
    redis_ok, neo4j_ok = await asyncio.gather(
        job_mgr.ping(),
        neo4j_client.ping(),
        return_exceptions=True,
    )

    # ChromaDB ping is synchronous HTTP
    try:
        chroma_ok = chroma_client.ping()
    except Exception:
        chroma_ok = False

    is_redis_healthy = redis_ok is True
    is_neo4j_healthy = neo4j_ok is True
    is_chroma_healthy = chroma_ok is True

    checks = {
        "redis": "healthy" if is_redis_healthy else "unreachable",
        "neo4j": "healthy" if is_neo4j_healthy else "unreachable",
        "chromadb": "healthy" if is_chroma_healthy else "unreachable",
    }

    all_healthy = is_redis_healthy and is_neo4j_healthy and is_chroma_healthy

    if not all_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "not_ready", "checks": checks}

    response.status_code = status.HTTP_200_OK
    return {"status": "ready", "checks": checks}
