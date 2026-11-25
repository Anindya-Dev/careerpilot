"""Pydantic request schemas.

These models define the *contract* for incoming requests. FastAPI validates
every request body against them and returns a clean HTTP 422 for anything
that does not match — so invalid input never reaches our orchestration logic.
"""

from enum import Enum
from typing import Any, Dict

from pydantic import BaseModel, Field, model_validator


class AgentName(str, Enum):
    """Strict enumeration of the 7 MVP agents supported by CareerPilot.

    Inheriting from `str` means each member serializes to its string value
    (e.g. `career_vision`), which keeps JSON output human-readable while
    still giving us enum safety during validation.
    """

    CAREER_VISION = "career_vision"
    CAREER_DRIFT = "career_drift"
    SKILL_INTELLIGENCE = "skill_intelligence"
    CAREER_EVIDENCE = "career_evidence"
    OPPORTUNITY_DISCOVERY = "opportunity_discovery"
    INTERVIEW_READINESS = "interview_readiness"
    CAREER_HEALTH = "career_health"


class InvokeRequest(BaseModel):
    """Payload for `POST /api/v1/orchestrator/invoke`.

    Attributes:
        agent: The target agent identifier (must be one of `AgentName`).
        user_id: UUID of the authenticated student the job belongs to.
        params: Free-form, agent-specific parameters.
    """

    agent: AgentName = Field(..., description="Target agent identifier")
    user_id: str = Field(..., description="UUID of the authenticated student")
    params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Dynamic agent parameters",
    )

    @model_validator(mode="before")
    @classmethod
    def handle_agent_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "agent" not in data and "agent_name" in data:
                data["agent"] = data["agent_name"]
        return data

    model_config = {
        "json_schema_extra": {
            "example": {
                "agent": "interview_readiness",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "params": {
                    "target_role": "Data Scientist",
                    "difficulty": "intermediate",
                },
            }
        }
    }
