"""ChromaDB vector store client and collection management.

Manages vector embeddings across 4 domain collections:
1. skill_embeddings: Dense vectors of industry skills (used by Skill Intelligence).
2. job_description_embeddings: Semantic vectors of tech job postings (used by Opportunity Discovery).
3. project_description_embeddings: Student project descriptions compared against claimed skills (Career Evidence).
4. rag_context_chunks: Curated interview questions, rubrics, and career path guides (Interview Readiness).

Reference: Phase 1 Deliverable 3
"""

from __future__ import annotations

import logging
import socket
from typing import Any, Dict, List, Optional

from app.config import get_settings

logger = logging.getLogger(__name__)

# Required Phase 1 collections
REQUIRED_COLLECTIONS: List[str] = [
    "skill_embeddings",
    "job_description_embeddings",
    "project_description_embeddings",
    "rag_context_chunks",
]


class ChromaClient:
    """Manages HTTP connectivity and collection initialization for ChromaDB."""

    def __init__(self, host: str, port: int) -> None:
        """Initialize ChromaDB connection parameters.

        Args:
            host: Hostname of the ChromaDB server (e.g. localhost).
            port: Network port (e.g. 8000).
        """
        self.host = host
        self.port = port
        self._client: Any = None
        self._collections: Dict[str, Any] = {}

    def _is_port_open(self) -> bool:
        """Perform a rapid socket connection check to avoid slow HTTP connect timeouts."""
        try:
            with socket.create_connection((self.host, self.port), timeout=0.5):
                return True
        except (OSError, socket.error):
            return False

    def _get_client(self) -> Any:
        """Lazily initialize the ChromaDB client if port is open.

        Returns:
            Chroma client instance if available, None otherwise.
        """
        if self._client is not None:
            return self._client

        if not self._is_port_open():
            return None

        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings

            self._client = chromadb.HttpClient(
                host=self.host,
                port=self.port,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
            return self._client
        except (ImportError, Exception) as exc:
            logger.warning("ChromaDB client initialization failed (%s); operating offline.", exc)
            return None

    def ping(self) -> bool:
        """Verify active network connectivity to the ChromaDB service with fast socket check.

        Returns:
            bool: True if heartbeat is received, False otherwise.
        """
        if not self._is_port_open():
            return False

        client = self._get_client()
        if client is None:
            return False

        try:
            heartbeat = client.heartbeat()
            return heartbeat is not None and int(heartbeat) > 0
        except Exception as exc:
            logger.debug("ChromaDB heartbeat ping failed: %s", exc)
            return False

    def init_collections(self) -> Dict[str, Any]:
        """Ensure all 4 required Phase 1 vector collections exist.

        Returns:
            Dict[str, Any]: Dictionary of initialized collection references.
        """
        client = self._get_client()
        if client is None:
            logger.info("ChromaDB offline; skipping collection creation.")
            return {}

        for coll_name in REQUIRED_COLLECTIONS:
            try:
                coll = client.get_or_create_collection(
                    name=coll_name,
                    metadata={"hnsw:space": "cosine"},
                )
                self._collections[coll_name] = coll
                logger.info("ChromaDB collection verified: %s", coll_name)
            except Exception as exc:
                logger.error("Failed to initialize ChromaDB collection '%s': %s", coll_name, exc)

        return self._collections

    def get_collection(self, name: str) -> Optional[Any]:
        """Retrieve a specific collection reference by name.

        Args:
            name: One of the 4 required collection names.

        Returns:
            Collection instance if available, None otherwise.
        """
        if name in self._collections:
            return self._collections[name]

        client = self._get_client()
        if client is not None:
            try:
                coll = client.get_collection(name)
                self._collections[name] = coll
                return coll
            except Exception:
                pass
        return None


_chroma_client_instance: Optional[ChromaClient] = None


def get_chroma_client() -> ChromaClient:
    """Return the process-wide ChromaClient singleton.

    Returns:
        ChromaClient: Configured client instance.
    """
    global _chroma_client_instance
    if _chroma_client_instance is None:
        settings = get_settings()
        _chroma_client_instance = ChromaClient(
            host=settings.chroma_host,
            port=settings.chroma_port,
        )
    return _chroma_client_instance
