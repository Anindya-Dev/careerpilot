"""Orchestrator API routes.

Exposes the primary control-plane endpoints for CareerPilot's agent execution engine:
- POST /api/v1/orchestrator/invoke        -> Enqueue an agent job, returns HTTP 202 Accepted + jobId
- GET  /api/v1/orchestrator/jobs/{job_id} -> Poll asynchronous job execution status and results
- GET  /api/v1/orchestrator/agents        -> List all registered agents and their dynamic schemas

Engineering & Architectural Concepts:
- Asynchronous Job Pattern: Long-running agent tasks (Graph queries + LLM inference)
  are decoupled from the HTTP request-response cycle.
- HTTP 202 Accepted: Informs the client that the request has been accepted for
  processing, but processing is not yet complete.
- Dependency Injection: Uses FastAPI's `Depends` to inject the singleton `JobManager`.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.models.requests import InvokeRequest
from app.models.responses import AgentListResponse, JobStatus, JobStatusResponse
from app.services.agent_registry import get_all_registered_agents
from app.services.job_manager import JobManager, get_job_manager
from app.services.worker_dispatcher import dispatch_background_job

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/orchestrator", tags=["orchestrator"])


@router.post(
    "/invoke",
    response_model=JobStatusResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Enqueue AI agent execution",
    description=(
        "Accepts an agent invocation payload, enqueues the task in Redis for "
        "background execution, and immediately returns an HTTP 202 Accepted response with a unique jobId."
    ),
)
async def invoke_agent(
    request: InvokeRequest,
    job_manager: JobManager = Depends(get_job_manager),
    authorization: Optional[str] = Header(None, description="JWT Bearer token"),
) -> JobStatusResponse:
    """Enqueue an agent task in the asynchronous job queue.

    Args:
        request: Validated InvokeRequest containing agent name, user_id, and dynamic params.
        job_manager: Injected JobManager instance.
        authorization: Optional Bearer token header for authentication.

    Returns:
        JobStatusResponse: 202 Accepted payload containing the unique job_id and 'queued' status.
    """
    logger.info(
        "Received invoke request for agent '%s' from student '%s'",
        request.agent.value,
        request.user_id,
    )

    try:
        job_id = await job_manager.enqueue_job(
            agent=request.agent.value,
            user_id=request.user_id,
            params=request.params,
        )

        # Dispatch background worker execution (non-blocking)
        dispatch_background_job(
            job_id=job_id,
            agent_name=request.agent,
            user_id=request.user_id,
            params=request.params,
            job_manager=job_manager,
        )
    except Exception as exc:
        logger.error("Failed to enqueue agent job: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enqueue agent execution job in backing task store.",
        ) from exc

    return JobStatusResponse(
        job_id=job_id,
        status=JobStatus.QUEUED,
        result=None,
    )


@router.get(
    "/jobs/{job_id}",
    response_model=JobStatusResponse,
    summary="Poll job execution status",
    description="Fetches current lifecycle status (queued, running, completed, failed) and output payload for a given job.",
)
async def get_job_status(
    job_id: str,
    job_manager: JobManager = Depends(get_job_manager),
    authorization: Optional[str] = Header(None, description="JWT Bearer token"),
) -> JobStatusResponse:
    """Retrieve the real-time execution state of a previously submitted job.

    Args:
        job_id: Unique UUID string returned by the /invoke endpoint.
        job_manager: Injected JobManager instance.
        authorization: Optional Bearer token header for authentication.

    Returns:
        JobStatusResponse: Current status and results dictionary if completed.

    Raises:
        HTTPException: 404 Not Found if job_id does not exist in the task store.
    """
    job_status = await job_manager.get_job_status(job_id)

    if job_status is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with identifier '{job_id}' was not found.",
        )

    return job_status


@router.get(
    "/agents",
    response_model=AgentListResponse,
    summary="List registered agents",
    description="Returns the full catalog of registered agents with descriptions, capabilities, and dynamic JSON parameter schemas.",
)
async def list_agents() -> AgentListResponse:
    """Retrieve catalog of all registered MVP agents for dynamic UI generation.

    Returns:
        AgentListResponse: List of agent descriptors and schemas.
    """
    agents = get_all_registered_agents()
    return AgentListResponse(agents=agents)
