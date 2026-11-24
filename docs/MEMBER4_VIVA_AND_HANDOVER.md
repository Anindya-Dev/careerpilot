# CareerPilot — Member 4 (Sargam Banerjee) Phase 1 Viva & Technical Defense Guide

**Primary Role**: Frontend API Client Migration & Live Telemetry Integration Owner  
**Branch**: `feature/phase1-sargam-frontend-telemetry`  
**Evaluation Status**: 100% Complete & Verified (Vite Production Build Passing)

---

## 1. Executive Summary
This document serves as your complete viva preparation, architectural defense, and technical handover for the B.Tech final year project evaluation. Everything under your primary ownership—the centralized Axios HTTP client with JWT interceptors, automatic 401 token refresh queue, roundtrip network latency profiling, asynchronous agent query hooks, and the Recharts-powered telemetry dashboard—has been implemented following production software engineering practices.

---

## 2. Directory & Component Inventory

| File / Component | Core Responsibilities | Technologies | Status |
|---|---|---|:---:|
| `frontend/src/api/client.js` | Multi-service Axios routing (`authClient`, `profileClient`, `orchestratorClient`), request/response interceptors, JWT injection, automatic 401 token refresh queue, request timestamp & latency profiling. | Axios v1.6+, HTTP Interceptors, Promises | **100% Built** |
| `frontend/src/hooks/useAgentQuery.js` | Reusable React hook managing async agent query lifecycle, mounted state safety, error normalization, and millisecond latency telemetry. | React 18, React Hooks, Abortable Fetch | **100% Tested** |
| `frontend/src/hooks/useDashboardTelemetry.js` | Live query hook streaming real-time health score, dimension weights, recent agent runs, and AI recommendations. | React 18 Custom Hook | **100% Built** |
| `frontend/src/hooks/useSkillIntelligence.js` | Live query hook streaming radar benchmarks and detected critical skill gaps. | React 18 Custom Hook | **100% Built** |
| `frontend/src/hooks/useCareerHealth.js` | Live query hook streaming composite health score and dimension breakdown. | React 18 Custom Hook | **100% Built** |
| `frontend/src/components/telemetry/CareerHealthDial.jsx` | Animated radial SVG career health dial with grade pill, score indicator, and dimension progress bars. Mounts into Member 1's **Slot A**. | React 18, SVG Animations, Lucide React | **Integrated** |
| `frontend/src/components/telemetry/SkillRadarChart.jsx` | Interactive radar chart comparing student skill proficiency against live target role market demand. Mounts into Member 1's **Slot B**. | Recharts, SVG, Tooltips, Legends | **Integrated** |
| `frontend/src/components/telemetry/HealthTrendChart.jsx` | 6-month historical career health trajectory modeled across project completions and skill additions with smooth gradient styling. | Recharts AreaChart, Linear Gradients | **Integrated** |
| `frontend/src/components/telemetry/AgentStatusList.jsx` | Real-time operational monitoring roster for the 7 agent microservices (Live vs. Contract status, latency tracking in ms). | React 18, Lucide React, Status Badges | **Integrated** |
| `frontend/src/components/telemetry/RecommendationFeed.jsx` | Actionable recommendations prioritized by severity (Critical / High / Medium) derived from LangGraph reasoning. | React 18, Responsive Cards | **Integrated** |
| `frontend/src/components/telemetry/TelemetryStream.jsx` | Chronological multi-agent activity feed tracking profile mutations, AST code inspections, and skill evaluations. | React 18, Timeline Feed | **Integrated** |

---

## 3. High-Yield Viva Questions & Model Answers

### Q1: What was your specific architectural responsibility in Review 3?
> **Model Answer**:
> "As Member 4, I owned the **Frontend API Client Migration & Live Telemetry Integration**. My responsibilities encompassed three interconnected areas:
> 1. **Robust Networking Layer**: Building the centralized Axios client with request/response interceptors, automatic JWT bearer token injection, and an asynchronous 401 token refresh queue to eliminate authentication race conditions.
> 2. **Live Query Hooks**: Developing generic and domain-specific React hooks (`useAgentQuery`, `useDashboardTelemetry`, `useSkillIntelligence`, `useCareerHealth`) that decouple UI rendering from REST / WebSocket agent communication while tracking sub-second network latency.
> 3. **Telemetry Dashboard**: Transforming raw agent inference payloads into high-impact visual representations—specifically the interactive Recharts radar chart, radial career health dial, 6-month score progression area chart, live agent status roster, and AI recommendation feed."

