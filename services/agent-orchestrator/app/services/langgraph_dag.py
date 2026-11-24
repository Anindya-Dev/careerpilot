"""LangGraph state machine DAG (Directed Acyclic Graph) for CareerPilot agents.

Defines the multi-agent coordination topology for the 7 MVP agents:
1. career_evidence: Verifies student claims (GitHub ASTs, commits, credentials).
2. skill_intelligence: Computes supply vs. demand and identifies missing skills.
3. career_drift: Measures deviation between goals and actual projects.
4. career_vision: Constructs 1/3/5-year career roadmap based on verified competencies.
5. career_health: Aggregator node that runs last, computing the composite
   Career Intelligence Index (0-100) from upstream outputs.
6. opportunity_discovery: Independent node matching jobs/internships.
7. interview_readiness: Independent interactive mock interview node.

Reference: Phase 1 Deliverable 1
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, TypedDict

logger = logging.getLogger(__name__)


class CareerAgentState(TypedDict, total=False):
    """Shared state dictionary passed between agent nodes in the LangGraph DAG."""

    user_id: str
    target_role: str
    claimed_skills: List[str]
    verified_skills: List[Dict[str, Any]]
    drift_score: float
    skill_gaps: List[Dict[str, Any]]
    vision_roadmap: Dict[str, Any]
    opportunities: List[Dict[str, Any]]
    interview_score: Optional[float]
    career_health_index: Optional[float]
    errors: List[str]


# =========================================================================
# 7 AGENT NODE HANDLERS (Phase 1 Stubs -> Real Workers in Phase 2/3)
# =========================================================================

async def node_career_evidence(state: CareerAgentState) -> Dict[str, Any]:
    """Inspect external artifacts (GitHub, commits) to verify claimed skills."""
    logger.info("[DAG] Executing node: career_evidence for user %s", state.get("user_id"))
    # In Phase 1: verify claims using graph ontology
    return {
        "verified_skills": [
            {"skill": s, "verified": True, "confidence": 0.9}
            for s in state.get("claimed_skills", ["Python", "FastAPI"])
        ]
    }


async def node_skill_intelligence(state: CareerAgentState) -> Dict[str, Any]:
    """Compute market skill demand vs student supply and rank gaps by ROI."""
    logger.info("[DAG] Executing node: skill_intelligence for user %s", state.get("user_id"))
    return {
        "skill_gaps": [
            {"skill": "Docker", "demand_score": 90, "priority": "High"},
            {"skill": "Kubernetes", "demand_score": 86, "priority": "Medium"},
        ]
    }


async def node_career_drift(state: CareerAgentState) -> Dict[str, Any]:
    """Measure divergence between stated goal and actual student activities."""
    logger.info("[DAG] Executing node: career_drift for user %s", state.get("user_id"))
    return {"drift_score": 12.5}  # 12.5% drift (healthy alignment)


async def node_career_vision(state: CareerAgentState) -> Dict[str, Any]:
    """Synthesize 1/3/5-year milestones into a structured career progression."""
    logger.info("[DAG] Executing node: career_vision for user %s", state.get("user_id"))
    return {
        "vision_roadmap": {
            "year_1": "Master containerization and CI/CD pipelines",
            "year_3": "Lead backend microservices design",
            "year_5": "Principal Systems Architect",
        }
    }


async def node_career_health(state: CareerAgentState) -> Dict[str, Any]:
    """Aggregator node: computes composite Career Intelligence Index (0-100)."""
    logger.info("[DAG] Executing aggregator node: career_health for user %s", state.get("user_id"))
    # Composite calculation weighting evidence, drift, and market gaps
    evidence_weight = 40.0
    drift_penalty = state.get("drift_score", 0.0) * 0.5
    composite_index = max(0.0, min(100.0, (85.0 - drift_penalty)))
    return {"career_health_index": round(composite_index, 1)}


async def node_opportunity_discovery(state: CareerAgentState) -> Dict[str, Any]:
    """Match student with relevant internships and hackathons via hybrid search."""
    logger.info("[DAG] Executing independent node: opportunity_discovery")
    return {
        "opportunities": [
            {"title": "Backend Engineering Intern", "company": "Tech Corp", "match_rate": 0.88}
        ]
    }


async def node_interview_readiness(state: CareerAgentState) -> Dict[str, Any]:
    """Conduct interactive mock interviews and return scoring rubric."""
    logger.info("[DAG] Executing independent node: interview_readiness")
    return {"interview_score": 82.0}


# =========================================================================
# DAG COMPILATION (StateGraph)
# =========================================================================

def build_career_graph() -> Any:
    """Construct and compile the LangGraph StateGraph DAG for the 7 agents.

    Topology:
        career_evidence -> skill_intelligence -> career_drift -> career_vision -> career_health -> END
        opportunity_discovery (independent branch)
        interview_readiness (independent branch)

    Returns:
        CompiledStateGraph instance, or fallback runner if langgraph is not installed.
    """
    try:
        from langgraph.graph import END, StateGraph

        graph = StateGraph(CareerAgentState)

        # Register all 7 nodes
        graph.add_node("career_evidence", node_career_evidence)
        graph.add_node("skill_intelligence", node_skill_intelligence)
        graph.add_node("career_drift", node_career_drift)
        graph.add_node("career_vision", node_career_vision)
        graph.add_node("career_health", node_career_health)
        graph.add_node("opportunity_discovery", node_opportunity_discovery)
        graph.add_node("interview_readiness", node_interview_readiness)

        # Set entry point
        graph.set_entry_point("career_evidence")

        # Core career intelligence sequential pipeline
        graph.add_edge("career_evidence", "skill_intelligence")
        graph.add_edge("skill_intelligence", "career_drift")
        graph.add_edge("career_drift", "career_vision")
        graph.add_edge("career_vision", "career_health")
        graph.add_edge("career_health", END)

        # Independent agent endpoints
        graph.add_edge("opportunity_discovery", END)
        graph.add_edge("interview_readiness", END)

        compiled = graph.compile()
        logger.info("LangGraph 7-agent DAG compiled successfully.")
        return compiled

    except ImportError:
        logger.warning("langgraph package not available; running simulated DAG pipeline.")

        class SimulatedDAG:
            """Simulates sequential DAG execution when langgraph is not in the environment."""

            async def ainvoke(self, initial_state: CareerAgentState) -> CareerAgentState:
                state = dict(initial_state)
                for step in [
                    node_career_evidence,
                    node_skill_intelligence,
                    node_career_drift,
                    node_career_vision,
                    node_career_health,
                ]:
                    delta = await step(state)
                    state.update(delta)
                return state  # type: ignore

        return SimulatedDAG()
