# CareerPilot

**Multi-Agent AI Career Intelligence Platform** — an autonomous career engineering companion that builds a verified **Career Intelligence Profile** from real code and credentials, benchmarks skills against live market demand, orchestrates a 7-agent LangGraph pipeline, and generates dynamic career roadmaps and job outreach.

---

## Core Features

- **Career Intelligence Profile (`/profile`)**
  - **Resume & LinkedIn PDF Parsers**: Extract technical skills, certifications, and target roles from uploaded PDFs.
  - **Deep GitHub Repository & Code Auditor**: Scans recursive repository trees, dependency manifests (`requirements.txt`, `pyproject.toml`, `package.json`, etc.), and source imports with repo-wise scan logs and cached re-audit controls.
  - **LeetCode DSA Diagnostics**: Live GraphQL ingestion for solved problem distribution, tier scoring, and topic-gap suggestions.
- **Skills & Evidence Matrix (`/skills`)**
  - Domain-filtered skill matrix (`Frontend`, `Backend`, `Database`, `Cloud & DevOps`, `AI & ML`) with evidence-backed verification badges and live role-based market alignment radar.
- **Career Health & Trajectory Engine (`/health`)**
  - Composite Career Health Index (`0–100`), centralized grade tiers (`A+`, `A`, `B+`, `B`, `C`), multi-dimensional telemetry, and prioritized AI remediation steps.
- **LangGraph Multi-Agent Orchestrator & Roadmap (`/pipeline`)**
  - Live DAG execution stream and dynamic skill-aware 1/3/5-year graphical career roadmap.
- **Auto JobFinder & Gmail Outreach (`/jobs`)**
  - Live job & internship discovery, skill match scoring, public contact extraction, AI cold email generation, and Gmail OAuth draft/send/status tracking.

---

## Architecture & Services

| Service | Tech Stack | Default Port | Path |
|---|---|---|---|
| **Frontend SPA** | React 18, Vite, TailwindCSS, Framer Motion | `3000` | `frontend/` |
| **Auth Service** | Node.js, Express, MongoDB, JWT, Clerk | `5001` | `services/auth-service/` |
| **Profile Service** | Node.js, Express, MongoDB | `5002` | `services/profile-service/` |
| **Agent Orchestrator** | Python, FastAPI, LangGraph, Groq LLM | `8000` | `services/agent-orchestrator/` |
| **GitHub MCP Server** | Python, FastAPI | `5005` | `mcp-servers/github-mcp/` |
| **Job Board MCP Server** | Python, FastAPI | `5006` | `mcp-servers/job-board-mcp/` |

### The 7 LangGraph Agents

| Agent | Purpose |
|---|---|
| `career_vision` | 1/3/5-year skill-aware career trajectory & roadmap |
| `career_drift` | Detect deviation from stated target role & goals |
| `skill_intelligence` | Market skill demand vs. student proficiency |
| `career_evidence` | Verify claims against GitHub, LinkedIn, and projects |
| `opportunity_discovery` | Match jobs, internships, and hackathons |
| `interview_readiness` | Technical & DSA readiness evaluation |
| `career_health` | Composite Career Intelligence Index & recommendations |

---

## Local Development Setup

### Prerequisites
- **Node.js** `20+` and **npm**
- **Python** `3.11+`
- **MongoDB** running on `mongodb://localhost:27017` (or use `node scripts/start-mongo.js`)
- Optional: **Neo4j**, **Redis**, **Groq API key**, and **Clerk** dev/live keys

### 1. Configure Environment Variables
Copy the `.env.example` templates into `.env` files for each service:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/profile-service/.env.example services/profile-service/.env
cp services/agent-orchestrator/.env.example services/agent-orchestrator/.env
```

### 2. Install Dependencies

```bash
# Root & Node services
npm install --prefix frontend
npm install --prefix services/auth-service
npm install --prefix services/profile-service

# Python Agent Orchestrator & MCP servers
cd services/agent-orchestrator
python -m venv .venv
# Windows: .venv\Scripts\activate  |  macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the Stack

Start all services together:
```bash
node scripts/start-all.js
```

Or run services individually:
```bash
# MongoDB (if not running as a system service)
node scripts/start-mongo.js

# Node microservices
npm start --prefix services/auth-service       # http://localhost:5001
npm start --prefix services/profile-service    # http://localhost:5002

# Python MCP servers & Orchestrator (with .venv activated)
uvicorn app.main:app --host 127.0.0.1 --port 5005 --app-dir mcp-servers/github-mcp
uvicorn app.main:app --host 127.0.0.1 --port 5006 --app-dir mcp-servers/job-board-mcp
uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir services/agent-orchestrator

# Frontend
npm run dev --prefix frontend                  # http://localhost:3000
```

---

## Testing & Verification

```bash
# Frontend production bundle
npm run build --prefix frontend

# Agent Orchestrator test suite
cd services/agent-orchestrator && pytest -q

# Node microservice tests
npm test --prefix services/auth-service
npm test --prefix services/profile-service
```

---

## Production Deployment

### Option A: Cloud Split (Recommended)
1. **Database**: Provision **MongoDB Atlas** (and optionally **Neo4j AuraDB** & **Upstash Redis**).
2. **Backend & MCPs**: Deploy `services/auth-service`, `services/profile-service`, `services/agent-orchestrator`, `mcp-servers/github-mcp`, and `mcp-servers/job-board-mcp` on **Railway** or **Render**.
3. **Frontend**: Deploy `frontend/` on **Vercel** (`npm run build`, output `dist/`).

### Option B: Docker Compose
```bash
docker compose up -d --build
```
See [`infra/DEPLOYMENT.md`](infra/DEPLOYMENT.md) for container and Kubernetes manifests.

### Required Production Environment Variables
- **Frontend**: `VITE_AUTH_API_URL`, `VITE_PROFILE_API_URL`, `VITE_ORCHESTRATOR_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_GOOGLE_CLIENT_ID` *(optional, for Gmail API drafts)*
- **Auth & Profile Services**: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_ORIGIN`, `CLERK_SECRET_KEY`
- **Agent Orchestrator**: `GROQ_API_KEY`, `PROFILE_SERVICE_URL`, `GITHUB_MCP_URL`, `JOB_BOARD_MCP_URL`, `GITHUB_TOKEN` *(recommended to avoid unauthenticated GitHub API rate limits)*

---

## Repository Structure

```text
careerpilot/
├── frontend/                   # React + Vite SPA
├── services/
│   ├── auth-service/           # Node/Express/MongoDB auth & Clerk verification
│   ├── profile-service/        # Node/Express/MongoDB profile CRUD
│   └── agent-orchestrator/     # Python/FastAPI LangGraph orchestrator & integrations
├── agents/                     # 7 autonomous agent workers
├── mcp-servers/                # GitHub & Job Board MCP servers
├── scripts/                    # Startup helpers, Neo4j schema/seed, smoke/load tests
├── evaluations/                # Evaluation datasets & benchmark scripts
├── docs/                       # ADRs, OpenAPI specs, handover notes
├── infra/                      # Docker Compose & Kubernetes manifests
└── .github/workflows/          # CI/CD pipelines
```

---

## Branching Model

- `main` — production-ready code
- `dev` — integration branch
- `feature/*` — feature branches
