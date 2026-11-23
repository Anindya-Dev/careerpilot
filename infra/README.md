# CareerPilot Infrastructure & Deployment Guide

**Owner**: Arik (Member 3 — DevOps & Platform Integration)

This directory contains the production-grade Docker Compose orchestration stack and cloud-native Kubernetes manifests for the CareerPilot platform.

---

## 1. Architecture Overview

CareerPilot is organized into a modular container topology connected via an isolated internal bridge network (`careerpilot-network`):

```
                   [ Internet / Client Browser ]
                                 │
                     ┌───────────┴───────────┐
                     │   Frontend (Port 3000) │
                     └───────────┬───────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
┌────┴────────────┐     ┌────────┴──────────┐     ┌──────────┴─────────────┐
│  Auth Service   │     │  Profile Service  │     │   Agent Orchestrator   │
│   (Port 5001)   │     │    (Port 5002)    │     │      (Port 8000)       │
└────┬────────────┘     └────────┬──────────┘     └────┬───────────┬───────┘
     │                           │                     │           │
     └─────────────┬─────────────┘                     │           │
                   │                                   │           │
            ┌──────┴──────┐                     ┌──────┴─────┐ ┌───┴─────────┐
            │   MongoDB   │                     │   Redis    │ │ Neo4j Graph │
            │ (Port 27017)│                     │(Port 6379) │ │ (7474/7687) │
            └─────────────┘                     └────────────┘ └─────────────┘
                                                       │
                                                ┌──────┴─────┐
                                                │  ChromaDB  │
                                                │ (Port 8001)│
                                                └────────────┘
                                                       │
                                        ┌──────────────┴──────────────┐
                                        │                             │
                                 ┌──────┴───────┐              ┌──────┴────────┐
                                 │  GitHub MCP  │              │ Job Board MCP │
                                 │  (Port 5005) │              │  (Port 5006)  │
                                 └──────────────┘              └───────────────┘
```

---

## 2. Quick Start: Master Docker Compose

### Prerequisites
- Docker Engine 24.0+ and Docker Compose v2.20+
- 4GB+ RAM recommended for local graph and vector stores

### One-Command Boot
```bash
# From repository root
docker compose -f infra/docker-compose.yml up -d
```

### Verifying Service Liveness
| Service | URL / Health Probe | Expected Response |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | Nginx HTTP 200 (React App) |
| **Auth Service** | `http://localhost:5001/health` | `{"status": "healthy", "service": "auth-service"}` |
| **Profile Service** | `http://localhost:5002/health` | `{"status": "healthy", "service": "profile-service"}` |
| **Agent Orchestrator** | `http://localhost:8000/health` | `{"status": "healthy"}` |
| **GitHub MCP** | `http://localhost:5005/health` | `{"status": "healthy", "server": "github-mcp"}` |
| **Job Board MCP** | `http://localhost:5006/health` | `{"status": "healthy", "server": "job-board-mcp"}` |
| **Neo4j Browser** | `http://localhost:7474` | Neo4j Web Console |

---

## 3. Kubernetes Deployment (`k8s/`)

For cloud deployment (EKS / GKE / AKS / Minikube):
```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secrets.yaml
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
kubectl apply -f infra/k8s/ingress.yaml
```
