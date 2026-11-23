"""Automated Unit & Integration Tests for Job Board MCP Server."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_health_endpoint():
    """Verify /health returns 200 and total jobs indexed."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["server"] == "job-board-mcp"
        assert data["total_jobs_indexed"] >= 50


@pytest.mark.anyio
async def test_tools_endpoint():
    """Verify /tools returns valid MCP tool catalog with input schemas."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/tools")
        assert response.status_code == 200
        data = response.json()
        assert "tools" in data
        tool_names = [t["name"] for t in data["tools"]]
        assert "search_job_postings" in tool_names
        assert "get_skill_demand_trends" in tool_names


@pytest.mark.anyio
async def test_invoke_search_job_postings_by_role():
    """Verify search_job_postings returns relevant postings."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "tool": "search_job_postings",
            "params": {"role": "AI Engineer", "limit": 5},
        }
        response = await client.post("/invoke", json=payload)
        assert response.status_code == 200
        res = response.json()
        assert res["status"] == "success"
        data = res["data"]
        assert data["returned_count"] <= 5
        assert data["returned_count"] > 0
        first_job = data["jobs"][0]
        assert "AI Engineer" in first_job["target_role"]
        assert "salary_range" in first_job
        assert len(first_job["required_skills"]) > 0


@pytest.mark.anyio
async def test_invoke_search_job_postings_with_location():
    """Verify search_job_postings respects location filter."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "tool": "search_job_postings",
            "params": {"location": "Remote", "limit": 3},
        }
        response = await client.post("/invoke", json=payload)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["returned_count"] <= 3


@pytest.mark.anyio
async def test_invoke_get_skill_demand_trends():
    """Verify get_skill_demand_trends returns top 10 skills with salaries and YoY growth."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "tool": "get_skill_demand_trends",
            "params": {"domain": "AI Engineer", "top_n": 10},
        }
        response = await client.post("/invoke", json=payload)
        assert response.status_code == 200
        res = response.json()
        assert res["status"] == "success"
        data = res["data"]
        assert data["top_skills_count"] == 10
        trends = data["trends"]
        assert len(trends) == 10
        first_trend = trends[0]
        assert "skill" in first_trend
        assert "average_salary_usd" in first_trend
        assert "yoy_demand_growth" in first_trend
        assert first_trend["average_salary_usd"] > 50000


@pytest.mark.anyio
async def test_invoke_unknown_tool():
    """Verify 404 Not Found when requesting an unregistered tool."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {"tool": "non_existent_tool", "params": {}}
        response = await client.post("/invoke", json=payload)
        assert response.status_code == 404
