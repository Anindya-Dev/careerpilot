"""Health & readiness probes.

- GET /health -> liveness (returns 200 with status + timestamp)
- GET /ready  -> readiness (pings Redis, Neo4j, ChromaDB; 503 if any down)

TODO(Anindya): implement in Phase 1.
"""
