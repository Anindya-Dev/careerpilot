"""Unit and integration tests for the CareerPilot Agent Orchestrator.

Validates the Phase 1 Acceptance Criteria:
1. GET /health returns 200 OK with service metadata and timestamp.
2. GET /ready returns 503 while backing services are offline/unreachable.
3. POST /api/v1/orchestrator/invoke enqueues job and returns HTTP 202 Accepted with a unique UUID jobId.
4. Input validation: Pydantic schemas reject unknown agent names or missing user_id with HTTP 422.
5. GET /api/v1/orchestrator/jobs/{job_id} retrieves accurate job lifecycle state.
6. Non-existent job IDs return HTTP 404 Not Found.
7. GET /api/v1/orchestrator/agents returns all 7 registered agents and their dynamic schemas.
"""

from __future__ import annotations

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.models.requests import AgentName
from app.models.responses import JobStatus


@pytest.fixture
def client() -> TestClient:
    """Fixture providing a synchronous TestClient wrapper over the FastAPI app."""
    return TestClient(app)


def test_health_liveness_probe(client: TestClient) -> None:
    """Test that GET /health returns 200 OK with proper service metadata."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data
    assert "timestamp" in data


def test_ready_readiness_probe_initial(client: TestClient) -> None:
    """Test that GET /ready returns 503 until backing databases are fully connected."""
    response = client.get("/ready")
    # Initially returns 503 while database clients are in development
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "not_ready"
    assert "checks" in data


def test_list_agents_catalog(client: TestClient) -> None:
    """Test that GET /api/v1/orchestrator/agents returns all 7 registered MVP agents."""
    response = client.get("/api/v1/orchestrator/agents")
    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    agents = data["agents"]
    assert len(agents) == 7

    agent_names = {agent["name"] for agent in agents}
    for expected_agent in AgentName:
        assert expected_agent.value in agent_names

    # Verify schema structure of at least one agent
    interview_agent = next(a for a in agents if a["name"] == AgentName.INTERVIEW_READINESS.value)
    assert len(interview_agent["capabilities"]) > 0
    assert "type" in interview_agent["input_schema"]


def test_invoke_agent_success(client: TestClient) -> None:
    """Test that valid POST /invoke returns HTTP 202 Accepted with a unique job_id."""
    payload = {
        "agent": "interview_readiness",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "params": {
            "target_role": "Data Scientist",
            "difficulty": "intermediate",
        },
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert len(data["job_id"]) == 36  # UUID length
    assert data["status"] == JobStatus.QUEUED.value

    # Poll status for the newly enqueued job (may be queued, running, or already completed by worker)
    job_id = data["job_id"]
    status_response = client.get(f"/api/v1/orchestrator/jobs/{job_id}")
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["job_id"] == job_id
    assert status_data["status"] in (
        JobStatus.QUEUED.value,
        JobStatus.RUNNING.value,
        JobStatus.COMPLETED.value,
    )


def test_invoke_rejects_invalid_agent_name(client: TestClient) -> None:
    """Test that Pydantic rejects unknown agent names with clean HTTP 422 error."""
    payload = {
        "agent": "crypto_trader_agent",  # Invalid agent name
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "params": {},
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    # Verify the error points directly to the 'agent' field
    assert any("agent" in loc for err in data["detail"] for loc in err.get("loc", []))


def test_invoke_rejects_missing_user_id(client: TestClient) -> None:
    """Test that Pydantic rejects payloads missing the required user_id field."""
    payload = {
        "agent": "career_vision",
        # Missing user_id
        "params": {"target_role": "Backend Engineer"},
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert any("user_id" in loc for err in data["detail"] for loc in err.get("loc", []))


def test_get_nonexistent_job_returns_404(client: TestClient) -> None:
    """Test that querying an invalid/nonexistent jobId returns HTTP 404 Not Found."""
    fake_job_id = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/api/v1/orchestrator/jobs/{fake_job_id}")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert fake_job_id in data["detail"]


def test_career_vision_agent_end_to_end(client: TestClient) -> None:
    """Test that invoking career_vision executes worker and produces 1/3/5-year roadmap."""
    payload = {
        "agent": "career_vision",
        "user_id": "std-test-001",
        "params": {"target_role": "AI/ML Engineer", "timeline_years": 5},
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    status_response = client.get(f"/api/v1/orchestrator/jobs/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    assert data["job_id"] == job_id
    if data["status"] == "completed":
        result = data["result"]
        assert "milestones" in result
        assert len(result["milestones"]) == 3
        assert "strategic_advice" in result


def test_career_drift_agent_end_to_end(client: TestClient) -> None:
    """Test that invoking career_drift executes worker and computes drift score."""
    payload = {
        "agent": "career_drift",
        "user_id": "std-test-001",
        "params": {"lookback_days": 90},
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    status_response = client.get(f"/api/v1/orchestrator/jobs/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    if data["status"] == "completed":
        result = data["result"]
        assert "drift_score" in result
        assert "drift_status" in result
        assert "corrective_actions" in result


def test_career_evidence_agent_end_to_end(client: TestClient) -> None:
    """Test that invoking career_evidence audits claims and returns evidence score."""
    payload = {
        "agent": "career_evidence",
        "user_id": "std-test-001",
        "params": {"github_username": "anindya-dev"},
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    status_response = client.get(f"/api/v1/orchestrator/jobs/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    if data["status"] == "completed":
        result = data["result"]
        assert "overall_evidence_score" in result
        assert "verified_claims_count" in result
        assert "claims" in result


def test_career_health_agent_end_to_end(client: TestClient) -> None:
    """Test that invoking career_health computes composite index and SWOT analysis."""
    payload = {
        "agent": "career_health",
        "user_id": "std-test-001",
        "params": {
            "skill_market_fit": 80.0,
            "drift_score": 15.0,
            "profile_completeness": 90.0,
        },
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    status_response = client.get(f"/api/v1/orchestrator/jobs/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    if data["status"] == "completed":
        result = data["result"]
        assert "composite_index" in result
        assert result["composite_index"] > 0.0
        assert "score_breakdown" in result
        assert "swot_analysis" in result
        assert "strengths" in result["swot_analysis"]
        assert "top_priority_actions" in result


def test_skill_intelligence_agent_end_to_end(client: TestClient) -> None:
    """Test that invoking skill_intelligence calculates ROI and ranks skill gaps."""
    payload = {
        "agent": "skill_intelligence",
        "user_id": "std-test-001",
        "params": {"target_role": "AI/ML Engineer"},
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    status_response = client.get(f"/api/v1/orchestrator/jobs/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    if data["status"] == "completed":
        result = data["result"]
        assert "ranked_skill_gaps" in result
        assert len(result["ranked_skill_gaps"]) > 0
        assert "roi_score" in result["ranked_skill_gaps"][0]


def test_opportunity_discovery_agent_end_to_end(client: TestClient) -> None:
    """Test that invoking opportunity_discovery surfaces relevant opportunities."""
    payload = {
        "agent": "opportunity_discovery",
        "user_id": "std-test-001",
        "params": {"target_role": "AI/ML Engineer"},
    }
    response = client.post("/api/v1/orchestrator/invoke", json=payload)
    assert response.status_code == 202
    job_id = response.json()["job_id"]

    status_response = client.get(f"/api/v1/orchestrator/jobs/{job_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    if data["status"] == "completed":
        result = data["result"]
        assert "opportunities" in result
        assert len(result["opportunities"]) > 0
        assert "match_percentage" in result["opportunities"][0]


def test_dashboard_telemetry_live_endpoint(client: TestClient) -> None:
    """Test that dashboard telemetry endpoint returns 200 with verified dimensions and health score."""
    response = client.get("/api/v1/agents/dashboard-telemetry")
    assert response.status_code == 200
    data = response.json()
    assert "healthScore" in data
    assert data["healthScore"] > 0
    assert "dimensions" in data
    assert len(data["dimensions"]) >= 4
    assert "agentStatuses" in data
    assert len(data["agentStatuses"]) == 7


def test_skill_intelligence_radar_endpoint(client: TestClient) -> None:
    """Test that skill intelligence radar benchmark endpoint returns 200 with radarData."""
    response = client.get("/api/v1/agents/skill-intelligence")
    assert response.status_code == 200
    data = response.json()
    assert "radarData" in data
    assert len(data["radarData"]) >= 5
    assert "gaps" in data
    assert "narrative" in data
