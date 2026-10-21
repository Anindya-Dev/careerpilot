"""Pydantic response schemas.

JobStatusResponse:
    { job_id, status: queued|running|completed|failed, result }

AgentListResponse:
    list of registered agents + descriptions + capabilities + input schemas

TODO(Anindya): implement in Phase 1.
"""
