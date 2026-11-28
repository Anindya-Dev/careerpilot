"""CareerPilot Agent Orchestrator — FastAPI application entry point.

Composition Root:
- Configures application lifecycle (lifespan context manager for graceful startup/shutdown).
- Wires CORS middleware to enable communication with the React frontend SPA.
- Mounts modular routers:
  - health.router: /health (liveness), /ready (readiness)
  - orchestrator.router: /api/v1/orchestrator/invoke, /jobs/{id}, /agents

Engineering Rationale:
- Keeps main.py thin, readable, and decoupled from business logic.
- Graceful shutdown handles releasing Redis connection pools and open database sessions,
  preventing connection leaks or abrupt termination during container redeployments.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, integrations, orchestrator, telemetry
from app.services.job_manager import get_job_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("orchestrator")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle events.

    Yields control while the FastAPI server is running and performs
    graceful cleanup of backing connection pools upon process termination.
    """
    settings = get_settings()
    logger.info("Starting %s v%s...", settings.app_title, settings.api_version)

    yield  # Application serves incoming HTTP requests

    logger.info("Shutting down %s; closing active connection pools...", settings.service_name)
    job_mgr = get_job_manager()
    await job_mgr.close()
    logger.info("Shutdown cleanup complete.")


settings = get_settings()

app = FastAPI(
    title=settings.app_title,
    description="Coordinates AI agent execution requests, manages background queues, and provides status polling.",
    version=settings.api_version,
    lifespan=lifespan,
)

# CORS middleware configuration allowing local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",  # Permissive during Phase 1 development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router)
app.include_router(orchestrator.router)
app.include_router(telemetry.router)
app.include_router(integrations.router)
