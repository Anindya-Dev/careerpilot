"""CareerPilot GitHub MCP Server Application.

Exposes standard MCP endpoints:
- GET /health  : Liveness check
- GET /tools   : Catalog of available MCP tools and JSON schemas
- POST /invoke : Dynamic tool execution endpoint
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import get_settings
from app.github_client import GitHubClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("mcp.github.main")

settings = get_settings()

app = FastAPI(
    title="CareerPilot GitHub MCP Server",
    description="Model Context Protocol tool server for GitHub code AST analysis, repository inspection, and commit verification.",
    version=settings.server_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

github_client = GitHubClient()


class ToolInvokeRequest(BaseModel):
    """MCP standard tool execution request payload."""

    tool: str = Field(..., description="Name of the MCP tool to execute")
    params: Dict[str, Any] = Field(default_factory=dict, description="Parameters matching tool schema")


# Catalog of supported tools following MCP standard
TOOLS_CATALOG = [
    {
        "name": "get_user_repos",
        "description": "Lists student public repositories, star counts, primary languages, and topics.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "username": {
                    "type": "string",
                    "description": "GitHub username handle (e.g., 'anindya-dev')",
                },
                "max_repos": {
                    "type": "integer",
                    "description": "Maximum number of repositories to return",
                    "default": 10,
                },
            },
            "required": ["username"],
        },
    },
    {
        "name": "audit_code_evidence",
        "description": "Inspects repository files for test coverage, commit recency, and language AST cyclomatic complexity.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "username": {
                    "type": "string",
                    "description": "GitHub username handle",
                },
                "repo": {
                    "type": "string",
                    "description": "Repository name to inspect",
                },
            },
            "required": ["username", "repo"],
        },
    },
]


@app.get("/health", summary="Liveness check")
async def health_check() -> Dict[str, Any]:
    """Liveness probe for container orchestration."""
    return {
        "status": "healthy",
        "server": settings.server_name,
        "version": settings.server_version,
        "offline_fallback_ready": True,
    }


@app.get("/tools", summary="List MCP tools")
async def list_tools() -> Dict[str, Any]:
    """Returns catalog of tools exposed by this MCP server with JSON Schema parameters."""
    return {
        "server": settings.server_name,
        "tools": TOOLS_CATALOG,
    }


@app.post("/invoke", summary="Execute MCP tool")
async def invoke_tool(request: ToolInvokeRequest) -> Dict[str, Any]:
    """Execute the requested tool and return structured data."""
    tool_name = request.tool
    params = request.params

    logger.info("Invoking tool '%s' with params: %s", tool_name, params)

    if tool_name == "get_user_repos":
        username = params.get("username")
        if not username:
            raise HTTPException(status_code=400, detail="Missing required parameter 'username'")
        max_repos = params.get("max_repos", 10)
        data = await github_client.get_user_repositories(username=username, max_repos=max_repos)
        return {
            "status": "success",
            "tool": tool_name,
            "data": data,
        }

    elif tool_name == "audit_code_evidence":
        username = params.get("username")
        repo = params.get("repo")
        if not username or not repo:
            raise HTTPException(status_code=400, detail="Parameters 'username' and 'repo' are required")
        data = await github_client.audit_code_evidence(username=username, repo=repo)
        return {
            "status": "success",
            "tool": tool_name,
            "data": data,
        }

    else:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown tool '{tool_name}'. Available tools: {[t['name'] for t in TOOLS_CATALOG]}",
        )
