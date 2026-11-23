# ADR 0003: Cloud-Native Declarative Kubernetes Architecture

## Context & Problem Statement
For enterprise deployment and university capstone evaluation, the platform must demonstrate cloud scalability, horizontal autoscaling capability, and high availability.

## Decision
We designed declarative Kubernetes YAML manifests under `infra/k8s/`:
1. **Namespace Isolation**: Encapsulates all components under the `careerpilot` namespace.
2. **Centralized Configuration**: Decoupled `ConfigMap` for non-sensitive settings and `Secret` for credentials.
3. **High Availability**: 2 replicas per microservice with explicit CPU/memory `requests` and `limits`.
4. **Resilience**: Configured liveness probes (`/health`) and readiness probes (`/ready`).
5. **Ingress Routing**: Unified Nginx Ingress routing external HTTP traffic by path prefix (`/api/v1/auth`, `/api/v1/profile`, `/api/v1/orchestrator`, and `/` for the React SPA).

## Consequences
- **Positive**: Production-ready deployment path for cloud platforms (GKE, EKS, DigitalOcean K8s).
- **Positive**: Independent scaling of compute-heavy agent workers versus I/O-heavy auth services.
