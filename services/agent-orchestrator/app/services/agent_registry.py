"""Agent Registry.

Defines the metadata, capabilities, descriptions, and parameter contracts
for all 7 MVP AI agents supported by CareerPilot.

Powers:
- GET /api/v1/orchestrator/agents endpoint (used by dynamic UI forms in the React SPA).
- Orchestrator dispatching and validation in worker pipelines.
"""

from __future__ import annotations

from typing import Any, Callable, Coroutine, Dict, List, Optional

from app.models.requests import AgentName
from app.models.responses import AgentInfo

# Type alias for asynchronous agent worker function stubs
AgentWorker = Callable[[str, Dict[str, Any]], Coroutine[Any, Any, Dict[str, Any]]]

# 7 MVP Agent Catalog with formal metadata and input parameter schemas
AGENT_CATALOG: Dict[AgentName, Dict[str, Any]] = {
    AgentName.CAREER_VISION: {
        "name": AgentName.CAREER_VISION.value,
        "description": "Generates a structured 1/3/5-year career roadmap based on target roles, current competencies, and industry trajectories.",
        "capabilities": [
            "1, 3, and 5-year milestone progression planning",
            "Target role prerequisite path mapping via Knowledge Graph",
            "Alternative career specialization recommendations",
        ],
        "input_schema": {
            "type": "object",
            "properties": {
                "target_role": {"type": "string", "description": "Aspirational career title (e.g. 'MLOps Engineer')"},
                "timeline_years": {"type": "integer", "default": 5, "description": "Roadmap planning horizon"},
            },
            "required": ["target_role"],
        },
    },
    AgentName.CAREER_DRIFT: {
        "name": AgentName.CAREER_DRIFT.value,
        "description": "Detects divergence between a student's stated career goals and their actual day-to-day project commits, coursework, and activity.",
        "capabilities": [
            "Goal divergence scoring (0-100%)",
            "Skill misalignment alerts",
            "Real-time course-correction recommendations",
        ],
        "input_schema": {
            "type": "object",
            "properties": {
                "lookback_days": {"type": "integer", "default": 90, "description": "Activity analysis window in days"},
            },
        },
    },
    AgentName.SKILL_INTELLIGENCE: {
        "name": AgentName.SKILL_INTELLIGENCE.value,
        "description": "Analyzes market skill demand vs. student supply, ranking missing competencies by Career ROI and difficulty.",
        "capabilities": [
            "Graph-based skill gap detection",
            "ROI calculation: (Market Demand * Salary Premium) / Learning Effort",
            "High-priority skill acquisition sequencing",
        ],
        "input_schema": {
            "type": "object",
            "properties": {
                "industry_domain": {"type": "string", "default": "Software Engineering"},
            },
        },
    },
    AgentName.CAREER_EVIDENCE: {
        "name": AgentName.CAREER_EVIDENCE.value,
        "description": "Verifies student skill and project claims against external evidence (GitHub commits, code ASTs, verified credentials).",
        "capabilities": [
            "GitHub repository code depth and AST analysis via MCP",
            "Commit authenticity and authorship verification",
            "Claim confidence score assignment (0.0 to 1.0)",
        ],
        "input_schema": {
            "type": "object",
            "properties": {
                "github_username": {"type": "string", "description": "Student's GitHub handle"},
                "repo_names": {"type": "array", "items": {"type": "string"}, "description": "Repositories to inspect"},
            },
        },
    },
    AgentName.OPPORTUNITY_DISCOVERY: {
        "name": AgentName.OPPORTUNITY_DISCOVERY.value,
        "description": "Matches students with tailored internships, hackathons, and open-source contributions using hybrid semantic and graph filtering.",
        "capabilities": [
            "Hybrid vector (ChromaDB) + graph (Neo4j) opportunity matching",
            "Skill-fit percentage computation",
            "Application readiness gap analysis per opportunity",
        ],
        "input_schema": {
            "type": "object",
            "properties": {
                "opportunity_type": {
                    "type": "string",
                    "enum": ["internship", "full-time", "hackathon", "research"],
                    "default": "internship",
                },
                "remote_only": {"type": "boolean", "default": False},
            },
        },
    },
    AgentName.INTERVIEW_READINESS: {
        "name": AgentName.INTERVIEW_READINESS.value,
        "description": "Conducts multi-turn adaptive mock technical and behavioral interviews with rubric-based scoring.",
        "capabilities": [
            "Role-specific interview simulation (System Design, DSA, Behavioral)",
            "Dynamic difficulty adjustment based on user responses",
            "Structured feedback rubrics with gap identification",
        ],
        "input_schema": {
            "type": "object",
            "properties": {
                "target_role": {"type": "string", "description": "Target job title for the mock interview"},
                "difficulty": {"type": "string", "enum": ["beginner", "intermediate", "advanced"], "default": "intermediate"},
                "focus_area": {"type": "string", "default": "Data Structures & Algorithms"},
            },
            "required": ["target_role"],
        },
    },
    AgentName.CAREER_HEALTH: {
        "name": AgentName.CAREER_HEALTH.value,
        "description": "Computes the composite 'Career Intelligence Index' (0-100) aggregating evidence, readiness, drift, and market demand.",
        "capabilities": [
            "Composite Career Intelligence Index calculation",
            "Strengths, Weaknesses, Opportunities, Threats (SWOT) synthesis",
            "Executive summary generation for student dashboard",
        ],
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
}


def get_all_registered_agents() -> List[AgentInfo]:
    """Retrieve metadata for all 7 registered MVP agents.

    Returns:
        List[AgentInfo]: Complete list of registered agent schemas.
    """
    return [
        AgentInfo(
            name=data["name"],
            description=data["description"],
            capabilities=data["capabilities"],
            input_schema=data["input_schema"],
        )
        for data in AGENT_CATALOG.values()
    ]


def get_agent_metadata(agent_name: AgentName) -> Optional[AgentInfo]:
    """Retrieve metadata for a specific agent.

    Args:
        agent_name: Valid AgentName enum.

    Returns:
        Optional[AgentInfo]: Agent schema if registered, None otherwise.
    """
    data = AGENT_CATALOG.get(agent_name)
    if not data:
        return None
    return AgentInfo(
        name=data["name"],
        description=data["description"],
        capabilities=data["capabilities"],
        input_schema=data["input_schema"],
    )
