"""LangGraph state machine DAG stub.

Defines the dependency graph for the 7 MVP agents:
    career_vision, career_drift, skill_intelligence, career_evidence
        -> career_health (runs last, consumes upstream outputs)
    opportunity_discovery, interview_readiness -> independent

TODO(Anindya): implement in Phase 1 (stub) / Phase 3 (full DAG).
"""
