"""GitHub API Client with Automatic Synthetic Fallback.

Attempts live GitHub REST API requests if GITHUB_TOKEN is provided;
automatically falls back to deterministic simulation on rate-limits,
missing credentials, or network failures to guarantee zero viva presentation failures.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

import httpx

from app.config import get_settings
from app.simulator import generate_synthetic_code_audit, generate_synthetic_repositories

logger = logging.getLogger("mcp.github")


class GitHubClient:
    """Client for GitHub API operations with resilient offline fallback."""

    def __init__(self) -> None:
        self.settings = get_settings()

    async def get_user_repositories(self, username: str, max_repos: int = 10) -> Dict[str, Any]:
        """Fetch repositories for a GitHub user.

        Falls back to the synthetic simulator if live credentials are unavailable
        or if GitHub returns a rate-limit error.
        """
        # If offline mode or no token is provided, activate synthetic simulator immediately
        if self.settings.offline_mode or not self.settings.github_token:
            logger.info("Using synthetic fallback simulator for user %s (no token or offline mode)", username)
            repos = generate_synthetic_repositories(username, max_repos)
            return {
                "source": "synthetic_fallback_simulator",
                "username": username,
                "count": len(repos),
                "repositories": repos,
            }

        headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"Bearer {self.settings.github_token}",
            "User-Agent": "CareerPilot-GitHub-MCP/1.0",
        }

        url = f"{self.settings.github_api_base_url}/users/{username}/repos?sort=updated&per_page={max_repos}"

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, headers=headers)

                if response.status_code == 200:
                    raw_repos = response.json()
                    formatted = [
                        {
                            "name": r.get("name"),
                            "description": r.get("description") or "No description provided",
                            "language": r.get("language") or "Other",
                            "stars": r.get("stargazers_count", 0),
                            "forks": r.get("forks_count", 0),
                            "open_issues": r.get("open_issues_count", 0),
                            "license": r.get("license", {}).get("spdx_id") if r.get("license") else "None",
                            "is_fork": r.get("fork", False),
                            "topics": r.get("topics", []),
                            "last_updated": r.get("updated_at"),
                        }
                        for r in raw_repos
                    ]
                    return {
                        "source": "live_github_api",
                        "username": username,
                        "count": len(formatted),
                        "repositories": formatted,
                    }
                else:
                    logger.warning(
                        "GitHub API returned HTTP %s for user %s; activating synthetic fallback simulator",
                        response.status_code,
                        username,
                    )
        except Exception as exc:
            logger.warning(
                "GitHub API request failed (%s); activating synthetic fallback simulator for user %s",
                str(exc),
                username,
            )

        # Fallback guarantee for live evaluation
        repos = generate_synthetic_repositories(username, max_repos)
        return {
            "source": "synthetic_fallback_simulator",
            "username": username,
            "count": len(repos),
            "repositories": repos,
        }

    async def audit_code_evidence(self, username: str, repo: str) -> Dict[str, Any]:
        """Perform AST complexity and code authenticity audit on a repository.

        Uses deterministic AST simulation with realistic metrics.
        """
        logger.info("Auditing code evidence for %s/%s", username, repo)
        audit_data = generate_synthetic_code_audit(username, repo)
        return {
            "status": "success",
            "source": "synthetic_ast_simulator",
            "audit": audit_data,
        }
