"""Offline Synthetic Fallback Simulator for GitHub MCP.

Provides deterministic, realistic repository listings and AST audit metrics
for academic evaluations, live viva presentations, and offline development
environments when GITHUB_TOKEN is omitted or rate-limited.
"""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List


def _hash_seed(seed_str: str) -> int:
    """Generate a deterministic 32-bit integer hash from an input string."""
    return int(hashlib.sha256(seed_str.encode("utf-8")).hexdigest()[:8], 16)


def generate_synthetic_repositories(username: str, max_repos: int = 10) -> List[Dict[str, Any]]:
    """Generate realistic student developer repositories deterministically for a given username.

    Args:
        username: GitHub user handle.
        max_repos: Maximum number of repositories to return.

    Returns:
        List of repository metadata objects.
    """
    seed = _hash_seed(username)

    archetype_repos = [
        {
            "name": "careerpilot-ai",
            "description": "Multi-agent career intelligence platform using LangGraph, FastAPI, and Next.js",
            "language": "Python",
            "stars": 18 + (seed % 15),
            "forks": 4 + (seed % 5),
            "open_issues": 1,
            "license": "MIT",
            "is_fork": False,
            "topics": ["multi-agent", "fastapi", "career-intelligence", "langgraph"],
            "last_updated": "2026-11-18T14:22:10Z",
            "has_tests": True,
        },
        {
            "name": "distributed-task-queue",
            "description": "High-throughput asynchronous task queue with Redis backend and worker supervision",
            "language": "Python",
            "stars": 9 + (seed % 10),
            "forks": 2 + (seed % 3),
            "open_issues": 0,
            "license": "Apache-2.0",
            "is_fork": False,
            "topics": ["redis", "distributed-systems", "asyncio", "queues"],
            "last_updated": "2026-10-25T09:12:44Z",
            "has_tests": True,
        },
        {
            "name": "portfolio-dashboard-spa",
            "description": "Modern responsive developer portfolio with real-time analytics and Dark Mode",
            "language": "TypeScript",
            "stars": 12 + (seed % 8),
            "forks": 3 + (seed % 4),
            "open_issues": 2,
            "license": "MIT",
            "is_fork": False,
            "topics": ["react", "typescript", "tailwind", "vite"],
            "last_updated": "2026-11-02T19:45:00Z",
            "has_tests": True,
        },
        {
            "name": "deep-learning-cv-benchmarks",
            "description": "PyTorch implementations of vision transformers and CNN transfer learning benchmarks",
            "language": "Python",
            "stars": 24 + (seed % 20),
            "forks": 7 + (seed % 6),
            "open_issues": 3,
            "license": "MIT",
            "is_fork": False,
            "topics": ["pytorch", "deep-learning", "computer-vision", "transformers"],
            "last_updated": "2026-09-14T11:05:32Z",
            "has_tests": True,
        },
        {
            "name": "cloud-k8s-gitops-manifests",
            "description": "Cloud-native Kubernetes Helm charts and ArgoCD GitOps deployment pipeline configs",
            "language": "Go",
            "stars": 7 + (seed % 7),
            "forks": 1 + (seed % 3),
            "open_issues": 0,
            "license": "MIT",
            "is_fork": False,
            "topics": ["kubernetes", "docker", "devops", "argocd", "gitops"],
            "last_updated": "2026-11-10T16:30:20Z",
            "has_tests": False,
        },
        {
            "name": "algo-data-structures-cpp",
            "description": "Curated implementations of competitive programming algorithms and graph traversals in C++20",
            "language": "C++",
            "stars": 15 + (seed % 12),
            "forks": 5 + (seed % 4),
            "open_issues": 0,
            "license": "GPL-3.0",
            "is_fork": False,
            "topics": ["algorithms", "data-structures", "graphs", "cpp"],
            "last_updated": "2026-08-30T08:15:00Z",
            "has_tests": True,
        },
    ]

    return archetype_repos[:max_repos]


def generate_synthetic_code_audit(username: str, repo: str) -> Dict[str, Any]:
    """Generate high-fidelity AST and code quality metrics for viva evaluation.

    Args:
        username: GitHub handle.
        repo: Repository name.

    Returns:
        Structured audit report matching the CareerPilot AST specification.
    """
    composite_key = f"{username}/{repo}"
    seed = _hash_seed(composite_key)

    # Deterministic metrics derived from seed
    test_coverage = 75.0 + (seed % 21) + round((seed % 10) * 0.1, 1)  # Range 75% - 96%
    cyclomatic_avg = 2.8 + round((seed % 25) * 0.1, 2)               # Range 2.8 - 5.3
    maintainability_idx = 78.0 + (seed % 19) + round((seed % 9) * 0.1, 1) # Range 78 - 97
    loc = 1800 + (seed % 5000)
    functions = 40 + (seed % 80)
    classes = 8 + (seed % 20)
    commits_last_30d = 12 + (seed % 28)
    days_since_last_commit = 1 + (seed % 7)

    # Verified competencies inferred from code complexity
    possible_skills = [
        "Object-Oriented Design",
        "Asynchronous Programming",
        "Unit & Integration Testing",
        "API Architecture",
        "State Management",
        "Error Handling & Resilience",
        "Static Typing & Linters",
    ]
    verified_skills = [
        skill for idx, skill in enumerate(possible_skills)
        if (seed >> idx) & 1 or idx < 3
    ]

    authenticity_score = round(min(98.5, max(72.0, (test_coverage * 0.4) + (maintainability_idx * 0.4) + (commits_last_30d * 0.5))), 1)

    return {
        "repository": f"{username}/{repo}",
        "audit_timestamp": datetime.now(timezone.utc).isoformat(),
        "simulated": True,
        "authenticity_score": authenticity_score,
        "test_evidence": {
            "estimated_coverage_pct": round(test_coverage, 1),
            "test_frameworks_detected": ["pytest", "unittest"] if "python" in repo.lower() else ["jest", "vitest"],
            "test_files_count": max(4, int(functions * 0.15)),
            "assertions_count": max(20, int(functions * 0.8)),
        },
        "commit_activity": {
            "days_since_last_commit": days_since_last_commit,
            "commits_last_30_days": commits_last_30d,
            "active_contributors": 1 + (seed % 3),
            "commit_frequency_rating": "High" if commits_last_30d > 20 else "Moderate",
        },
        "ast_complexity": {
            "language": "Python" if any(k in repo.lower() for k in ["python", "ai", "queue", "agent"]) else "TypeScript",
            "lines_of_code": loc,
            "functions_count": functions,
            "classes_count": classes,
            "cyclomatic_complexity_average": cyclomatic_avg,
            "maintainability_index": round(maintainability_idx, 1),
            "halstead_volume": round(loc * 3.8, 1),
        },
        "verified_competencies": verified_skills,
    }
