# CareerPilot Production Deployment Manual & Runbook

**Author**: Arik (Member 3 — DevOps & Platform Integration)  
**Target Environments**: 
- Option 1: Hardened Cloud Production Stack (`infra/docker-compose.prod.yml`) with Port Shielding
- Option 2: Local Demo Stack with Zero-Config Cloudflare Tunnel (Instant Public HTTPS)
- Option 3: Cloud Kubernetes Cluster (`infra/k8s/`)

---

## 1. Production Docker Compose Stack (`docker-compose.prod.yml`)

### Architecture & Security Hardening
In this production topology:
- **Port Shielding**: All databases (MongoDB, Redis, Neo4j, ChromaDB) and microservices are completely unexposed to the host/internet.
- **Single Ingress Gateway**: Only the Nginx Gateway container (`cp-gateway`) binds to port `80`/`443`.
- **Zero CORS / Mixed Content**: All requests to `/api/v1/auth`, `/api/v1/profile`, and `/api/v1/orchestrator` flow through the same domain as the React SPA.
- **Log Rotation**: Every container enforces Docker json-file log rotation (`max-size: 50m`, `max-file: 3`) to prevent disk exhaustion.

### Launching Production Stack
```bash
# 1. From repository root
cd careerpilot

# 2. Configure production credentials
cp .env.example .env

# 3. Boot production stack
docker compose -f infra/docker-compose.prod.yml up -d --build

# 4. Verify gateway liveness
curl http://localhost/gateway-health
```

---

## 2. Instant Zero-Cost Public HTTPS Demo (Cloudflare Tunnel)

For college viva presentations or remote evaluations where you need an instant public URL without buying a domain or configuring SSL certificates:

### Step 1: Install Cloudflared
- **Windows**: `winget install --id Cloudflare.cloudflared` or download from [cloudflare.com](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
- **Linux / macOS**: `brew install cloudflare/cloudflare/cloudflared` or `apt-get install cloudflared`

### Step 2: Boot Platform & Launch Tunnel
```bash
# Start the production stack
docker compose -f infra/docker-compose.prod.yml up -d

# Open instant encrypted tunnel to port 80
cloudflared tunnel --url http://localhost:80
```
Cloudflare will immediately generate an HTTPS URL (e.g. `https://careerpilot-eval-demo.trycloudflare.com`). Anyone on any device can test the live platform.

---

## 3. Cloud Kubernetes Deployment (`infra/k8s/`)

For multi-node cloud clusters (DigitalOcean DOKS, Google GKE, AWS EKS):
```bash
# Apply in order
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secrets.yaml
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
kubectl apply -f infra/k8s/ingress.yaml
```

---

## 4. Production Verification & Diagnostics

```bash
# Check all container states
docker compose -f infra/docker-compose.prod.yml ps

# Run automated smoke test
python scripts/smoke_test.py

# Check orchestrator logs
docker compose -f infra/docker-compose.prod.yml logs -f agent-orchestrator
```
