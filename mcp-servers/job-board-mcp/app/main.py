"""CareerPilot Job Board MCP Server Application.

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
from app.job_service import JobBoardService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("mcp.job_board.main")

settings = get_settings()

app = FastAPI(
    title="CareerPilot Job Board MCP Server",
    description="Model Context Protocol tool server providing job posting retrieval and real-time skill demand analytics.",
    version=settings.server_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

job_service = JobBoardService()


class ToolInvokeRequest(BaseModel):
    """MCP standard tool execution request payload."""

    tool: str = Field(..., description="Name of the MCP tool to execute")
    params: Dict[str, Any] = Field(default_factory=dict, description="Parameters matching tool schema")


TOOLS_CATALOG = [
    {
        "name": "search_job_postings",
        "description": "Query job postings by target role, skills, location, or experience level.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "role": {
                    "type": "string",
                    "description": "Target role (e.g., 'AI Engineer', 'Full Stack Developer', 'Data Scientist')",
                },
                "location": {
                    "type": "string",
                    "description": "Location or 'Remote'",
                },
                "skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Required skills to filter by",
                },
                "experience_level": {
                    "type": "string",
                    "description": "Experience level (e.g. 'Entry-level', 'Mid-level', 'Senior')",
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of postings to return",
                    "default": 10,
                },
            },
        },
    },
    {
        "name": "get_skill_demand_trends",
        "description": "Returns top 10 required skills, average salaries, and year-over-year demand index for a domain or overall market.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "domain": {
                    "type": "string",
                    "description": "Target domain or role (e.g. 'AI Engineer', 'Full Stack Developer', 'All')",
                    "default": "All",
                },
                "top_n": {
                    "type": "integer",
                    "description": "Number of top skills to return",
                    "default": 10,
                },
            },
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
        "total_jobs_indexed": len(job_service._dataset),
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
    """Execute the requested tool and return structured market data."""
    tool_name = request.tool
    params = request.params

    logger.info("Invoking tool '%s' with params: %s", tool_name, params)

    if tool_name == "search_job_postings":
        role = params.get("role")
        location = params.get("location")
        skills = params.get("skills")
        exp = params.get("experience_level")
        limit = params.get("limit", 10)

        data = job_service.search_job_postings(
            role=role,
            location=location,
            skills=skills,
            experience_level=exp,
            limit=limit,
        )
        return {
            "status": "success",
            "tool": tool_name,
            "data": data,
        }

    elif tool_name == "get_skill_demand_trends":
        domain = params.get("domain", "All")
        top_n = params.get("top_n", 10)

        data = job_service.get_skill_demand_trends(domain=domain, top_n=top_n)
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
