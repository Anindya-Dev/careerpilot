"""Asynchronous Neo4j driver connection pool and Cypher query execution.

Manages graph database sessions and provides:
- Fast health check ping verification for /ready probe (with strict 1s timeout).
- Asynchronous Cypher query execution for student skill ontology traversal.
- Connection lifecycle management (startup and graceful shutdown).

Engineering Rationale:
- Neo4j AsyncGraphDatabase manages an internal connection pool over the Bolt binary protocol,
  enabling concurrent, non-blocking graph traversals across worker coroutines.
- Ping uses a strict 1.0s timeout to prevent readiness probes from hanging when offline.
"""

from __future__ import annotations

import asyncio
import logging
import socket
from typing import Any, Dict, List, Optional

from app.config import get_settings

logger = logging.getLogger(__name__)


class Neo4jClient:
    """Manages asynchronous Bolt driver connections and Cypher query execution."""

    def __init__(self, uri: str, user: str, password: str) -> None:
        """Initialize Neo4j connection parameters.

        Args:
            uri: Bolt connection URI (e.g. bolt://localhost:7687).
            user: Database username.
            password: Database password.
        """
        self.uri = uri
        self.user = user
        self.password = password
        self._driver: Any = None

    async def _get_driver(self) -> Any:
        """Lazily initialize the async Neo4j driver instance.

        Returns:
            AsyncDriver instance if neo4j package is available, None otherwise.
        """
        if self._driver is not None:
            return self._driver

        try:
            from neo4j import AsyncGraphDatabase

            self._driver = AsyncGraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password),
                connection_timeout=1.0,
                max_connection_lifetime=3600,
                max_connection_pool_size=50,
            )
            return self._driver
        except (ImportError, Exception) as exc:
            logger.warning("Neo4j driver initialization failed (%s); operating offline.", exc)
            return None

    async def _run_ping(self, driver: Any) -> bool:
        """Execute ping Cypher query within an isolated session."""
        async with driver.session() as session:
            result = await session.run("RETURN 1 AS ping")
            record = await result.single()
            return record is not None and record["ping"] == 1

    def _is_neo4j_port_open(self) -> bool:
        """Fast TCP check to verify Bolt port is reachable without blocking on retries."""
        try:
            with socket.create_connection(("127.0.0.1", 7687), timeout=0.2):
                return True
        except (OSError, socket.error):
            return False

    async def ping(self) -> bool:
        """Verify active connectivity to the Neo4j graph cluster with a fast socket check.

        Returns:
            bool: True if the database answers 'RETURN 1', False otherwise.
        """
        if not self._is_neo4j_port_open():
            return False

        driver = await self._get_driver()
        if driver is None:
            return False

        try:
            return await asyncio.wait_for(self._run_ping(driver), timeout=1.0)
        except Exception as exc:
            logger.debug("Neo4j health check ping failed: %s", exc)
            return False

    async def execute_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Execute a read/write Cypher query and return records as dictionaries.

        Args:
            query: Parametrized Cypher query string.
            parameters: Optional dictionary of query parameters.

        Returns:
            List[Dict[str, Any]]: Serialized records returned by the query.
        """
        driver = await self._get_driver()
        if driver is None:
            raise ConnectionError("Neo4j database driver is not connected.")

        async with driver.session() as session:
            result = await session.run(query, parameters or {})
            records = await result.data()
            return records

    async def close(self) -> None:
        """Gracefully close the driver and release connection pool sockets."""
        if self._driver is not None:
            try:
                await self._driver.close()
            except Exception as exc:
                logger.debug("Error closing Neo4j driver: %s", exc)
            finally:
                self._driver = None


_neo4j_client_instance: Optional[Neo4jClient] = None


def get_neo4j_client() -> Neo4jClient:
    """Return the process-wide Neo4jClient singleton.

    Returns:
        Neo4jClient: Configured client instance.
    """
    global _neo4j_client_instance
    if _neo4j_client_instance is None:
        settings = get_settings()
        _neo4j_client_instance = Neo4jClient(
            uri=settings.neo4j_uri,
            user=settings.neo4j_user,
            password=settings.neo4j_password,
        )
    return _neo4j_client_instance
