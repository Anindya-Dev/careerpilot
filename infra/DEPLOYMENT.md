# CareerPilot Production Deployment Manual & Runbook

**Author**: Arik (Member 3 — DevOps & Platform Integration)  
**Target Environment**: Local Docker Compose / Managed Kubernetes (DigitalOcean / Minikube)

---

## 1. Quick Start: Single-Command Docker Deployment

### System Prerequisites
- Docker Engine 24.0+ & Docker Compose v2.20+
- Minimum 4GB RAM, 10GB free disk space

### Execution Steps
```bash
# 1. Clone repository
git clone https://github.com/Anindya-Dev/careerpilot.git
cd careerpilot

# 2. Configure environment
cp .env.example .env

# 3. Boot full platform stack
docker compose -f infra/docker-compose.yml up -d --build

# 4. Verify platform health
python scripts/smoke_test.py
```

### Port Map
| Service | Host Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| `frontend` | 3000 | HTTP | Vite React SPA UI |
| `auth-service` | 5001 | HTTP | JWT authentication & user sessions |
| `profile-service` | 5002 | HTTP | Profile & skill portfolio management |
| `agent-orchestrator`| 8000 | HTTP | LangGraph multi-agent coordination |
| `github-mcp` | 5005 | HTTP | Code evidence inspection & AST audit |
| `job-board-mcp` | 5006 | HTTP | Job postings retrieval & demand trends |
| `neo4j` | 7474, 7687 | HTTP / Bolt | Knowledge Graph database |
| `chromadb` | 8001 | HTTP | Vector similarity store |
| `mongodb` | 27017 | TCP | Document store for auth & profile |
| `redis` | 6379 | TCP | Asynchronous FIFO task queue |

---

## 2. Cloud Kubernetes Deployment (`infra/k8s/`)

### Cluster Pre-requisites
- A running Kubernetes cluster (v1.26+)
- `kubectl` configured with cluster admin context
- Nginx Ingress Controller installed

### Deployment Commands
```bash
# Apply in order
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secrets.yaml
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
kubectl apply -f infra/k8s/ingress.yaml
```

### Verifying Rollout
```bash
kubectl get pods -n careerpilot -w
kubectl get ingress -n careerpilot
```

---

## 3. Disaster Recovery & Troubleshooting

### Issue 1: Neo4j Authentication Failure
If Neo4j returns `Neo.ClientError.Security.Unauthorized`, delete existing volume and recreate:
```bash
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d
```

### Issue 2: External GitHub API Rate Limiting
The GitHub MCP server includes an automatic synthetic fallback simulator. It automatically activates when `GITHUB_TOKEN` is unset or exhausted, guaranteeing zero presentation failures during live viva evaluations.
