# ADR 0001: Multi-Container Docker Compose Orchestration Topology

## Context & Problem Statement
CareerPilot is a polyglot microservice platform consisting of Node.js services (Auth, Profile), Python FastAPI services (Agent Orchestrator, GitHub MCP, Job Board MCP), and multiple persistent data stores (MongoDB, Redis, Neo4j, ChromaDB). 

Developing and running these services natively on local machines creates dependency friction ("it works on my machine" syndrome), port conflicts, and unrepeatable test conditions.

## Decision
We chose Docker Compose as the local development orchestration standard with a dedicated internal bridge network (`careerpilot-network`) and named volumes:
1. Every service runs within an isolated container image using multi-stage builds.
2. Services resolve dependencies via Docker's internal DNS (e.g. `http://auth-service:5001`, `bolt://neo4j:7687`).
3. Healthchecks are declared for all database dependencies (`mongodb`, `redis`, `neo4j`, `chromadb`) and microservices enforce `condition: service_healthy` startup sequencing.

## Consequences
- **Positive**: Clean, zero-install boot via `docker compose -f infra/docker-compose.yml up -d`.
- **Positive**: Complete environmental parity between team members and CI runners.
- **Negative**: Requires 4GB+ RAM allocated to Docker desktop for concurrent execution of graph and vector databases.
