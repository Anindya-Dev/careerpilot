# CareerPilot

Multi-Agent AI Career Intelligence Platform — an AI-powered career guidance companion that maintains a living "Career Intelligence Profile" for each student (skills, projects, goals, certifications, evidence) and runs a team of specialized AI agents over it.

## The 7 MVP Agents

| Agent | Purpose |
|-------|---------|
| `career_vision` | 1/3/5-year career roadmap |
| `career_drift` | Detect deviation from stated goals |
| `skill_intelligence` | Skill demand vs. supply, ranked by ROI |
| `career_evidence` | Verify claims against GitHub/LinkedIn/certs |
| `opportunity_discovery` | Match jobs/internships/hackathons |
| `interview_readiness` | Mock interviews + feedback |
| `career_health` | Composite "Career Intelligence Index" score |

## Repository Structure

```
careerpilot/
├── frontend/                 # React + Vite SPA (Hussain, Sargam)
├── services/
│   ├── auth-service/         # Node/Express/MongoDB auth (Hussain)
│   ├── profile-service/      # Node/Express profile CRUD (Hussain)
│   └── agent-orchestrator/   # Python/FastAPI orchestrator (Anindya)
├── agents/                   # 7 agent microservices (Anindya, Arik)
├── mcp-servers/              # MCP connectors: GitHub, job boards (Arik)
├── scripts/
│   └── neo4j/                # Cypher schema + seed data (Anindya)
├── prompts/                  # Shared LLM prompt templates (Anindya, Arik)
├── evaluations/              # Evaluation datasets + results
├── docs/                     # ADRs, API specs, diagrams
├── infra/                    # Docker Compose + Kubernetes manifests (Arik)
└── .github/workflows/        # CI/CD (Arik)
```

## Tech Stack

- **Frontend:** React + Vite, TailwindCSS, React Router v6, Chart.js/Recharts
- **Core Services:** Node.js + Express (auth/profile), Python + FastAPI (orchestrator)
- **Agents:** Python, LangChain/LangGraph
- **Data:** Neo4j (graph), PostgreSQL (relational), ChromaDB/FAISS (vector), Redis (cache/queue)
- **LLM:** Groq API (primary) + HuggingFace (fallback)
- **Integration:** MCP (Model Context Protocol)
- **Infra:** Docker, Kubernetes, GitHub Actions

## Branching Model

- `main` — production-ready code
- `dev` — integration branch (all feature branches merge here)
- `feature/*` — personal/feature branches for each team member

## Getting Started

*Coming soon — Phase 1 build in progress.*