### Q2: How did you solve the 401 Unauthorized race condition during token expiration in Axios?
> **Model Answer**:
> "When an access token expires while a student is actively browsing, multiple simultaneous API requests (e.g. fetching profile, telemetry, and notifications) can receive 401 responses at the exact same instant. If not handled, this triggers multiple concurrent `/refresh` calls, which invalidates the refresh token due to reuse detection.
> I resolved this by introducing a **promise queue** with an `isRefreshing` mutex flag in `frontend/src/api/client.js`:
> 1. The first 401 sets `isRefreshing = true` and initiates a single refresh request.
> 2. Subsequent 401 requests are pushed to a `failedQueue` array that holds their `resolve` and `reject` callbacks.
> 3. Once the refresh call succeeds with a new JWT, `processQueue()` replays all queued requests with the updated `Authorization: Bearer <token>` header without logging the student out.
> 4. If the refresh token itself is invalid or revoked, the queue rejects all promises, clears local storage, and redirects safely to `/login`."

### Q3: Why did you choose Recharts over Chart.js or D3 for the telemetry visualization?
> **Model Answer**:
> "We evaluated D3.js, Chart.js, and Recharts:
> 1. **React 18 Component Parity**: Recharts is built entirely on native React components and SVG elements. Unlike Chart.js (which renders on HTML5 Canvas), Recharts participates directly in the React virtual DOM lifecycle, making state changes, theme transitions, and conditional re-renders seamless without canvas redraw flickering.
> 2. **Declarative Syntax**: Recharts provides composable primitives (`<RadarChart>`, `<PolarGrid>`, `<Area>`, `<Tooltip>`) that cleanly encapsulate responsive layout calculations.
> 3. **Bundle Size & Tree-shaking**: Recharts supports selective imports, keeping our production Vite bundle lightweight while delivering interactive tooltips, legends, and animations."

### Q4: How does your telemetry dashboard handle backend latency or downtime during a demo?
> **Model Answer**:
> "In `frontend/src/services/telemetryService.js`, every API method is designed with **defensive fallback resilience**:
> 1. In live mode, requests communicate directly with Member 2's Agent Orchestrator (`http://localhost:8000/api/v1`), extracting real-time Groq LPU inference data.
> 2. In demo or offline mode (or if an agent service is booting), the service catches network exceptions and immediately returns high-fidelity preview fixtures with zero UI breakage.
> 3. The `useAgentQuery` hook tracks roundtrip execution time via `config.metadata.startTime`, displaying exact live latency (e.g., `312ms`) in the dashboard badge so evaluators can observe live backend inference."

### Q5: How do your components integrate with Member 1 (Hussain)'s frontend shell?
> **Model Answer**:
> "Member 1 designed `frontend/src/pages/DashboardPage.jsx` with explicit container slots:
> - **Slot A**: Career Health Score & Dial. I implemented `<CareerHealthDial />` which renders the circular 0–100 index, letter grade, and dimension breakdown.
> - **Slot B**: Market Skill Alignment Radar. I implemented `<SkillRadarChart />` which maps student profile skills against market demand.
> Furthermore, I expanded the lower dashboard grid to include the `<HealthTrendChart />`, `<AgentStatusList />`, and `<RecommendationFeed />`, consuming shared `useAuth` and `useProfile` contexts seamlessly."

---

## 4. Verification & Testing Runbook

### Build Verification
```bash
cd frontend
npm ci
npm run build
```
*Expected Output*: Vite builds `dist/` cleanly in under 6 seconds with 0 errors.

### Local Development Server
```bash
cd frontend
npm run dev
```
*Expected Output*: Local development server starts at `http://localhost:3000` or `http://localhost:5173`.
