"""Configuration settings for GitHub MCP Server.

Loads settings from environment variables using Pydantic Settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for GitHub MCP Service."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    server_name: str = "github-mcp"
    server_version: str = "1.0.0"
    port: int = 5005
    host: str = "0.0.0.0"
    debug: bool = False

    # Optional GitHub Personal Access Token
    github_token: str | None = None
    offline_mode: bool = False
    github_api_base_url: str = "https://api.github.com"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
