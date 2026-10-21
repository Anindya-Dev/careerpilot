"""Pydantic request schemas.

AgentName (str, Enum) — the 7 MVP agents:
    career_vision, career_drift, skill_intelligence, career_evidence,
    opportunity_discovery, interview_readiness, career_health

InvokeRequest:
    agent: AgentName
    user_id: str (UUID)
    params: Dict[str, Any]

TODO(Anindya): implement in Phase 1.
"""
