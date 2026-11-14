"""Pydantic response schemas.

These models define the *contract* for outgoing responses. Defining them
explicitly (rather than returning ad-hoc dicts) gives consumers a stable,
documented shape and lets FastAPI generate accurate OpenAPI schemas.
"""

from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel


class JobStatus(str, Enum):
    """Lifecycle states a job can be in while being processed."""

    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class JobStatusResponse(BaseModel):
    """Result of `GET /api/v1/orchestrator/jobs/{job_id}`."""

    job_id: str
    status: JobStatus
    result: Optional[Dict[str, Any]] = None


class AgentInfo(BaseModel):
    """A single registered agent, exposed via `GET /agents` for dynamic UI."""

    name: str
    description: str
    capabilities: list[str]
    input_schema: Dict[str, Any]


class AgentListResponse(BaseModel):
    """Response of `GET /api/v1/orchestrator/agents`."""

    agents: list[AgentInfo]
