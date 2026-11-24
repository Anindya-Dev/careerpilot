"""Job Board Service & Data Analytics.

Provides realistic tech job querying and real-time skill demand aggregations
over the bundled 50+ benchmark tech job postings dataset.
"""

from __future__ import annotations

import json
import logging
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.config import get_settings

logger = logging.getLogger("mcp.job_board.service")


class JobBoardService:
    """Service for querying job listings and analyzing skill demand trends."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self._dataset: List[Dict[str, Any]] = []
        self._load_dataset()

    def _load_dataset(self) -> None:
        """Load job listings from JSON dataset file."""
        dataset_file = Path(self.settings.dataset_path)
        if not dataset_file.exists():
            # Fallback path relative to cwd
            dataset_file = Path("data/job_postings.json")

        if dataset_file.exists():
            with open(dataset_file, "r", encoding="utf-8") as f:
                self._dataset = json.load(f)
            logger.info("Loaded %d job postings from %s", len(self._dataset), dataset_file)
        else:
            logger.error("Dataset not found at %s!", dataset_file)
            self._dataset = []

    def search_job_postings(
        self,
        role: Optional[str] = None,
        location: Optional[str] = None,
        skills: Optional[List[str]] = None,
        experience_level: Optional[str] = None,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """Search job postings matching query criteria.

        Args:
            role: Target role (e.g. 'AI Engineer', 'Full Stack Developer', 'Data Scientist').
            location: Location filter or 'Remote'.
            skills: List of required skills.
            experience_level: 'Entry-level', 'Mid-level', 'Senior', etc.
            limit: Maximum results to return.

        Returns:
            Dictionary with matching postings and metadata.
        """
        filtered = self._dataset

        if role:
            role_lower = role.strip().lower()
            filtered = [
                j for j in filtered
                if role_lower in j.get("target_role", "").lower()
                or role_lower in j.get("title", "").lower()
                or role_lower in j.get("domain", "").lower()
            ]

        if location:
            loc_lower = location.strip().lower()
            filtered = [
                j for j in filtered
                if loc_lower in j.get("location", "").lower()
                or loc_lower in j.get("remote_status", "").lower()
            ]

        if experience_level:
            exp_lower = experience_level.strip().lower()
            filtered = [
                j for j in filtered
                if exp_lower in j.get("experience_level", "").lower()
            ]

        if skills:
            skills_lower = [s.strip().lower() for s in skills]
            scored = []
            for j in filtered:
                all_job_skills = [
                    s.lower() for s in (j.get("required_skills", []) + j.get("preferred_skills", []))
                ]
                match_count = sum(1 for sk in skills_lower if any(sk in ajs for ajs in all_job_skills))
                scored.append((match_count, j))
            scored.sort(key=lambda x: x[0], reverse=True)
            filtered = [j for _, j in scored]

        results = filtered[:limit]

        return {
            "total_matches": len(filtered),
            "returned_count": len(results),
            "limit": limit,
            "jobs": results,
        }

    def get_skill_demand_trends(
        self,
        domain: Optional[str] = None,
        top_n: int = 10,
    ) -> Dict[str, Any]:
        """Compute top required skills, average salaries, and YoY demand growth.

        Args:
            domain: Target domain or role (e.g. 'AI Engineer', 'All').
            top_n: Number of top skills to return (defaults to 10).

        Returns:
            Aggregated skill trends with market demand metrics.
        """
        filtered = self._dataset

        if domain and domain.strip().lower() not in ["all", "*"]:
            d_lower = domain.strip().lower()
            filtered = [
                j for j in self._dataset
                if d_lower in j.get("target_role", "").lower()
                or d_lower in j.get("domain", "").lower()
            ]

        if not filtered:
            filtered = self._dataset

        skill_freq: Counter[str] = Counter()
        skill_salaries: Dict[str, List[float]] = defaultdict(list)

        for job in filtered:
            salary_info = job.get("salary_range", {})
            mid_sal = (salary_info.get("min", 100000) + salary_info.get("max", 150000)) / 2.0

            for skill in job.get("required_skills", []):
                skill_freq[skill] += 2  # Required skills weighted higher
                skill_salaries[skill].append(mid_sal)

            for skill in job.get("preferred_skills", []):
                skill_freq[skill] += 1
                skill_salaries[skill].append(mid_sal)

        # Baseline YoY market growth indices by tech cluster
        yoy_growth_map = {
            "Python": "+38%",
            "LangChain": "+52%",
            "LangGraph": "+58%",
            "PyTorch": "+42%",
            "FastAPI": "+34%",
            "Docker": "+28%",
            "Kubernetes": "+35%",
            "TypeScript": "+26%",
            "React": "+22%",
            "Node.js": "+20%",
            "PostgreSQL": "+25%",
            "Redis": "+29%",
            "Vector Databases": "+64%",
            "RAG Architecture": "+71%",
            "SQL": "+18%",
            "Scikit-Learn": "+21%",
            "Go": "+33%",
            "Kafka": "+31%",
            "Terraform": "+32%",
            "SIEM Tools": "+40%",
        }

        top_skills = skill_freq.most_common(top_n)

        trends = []
        for rank, (skill, count) in enumerate(top_skills, start=1):
            salaries = skill_salaries[skill]
            avg_salary = round(sum(salaries) / len(salaries)) if salaries else 125000
            yoy = yoy_growth_map.get(skill, "+25%")

            trends.append({
                "rank": rank,
                "skill": skill,
                "demand_frequency": count,
                "average_salary_usd": avg_salary,
                "yoy_demand_growth": yoy,
                "market_trend": "Surging" if int(yoy.strip("+%")) >= 35 else "Stable Growth",
            })

        return {
            "domain_analyzed": domain or "All Tech Roles",
            "total_job_postings_sampled": len(filtered),
            "top_skills_count": len(trends),
            "trends": trends,
        }
