"""Background Worker Dispatcher.

Executes asynchronous agent tasks, tracks lifecycle states (queued -> running -> completed/failed),
and persists real-time findings to Redis.

Bridges the Orchestrator Control Plane to the Agent Microservices Layer.
"""

from __future__ import annotations

import asyncio
import logging
import sys
from pathlib import Path
from typing import Any, Callable, Coroutine, Dict, Optional

import httpx

# Ensure repository root is on sys.path for direct agent package imports
REPO_ROOT = str(Path(__file__).resolve().parents[4])
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from app.config import get_settings
from app.db.neo4j_client import get_neo4j_client
from app.models.requests import AgentName
from app.models.responses import JobStatus
from app.services.job_manager import JobManager, get_job_manager
from app.services.llm_service import get_llm_service

# Import Agent Worker implementations
from agents.career_drift.worker import run_career_drift
from agents.career_evidence.worker import run_career_evidence
from agents.career_health.worker import run_career_health
from agents.career_vision.worker import run_career_vision
from agents.interview_readiness.worker import run_interview_readiness
from agents.opportunity_discovery.worker import run_opportunity_discovery
from agents.skill_intelligence.worker import run_skill_intelligence

logger = logging.getLogger("orchestrator.dispatcher")

# Registry mapping AgentName to executable worker coroutines
WORKER_DISPATCH_TABLE: Dict[
    AgentName,
    Callable[[str, Optional[Dict[str, Any]], Any, Any], Coroutine[Any, Any, Dict[str, Any]]],
] = {
    AgentName.CAREER_VISION: run_career_vision,
    AgentName.CAREER_DRIFT: run_career_drift,
    AgentName.CAREER_EVIDENCE: run_career_evidence,
    AgentName.INTERVIEW_READINESS: run_interview_readiness,
    AgentName.CAREER_HEALTH: run_career_health,
    AgentName.SKILL_INTELLIGENCE: run_skill_intelligence,
    AgentName.OPPORTUNITY_DISCOVERY: run_opportunity_discovery,
}


async def fetch_student_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Query live student profile from Member 1's Profile Microservice.
    
    Uses secure inter-service internal header authentication to bridge
    the Agent Orchestrator to the Student Profile datastore.
    """
    settings = get_settings()
    url = f"{settings.profile_service_url.rstrip('/')}/api/v1/profile/{user_id}"
    headers = {"x-internal-key": settings.internal_service_key}
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                logger.info("[Worker] Ingested live profile for user %s from Profile Service", user_id)
                return data.get("profile")
    except Exception as exc:
        logger.debug("[Worker] Profile fetch skipped for user %s: %s (using offline fallback)", user_id, exc)
    return None


async def execute_agent_job(
    job_id: str,
    agent_name: AgentName,
    user_id: str,
    params: Optional[Dict[str, Any]] = None,
    job_manager: Optional[JobManager] = None,
) -> None:
    """Execute an agent background job and update Redis state upon completion.

    Args:
        job_id: Unique UUID identifier for the task.
        agent_name: Valid AgentName enum.
        user_id: Target student ID.
        params: Free-form agent configuration dictionary.
        job_manager: Injected JobManager instance.
    """
    job_mgr = job_manager or get_job_manager()
    neo4j_client = get_neo4j_client()
    llm_service = get_llm_service()

    logger.info("[Worker] Starting execution for job %s (Agent: %s, User: %s)", job_id, agent_name.value, user_id)

    # 1. Transition state from QUEUED -> RUNNING
    await job_mgr.update_job_status(job_id=job_id, status=JobStatus.RUNNING)

    # 2. Enrich parameters with live student profile if not already provided
    resolved_params = dict(params or {})
    if "profile" not in resolved_params and "skills" not in resolved_params:
        live_profile = await fetch_student_profile(user_id)
        if live_profile:
            resolved_params["profile"] = live_profile
            if "target_role" not in resolved_params and live_profile.get("target_role"):
                resolved_params["target_role"] = live_profile["target_role"]
            if "skills" not in resolved_params and live_profile.get("skills"):
                resolved_params["skills"] = [
                    s.get("name") if isinstance(s, dict) else str(s)
                    for s in live_profile["skills"]
                ]

    try:
        worker_func = WORKER_DISPATCH_TABLE.get(agent_name)

        if worker_func is not None:
            # Execute dedicated agent worker with resolved profile parameters
            result = await worker_func(user_id, resolved_params, neo4j_client, llm_service)
        else:
            # Fallback stub for remaining Phase 3 agents
            logger.info("Executing standard pipeline stub for agent '%s'", agent_name.value)
            result = {
                "agent": agent_name.value,
                "user_id": user_id,
                "status": "completed",
                "summary": f"Standard agent execution completed for {agent_name.value}.",
            }

        # 2. Transition state from RUNNING -> COMPLETED with result payload
        await job_mgr.update_job_status(
            job_id=job_id,
            status=JobStatus.COMPLETED,
            result=result,
        )
        logger.info("[Worker] Successfully completed job %s", job_id)

    except Exception as exc:
        logger.error("[Worker] Job %s execution failed: %s", job_id, exc, exc_info=True)
        await job_mgr.update_job_status(
            job_id=job_id,
            status=JobStatus.FAILED,
            error=str(exc),
        )


def dispatch_background_job(
    job_id: str,
    agent_name: AgentName,
    user_id: str,
    params: Optional[Dict[str, Any]] = None,
    job_manager: Optional[JobManager] = None,
) -> asyncio.Task[None]:
    """Spawn a non-blocking background coroutine to execute the agent pipeline.

    Returns:
        asyncio.Task: Background task reference.
    """
    return asyncio.create_task(
        execute_agent_job(
            job_id=job_id,
            agent_name=agent_name,
            user_id=user_id,
            params=params,
            job_manager=job_manager,
        )
    )
