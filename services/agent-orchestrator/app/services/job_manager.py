"""Redis asynchronous job manager.

Manages the lifecycle of background agent execution jobs:
- Enqueues new jobs into a FIFO task queue.
- Persists job execution state (status, timestamps, payloads, results) in Redis hashes.
- Provides status lookups and health-check ping mechanisms for readiness probes.

Architecture & Design Rationale:
- Decouples client HTTP request ingestion from heavyweight AI agent execution.
- Returns an immediate HTTP 202 Accepted with a unique UUID job identifier,
  preventing long-running LLM and Graph queries from timing out HTTP gateways.
- Includes an in-memory fallback mechanism to allow local unit testing and development
  when a live Redis server instance is not yet running.
"""

from __future__ import annotations

import json
import logging
import socket
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.config import get_settings
from app.models.responses import JobStatus, JobStatusResponse

logger = logging.getLogger(__name__)

# Redis key prefixes to avoid namespace collisions in shared databases
JOB_KEY_PREFIX = "careerpilot:job:"
JOB_QUEUE_KEY = "careerpilot:jobs:queue"
DEFAULT_JOB_TTL_SECONDS = 86400  # 24 hours retention for completed/failed jobs


class JobManager:
    """Coordinates job queuing, status persistence, and result retrieval.

    Attributes:
        redis_url: Connection URI for the Redis service.
        _redis_client: Active async Redis connection instance, if available.
        _in_memory_jobs: Fallback store used for unit tests or when Redis is offline.
    """

    def __init__(self, redis_url: str) -> None:
        """Initialize the JobManager instance with configuration.

        Args:
            redis_url: Fully qualified Redis connection string (e.g., redis://localhost:6379/0).
        """
        self.redis_url = redis_url
        self._redis_client: Any = None
        self._in_memory_jobs: Dict[str, Dict[str, Any]] = {}

    async def _get_client(self) -> Any:
        """Lazily initialize and return the asynchronous Redis client.

        Returns:
            An active redis.asyncio.Redis client, or None if redis is offline or unavailable.
        """
        if self._redis_client is not None:
            return self._redis_client

        if not self._is_redis_port_open():
            return None

        try:
            import redis.asyncio as aioredis

            self._redis_client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=0.5,
                socket_timeout=0.5,
            )
            return self._redis_client
        except (ImportError, Exception) as exc:
            logger.warning(
                "Redis client initialization failed (%s); operating in in-memory fallback mode.",
                exc,
            )
            return None

    def _is_redis_port_open(self) -> bool:
        """Fast TCP check to verify Redis port is reachable without blocking on retries."""
        try:
            with socket.create_connection(("127.0.0.1", 6379), timeout=0.2):
                return True
        except (OSError, socket.error):
            return False

    async def ping(self) -> bool:
        """Verify active network connectivity to the Redis server.

        Used primarily by the /ready readiness probe.

        Returns:
            bool: True if Redis responds to PING, False otherwise.
        """
        if not self._is_redis_port_open():
            return False

        client = await self._get_client()
        if client is None:
            return False

        try:
            return bool(await asyncio.wait_for(client.ping(), timeout=0.5))
        except Exception as exc:
            logger.debug("Redis ping failed: %s", exc)
            return False

    async def enqueue_job(
        self,
        agent: str,
        user_id: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Create and enqueue a new agent execution job.

        Args:
            agent: Identifier of the target agent (e.g. 'interview_readiness').
            user_id: Unique identifier of the student initiating the request.
            params: Dictionary of custom parameters for the target agent.

        Returns:
            str: A globally unique UUID4 string representing the job.
        """
        job_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        params_dict = params or {}

        job_data = {
            "job_id": job_id,
            "agent": agent,
            "user_id": user_id,
            "status": JobStatus.QUEUED.value,
            "params": json.dumps(params_dict),
            "result": "",
            "error": "",
            "created_at": now,
            "updated_at": now,
        }

        client = await self._get_client()
        if client is not None:
            try:
                job_key = f"{JOB_KEY_PREFIX}{job_id}"
                # Store metadata hash
                await client.hset(job_key, mapping=job_data)
                # Expire old jobs after 24 hours to prevent memory bloat
                await client.expire(job_key, DEFAULT_JOB_TTL_SECONDS)
                # Push job ID into FIFO work queue
                await client.lpush(JOB_QUEUE_KEY, job_id)
                return job_id
            except Exception as exc:
                logger.error("Failed to enqueue job in Redis: %s; using in-memory store.", exc)

        # Fallback in-memory persistence
        self._in_memory_jobs[job_id] = job_data
        return job_id

    async def get_job_status(self, job_id: str) -> Optional[JobStatusResponse]:
        """Fetch current execution status and result for a given job.

        Args:
            job_id: The UUID string of the job to look up.

        Returns:
            Optional[JobStatusResponse]: Typed response schema if found, None otherwise.
        """
        client = await self._get_client()
        job_data: Optional[Dict[str, Any]] = None

        if client is not None:
            try:
                job_key = f"{JOB_KEY_PREFIX}{job_id}"
                data = await client.hgetall(job_key)
                if data:
                    job_data = data
            except Exception as exc:
                logger.error("Failed to read job %s from Redis: %s", job_id, exc)

        if job_data is None:
            job_data = self._in_memory_jobs.get(job_id)

        if not job_data:
            return None

        # Parse stored JSON result if present
        raw_result = job_data.get("result")
        parsed_result: Optional[Dict[str, Any]] = None
        if raw_result:
            try:
                parsed_result = json.loads(raw_result)
            except json.JSONDecodeError:
                parsed_result = {"raw_output": raw_result}

        return JobStatusResponse(
            job_id=job_data["job_id"],
            status=JobStatus(job_data.get("status", JobStatus.QUEUED.value)),
            result=parsed_result,
        )

    async def update_job_status(
        self,
        job_id: str,
        status: JobStatus,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ) -> bool:
        """Update job lifecycle status and attach output payload upon completion.

        Args:
            job_id: The UUID of the job to update.
            status: New JobStatus enum state.
            result: Optional dictionary containing agent execution findings.
            error: Optional error description string if job execution failed.

        Returns:
            bool: True if the update succeeded, False if the job was not found.
        """
        now = datetime.now(timezone.utc).isoformat()
        updates: Dict[str, str] = {
            "status": status.value,
            "updated_at": now,
        }
        if result is not None:
            updates["result"] = json.dumps(result)
        if error is not None:
            updates["error"] = error

        client = await self._get_client()
        if client is not None:
            try:
                job_key = f"{JOB_KEY_PREFIX}{job_id}"
                if await client.exists(job_key):
                    await client.hset(job_key, mapping=updates)
                    return True
            except Exception as exc:
                logger.error("Failed to update job %s in Redis: %s", job_id, exc)

        if job_id in self._in_memory_jobs:
            self._in_memory_jobs[job_id].update(updates)
            return True

        return False

    async def close(self) -> None:
        """Close connection pools gracefully on application shutdown."""
        if self._redis_client is not None:
            try:
                await self._redis_client.close()
            except Exception as exc:
                logger.debug("Error closing Redis client: %s", exc)
            finally:
                self._redis_client = None


_job_manager_instance: Optional[JobManager] = None


def get_job_manager() -> JobManager:
    """Return the process-wide JobManager singleton instance.

    Returns:
        JobManager: Initialized singleton instance configured with app settings.
    """
    global _job_manager_instance
    if _job_manager_instance is None:
        settings = get_settings()
        _job_manager_instance = JobManager(redis_url=settings.redis_url)
    return _job_manager_instance
