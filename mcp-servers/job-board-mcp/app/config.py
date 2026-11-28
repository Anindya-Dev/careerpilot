"""Configuration settings for Job Board MCP Server."""

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for Job Board MCP Service."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    server_name: str = "job-board-mcp"
    server_version: str = "1.0.0"
    port: int = 5006
    host: str = "0.0.0.0"
    debug: bool = False

    # Path to bundled realistic job listings JSON
    dataset_path: str = str(Path(__file__).resolve().parents[1] / "data" / "job_postings.json")


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
