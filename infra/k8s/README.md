# CareerPilot Cloud-Native Kubernetes Manifests

Production-grade declarative Kubernetes YAML manifests for the CareerPilot multi-agent AI career intelligence platform.

## Directory Structure
- `namespace.yaml`: Defines the isolated `careerpilot` namespace.
- `configmap.yaml`: Shared application configuration (endpoints, ports, security parameters).
- `secrets.yaml`: Sensitive credentials (database passwords, JWT secrets, API tokens).
- `deployments/`: High-availability deployments with resource requests/limits, liveness & readiness probes.
  - `auth-deployment.yaml`
  - `profile-deployment.yaml`
  - `orchestrator-deployment.yaml`
  - `frontend-deployment.yaml`
  - `mcp-deployment.yaml`
  - `databases-deployment.yaml`
- `services/`: ClusterIP routing services for internal microservice communication.
- `ingress.yaml`: Nginx Ingress Controller routing HTTP traffic by path prefix.

## Deployment Steps
```bash
# 1. Create namespace
kubectl apply -f infra/k8s/namespace.yaml

# 2. Apply configuration and secrets
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secrets.yaml

# 3. Deploy databases, services and applications
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/

# 4. Deploy Ingress routing
kubectl apply -f infra/k8s/ingress.yaml
```
