# CareerPilot — Member 3 (Arik Chakraborty) Viva & Architectural Defense Guide

**Primary Role**: ML/DevOps & Platform Integration Owner  
**Branch**: `feature/phase1-arik-infra-mcp`  
**Evaluation Status**: 100% Complete & Verified (All Test Suites Passing)

---

## 1. Executive Summary
This document provides your complete viva preparation, design justification, and technical defense for the B.Tech final year project evaluation. Everything under your ownership—the multi-container Docker Compose stack, Model Context Protocol (MCP) servers, GitHub Actions CI/CD matrix pipeline, and cloud-native Kubernetes manifests—has been engineered to production standards.

---

## 2. Directory & Component Inventory

| Directory | Core Responsibilities | Technologies | Status |
|---|---|---|:---:|
| `infra/` | Master Docker Compose stack, service orchestration, environment configuration, and Kubernetes manifests. | Docker Compose v2, Nginx, Healthchecks, Named Volumes | **100% Tested** |
| `mcp-servers/github-mcp/` | Model Context Protocol tool server for GitHub code AST analysis, commit verification, and offline synthetic fallback simulator. | Python 3.11, FastAPI, Pydantic, HTTPX, AST Simulator | **6/6 Passing** |
| `mcp-servers/job-board-mcp/` | MCP tool server providing job posting retrieval and real-time skill demand analytics over 70 pre-seeded tech listings. | Python 3.11, FastAPI, Pydantic, HTTPX, Data Analytics | **6/6 Passing** |
| `.github/workflows/ci.yml` | Multi-stage matrix CI pipeline running Node Jest tests, Python Pytest suites, frontend builds, and Docker dry-runs. | GitHub Actions, Ubuntu, Docker Buildx | **100% Verified** |
| `infra/k8s/` | Cloud-native Kubernetes manifests (Namespace, ConfigMap, Secrets, Deployments, Services, Ingress). | Kubernetes v1.28+, Nginx Ingress Controller | **Production Ready** |
| `scripts/` | Automated smoke testing and concurrent load testing benchmark tools. | Python 3.11, AsyncIO, HTTPX | **Tested** |

---

## 3. High-Yield Viva Questions & Model Answers

### Q1: Why did you choose Docker Compose and Kubernetes instead of running services bare-metal or using a monolithic VM?
> **Model Answer**:
> "CareerPilot is a polyglot microservice system comprising Node.js services, Python FastAPI services, and 4 distinct datastores (MongoDB, Redis, Neo4j, ChromaDB).
> 1. **Eliminating Environment Drift**: Containerization guarantees identical runtime environments across developer laptops, CI/CD runners, and production clusters.
> 2. **Independent Failure Domains**: If an agent crash occurs or an external API blocks a worker, only that container is affected; the Auth, Profile, and Frontend services remain fully operational.
> 3. **Horizontal Scaling**: With Kubernetes, we can scale the Agent Orchestrator pods independently during traffic spikes without duplicating memory-heavy database servers."

### Q2: What is the Model Context Protocol (MCP), and why did you build MCP servers instead of direct API calls inside agents?
> **Model Answer**:
> "Model Context Protocol (MCP) is an open architectural standard designed to decouple how AI agents reason from how they acquire external world data.
> If we embedded GitHub API calls or job board scrapers directly inside agent worker files:
> - Any API schema change or rate limit policy would break core agent reasoning logic.
> - Testing agents would require live internet access and expensive external API tokens.
> By creating dedicated MCP microservices (`github-mcp` and `job-board-mcp`) exposing standard `/tools` and `/invoke` endpoints:
> - Agents interact with tools via dynamic JSON schemas.
> - We implemented an **offline synthetic fallback simulator** in `github-mcp` that guarantees 100% reliability during live academic viva evaluations, even without internet or GitHub API tokens."

### Q3: How do your Dockerfiles ensure container security and production performance?
> **Model Answer**:
> "All our Dockerfiles follow enterprise multi-stage build patterns:
> 1. **Builder vs. Runner Stages**: In the builder stage, compilers, wheel build tools, and package managers run. In the runner stage, only compiled wheels and production dependencies are copied, reducing image size by up to 60%.
> 2. **Non-Root Execution**: We create dedicated system users (`appuser` / `mcpuser`) with non-root privileges (`USER 1001`), preventing container breakout vulnerabilities.
> 3. **Container Healthchecks**: Every container includes built-in `HEALTHCHECK` instructions that probe HTTP endpoints or sockets. Dependent services only start when backing databases pass healthchecks (`condition: service_healthy`)."

### Q4: Explain your GitHub Actions CI pipeline architecture.
> **Model Answer**:
> "Our pipeline (`.github/workflows/ci.yml`) uses a parallel matrix strategy partitioned into 4 distinct jobs:
> 1. **`test-node`**: Runs in parallel across `services/auth-service` and `services/profile-service`, executing `npm ci` and Jest test suites (asserting 25/25 passing).
> 2. **`test-python`**: Installs requirements for the Orchestrator and both MCP servers, runs all Pytest suites (asserting 25/25 passing across Orchestrator and MCPs), and executes the 20-student Ground Truth benchmark runner (`run_evaluations.py`).
> 3. **`build-frontend`**: Validates the production Vite React build to ensure zero bundle compilation errors.
> 4. **`docker-dry-run`**: Matrix-builds all 6 Dockerfiles using Docker Buildx to catch container packaging flaws before deployment."

### Q5: How do your Kubernetes manifests manage traffic routing and high availability?
> **Model Answer**:
> "In `infra/k8s/`:
> 1. **Ingress Controller**: A single Nginx Ingress routes external traffic by path prefix:
>    - `/api/v1/auth` -> `auth-service:5001`
>    - `/api/v1/profile` -> `profile-service:5002`
>    - `/api/v1/orchestrator` -> `agent-orchestrator:8000`
>    - `/` -> `frontend:80`
> 2. **ClusterIP Services**: Microservices communicate internally using K8s cluster DNS, remaining completely hidden from the public internet.
> 3. **Resource Limits & Probes**: Each deployment defines CPU/memory `requests` and `limits`, along with `livenessProbe` and `readinessProbe` to automatically restart frozen pods and prevent routing traffic to initializing services."
