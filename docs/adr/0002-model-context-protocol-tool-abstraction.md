# ADR 0002: Model Context Protocol (MCP) Tool Abstraction Layer

## Context & Problem Statement
AI Agents in CareerPilot (Career Evidence, Skill Intelligence, Opportunity Discovery) require live external data from GitHub and tech job boards. 

Directly hardcoding HTTP requests or SDK calls inside agent reasoning loops tightly couples agent logic to third-party APIs. Furthermore, during academic viva evaluations or live presentations, third-party API rate limits (e.g., GitHub's 60 req/hr unauthenticated limit) or network outages could cause demo failures.

## Decision
We implemented tool integration using the **Model Context Protocol (MCP)** specification:
1. Each external data integration runs as an independent, lightweight microservice (`github-mcp`, `job-board-mcp`).
2. Protocol contract exposes three standard endpoints:
   - `GET /health` (liveness probe).
   - `GET /tools` (JSON Schema discovery).
   - `POST /invoke` (dynamic execution).
3. Built an **offline synthetic fallback simulator** into `github-mcp` that deterministically generates realistic AST complexity and repository data when API tokens are missing or rate-limited.
4. Pre-seeded `job-board-mcp` with 70 realistic, verified job postings (`data/job_postings.json`).

## Consequences
- **Positive**: Strict decoupling—new data sources can be added without modifying agent logic.
- **Positive**: Zero presentation risk during project viva presentations.
- **Negative**: Introduces minor network overhead across the container bridge network.
