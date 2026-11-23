"""Automated Unit & Integration Tests for GitHub MCP Server."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_health_endpoint():
    """Verify /health returns 200 and healthy status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["server"] == "github-mcp"
        assert data["offline_fallback_ready"] is True


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
        assert "get_user_repos" in tool_names
        assert "audit_code_evidence" in tool_names


@pytest.mark.anyio
async def test_invoke_get_user_repos():
    """Verify get_user_repos returns repositories and handles fallback gracefully."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "tool": "get_user_repos",
            "params": {"username": "anindya-dev", "max_repos": 4},
        }
        response = await client.post("/invoke", json=payload)
        assert response.status_code == 200
        res = response.json()
        assert res["status"] == "success"
        assert res["tool"] == "get_user_repos"
        data = res["data"]
        assert data["username"] == "anindya-dev"
        assert len(data["repositories"]) <= 4
        assert len(data["repositories"]) > 0
        first_repo = data["repositories"][0]
        assert "name" in first_repo
        assert "language" in first_repo
        assert "stars" in first_repo


@pytest.mark.anyio
async def test_invoke_audit_code_evidence():
    """Verify audit_code_evidence returns AST metrics and authenticity score."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "tool": "audit_code_evidence",
            "params": {"username": "anindya-dev", "repo": "careerpilot"},
        }
        response = await client.post("/invoke", json=payload)
        assert response.status_code == 200
        res = response.json()
        assert res["status"] == "success"
        audit = res["data"]["audit"]
        assert "authenticity_score" in audit
        assert "test_evidence" in audit
        assert "ast_complexity" in audit
        assert audit["test_evidence"]["estimated_coverage_pct"] > 0
        assert audit["ast_complexity"]["cyclomatic_complexity_average"] > 0


@pytest.mark.anyio
async def test_invoke_missing_params():
    """Verify 400 Bad Request when required params are missing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {"tool": "get_user_repos", "params": {}}
        response = await client.post("/invoke", json=payload)
        assert response.status_code == 400


@pytest.mark.anyio
async def test_invoke_unknown_tool():
    """Verify 404 Not Found when requesting non-existent tool."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {"tool": "invalid_tool", "params": {}}
        response = await client.post("/invoke", json=payload)
        assert response.status_code == 404
