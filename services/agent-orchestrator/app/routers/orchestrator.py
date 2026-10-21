"""Orchestrator API routes.

- POST /api/v1/orchestrator/invoke         -> enqueue job, return 202 + jobId
- GET  /api/v1/orchestrator/jobs/{job_id}  -> poll job status
- GET  /api/v1/orchestrator/agents         -> list registered agents

TODO(Anindya): implement in Phase 1.
"""
