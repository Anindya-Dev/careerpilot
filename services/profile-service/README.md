# CareerPilot Profile Microservice

**Owner**: Md Hussain Ansari (Member 1)  
**Stack**: Node.js, Express, MongoDB (Mongoose)  
**Port**: `5002` (configurable via `PORT` in `.env`)

---

## 1. Overview
The Profile Service maintains the verified Student Career Intelligence Profile. It exposes student-facing CRUD endpoints as well as internal service endpoints for Member 2's Agent Orchestrator data ingestion during LangGraph DAG executions.

## 2. API Endpoints (v1)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Liveness probe returning `{ status: 'healthy', service: 'profile-service' }` |
| `GET` | `/ready` | No | Readiness probe verifying active MongoDB connectivity |
| `GET` | `/api/v1/profile/me` | Yes (Bearer) | Fetches current student profile (bootstraps on first request) |
| `PUT` | `/api/v1/profile/me` | Yes (Bearer) | Upserts skills, goals, projects, certifications, target role |
| `GET` | `/api/v1/profile/:userId` | Internal Key / Bearer | Ingestion endpoint for Agent Orchestrator graph traversal |
| `DELETE` | `/api/v1/profile/me` | Yes (Bearer) | Deletes current student profile record |

## 3. Data Contract Alignment
The schema strictly models the CareerPilot Knowledge Graph entity nodes:
- `userId` (unique index)
- `name`, `email`, `major`, `target_role`
- `skills`: `[{ name, level, category, verified, source }]`
- `goals`: `[String]`
- `projects`: `[{ title, description, repo_url, technologies }]`
- `certifications`: `[{ name, issuer, issue_date }]`
- `career_health_score`, `profile_completeness`
- `linked_accounts`: `{ github, linkedin }`

## 4. Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev

# Run integration tests
npm test
```
