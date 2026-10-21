# Agent Orchestrator (Python + FastAPI + Redis + LangGraph)

Owner: Anindya

Coordinates agent execution requests, manages background queues, and provides status polling.

```
app/
├── main.py              # FastAPI app, lifecycle, CORS
├── config.py            # Pydantic BaseSettings from .env
├── routers/
│   ├── orchestrator.py  # POST /invoke, GET /jobs/{id}, GET /agents
│   └── health.py        # GET /health, GET /ready
├── models/
│   ├── requests.py      # InvokeRequest + AgentName enum
│   └── responses.py     # JobStatusResponse, AgentListResponse
├── services/
│   ├── agent_registry.py # maps agent keys -> worker functions
│   ├── job_manager.py    # Redis enqueue, status, result fetch
│   └── langgraph_dag.py  # 7-agent state machine stub
└── db/
    ├── neo4j_client.py   # async Neo4j driver + Cypher runners
    └── chroma_client.py  # ChromaDB client + collections
```

API endpoints (v1):
- POST /api/v1/orchestrator/invoke — enqueue job, returns 202 + jobId
- GET /api/v1/orchestrator/jobs/{job_id} — poll status
- GET /api/v1/orchestrator/agents — list registered agents
- GET /health, GET /ready — liveness/readiness probes
