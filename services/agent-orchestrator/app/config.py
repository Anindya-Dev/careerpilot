"""Application configuration.

All runtime configuration lives in one place so we never scatter magic
strings or secret values through the codebase. Settings are loaded from
environment variables and a local `.env` file, and are type-validated at
startup (a bad value fails fast instead of failing at 2am in production).

We use pydantic-settings because:
- It reads `.env` and real environment variables transparently.
- Every field is type-checked (e.g. `chroma_port` must be an int).
- It gives us sensible defaults while still allowing overrides per
  environment (local dev vs Docker vs Kubernetes).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed configuration for the Agent Orchestrator.

    Field names map case-insensitively to environment variables, so
    `redis_url` is overridable via `REDIS_URL` in `.env` or the shell.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # tolerate unknown env vars from other services
    )

    # Service identity
    app_title: str = "CareerPilot Agent Orchestrator"
    service_name: str = "agent-orchestrator"
    api_version: str = "0.1.0"

    # Redis (job queue + status store)
    redis_url: str = "redis://localhost:6379/0"

    # Neo4j (knowledge graph)
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "changeme"

    # ChromaDB (vector store)
    chroma_host: str = "localhost"
    chroma_port: int = 8000

    # Groq (LLM inference)
    groq_api_key: str = ""
    groq_model: str = "qwen/qwen3.8-27b"


@lru_cache
def get_settings() -> Settings:
    """Return a process-wide cached Settings instance.

    `lru_cache` makes this a singleton: `.env` is read and parsed exactly
    once per process, then the same object is reused for every request.
    Re-parsing config on each call would be wasted I/O and CPU.
    """
    return Settings()
