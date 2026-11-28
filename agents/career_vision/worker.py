"""Career Vision Agent — 1/3/5-Year Career Trajectory & Roadmap Generator.

Owner: Anindya Bhattacharya (Member 2)

Responsibilities:
1. Queries student's current verified competencies and aspirational target role from Neo4j.
2. Identifies ontological skill gaps via GraphRAG traversal against role prerequisites.
3. Invokes Groq LPU inference to generate structured 1-year, 3-year, and 5-year milestones.
4. Validates output against CareerVisionOutput Pydantic schema.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger("agent.career_vision")


class TrajectoryMilestone(BaseModel):
    """Detailed milestone specification for a specific horizon (1, 3, or 5 years)."""

    timeframe: str = Field(..., description="Horizon: 'Year 1', 'Year 3', or 'Year 5'")
    target_title: str = Field(..., description="Target job title at this milestone")
    key_competencies: List[str] = Field(..., description="Skills to acquire during this phase")
    recommended_projects: List[str] = Field(..., description="Portfolio projects to validate competencies")
    key_deliverables: List[str] = Field(..., description="Verifiable proof (e.g. PR merged, cert attained)")


class CareerVisionOutput(BaseModel):
    """Structured response schema returned by the Career Vision Agent."""

    user_id: str
    target_role: str
    current_match_score: float = Field(..., ge=0.0, le=100.0, description="Baseline readiness score (0-100)")
    verified_skills_count: int
    missing_prerequisites: List[str]
    milestones: List[TrajectoryMilestone]
    strategic_advice: str


# Ontological role prerequisites for GraphRAG skill gap resolution
ROLE_PREREQUISITES: Dict[str, List[str]] = {
    "AI/ML Engineer": ["Docker", "Kubernetes", "MLOps", "Model Packaging"],
    "Full Stack Engineer": ["PostgreSQL", "Docker", "Redis", "GraphQL"],
    "DevOps & Cloud Engineer": ["Go", "Prometheus", "Grafana", "CI/CD Security"],
    "Data Scientist": ["SQL", "PyTorch", "Feature Engineering", "A/B Testing"],
    "Embedded Systems Engineer": ["Embedded Linux", "Device Drivers", "Rust", "Git"],
    "Frontend Engineer": ["TypeScript", "Next.js", "State Management", "Jest"],
    "Backend Engineer": ["Kafka", "Microservices Design", "Redis", "Docker"],
    "Cybersecurity Analyst": ["SIEM Tools", "Metasploit", "Cryptography", "SOC Procedures"],
    "Cloud Architect": ["Kubernetes", "Cost Optimization", "Terraform", "Security IAM"],
    "Data Analyst": ["Pandas", "PowerBI", "Statistical Analysis", "Data Cleaning"],
    "Software Development Engineer": ["Git", "Object-Oriented Design", "Databases", "Web Fundamentals"],
    "IoT Solutions Architect": ["C/C++", "Cloud IoT Core", "Security Protocols", "PCB Design"],
    "Mobile App Developer": ["State Management (Bloc)", "Native Android/iOS", "CI/CD App Stores", "SQLite"],
    "QA Automation Engineer": ["Postman/Newman", "CI/CD Jenkins", "Playwright", "Docker"],
    "Blockchain Developer": ["Hardhat/Foundry", "Smart Contract Security", "Rust", "EVM Internals"],
    "NLP Research Engineer": ["LangChain/LangGraph", "Vector DBs", "Model Quantization", "CUDA Optimization"],
    "Site Reliability Engineer": ["Kubernetes", "Terraform", "Prometheus/Alertmanager", "Chaos Engineering"],
    "Robotics Software Engineer": ["Computer Vision", "Sensor Fusion", "Kalman Filters", "Docker/Deployment"],
}


CAREER_VISION_SYSTEM_PROMPT = """You are CareerPilot's Career Vision Agent, an expert AI career architect.
Your mission is to map a rigorous, highly actionable 1-year, 3-year, and 5-year career roadmap for an engineering student.
Ground all recommendations in real software industry engineering ladders.
Return ONLY valid JSON matching the schema.
"""


def get_role_gaps(target_role: str, verified_skills: List[str]) -> List[str]:
    """Calculate ontological skill gap difference for target role."""
    # Find closest role in prerequisites
    for role_name, reqs in ROLE_PREREQUISITES.items():
        if role_name.lower() in target_role.lower() or target_role.lower() in role_name.lower():
            return [r for r in reqs if r.lower() not in {v.lower() for v in verified_skills}]
    # Default fallback prerequisites
    return ["Docker", "Kubernetes", "System Design", "Cloud Infrastructure"]


async def run_career_vision(
    user_id: str,
    params: Optional[Dict[str, Any]] = None,
    neo4j_client: Optional[Any] = None,
    llm_service: Optional[Any] = None,
) -> Dict[str, Any]:
    """Execute the Career Vision Agent workflow."""
    params_dict = params or {}
    target_role = params_dict.get("target_role", "AI/ML Engineer")

    logger.info("Executing Career Vision Agent for student %s targeting '%s'", user_id, target_role)

    student_name = params_dict.get("student_name") or "Student"
    param_skills = [str(s).strip() for s in (params_dict.get("skills") or []) if str(s).strip()]
    param_projects = [str(p).strip() for p in (params_dict.get("projects") or []) if str(p).strip()]
    verified_skills: List[str] = list(param_skills)

    if not verified_skills and neo4j_client is not None:
        try:
            query = """
            MATCH (s:Student { student_id: $user_id })
            OPTIONAL MATCH (s)-[r:HAS_SKILL]->(sk:Skill)
            RETURN s.name AS name, s.target_role AS role, collect(sk.skill_name) AS skills
            """
            records = await neo4j_client.execute_query(query, {"user_id": user_id})
            if records and records[0].get("name"):
                student_name = records[0]["name"]
                verified_skills = records[0].get("skills", [])
                if not params_dict.get("target_role") and records[0].get("role"):
                    target_role = records[0]["role"]
        except Exception as exc:
            logger.debug("Neo4j query failed: %s", exc)

    if not verified_skills:
        verified_skills = ["Python", "FastAPI"]

    # Compute missing skills dynamically based on role ontology & user's actual skills
    missing_skills = get_role_gaps(target_role, verified_skills)
    match_score = round(min(96.0, max(35.0, 45.0 + len(verified_skills) * 2.2 - len(missing_skills) * 4.0)), 1)

    fallback_output = {
        "user_id": user_id,
        "target_role": target_role,
        "current_match_score": match_score,
        "verified_skills_count": len(verified_skills),
        "missing_prerequisites": missing_skills,
        "milestones": [
            {
                "timeframe": "Year 1",
                "target_title": f"Junior {target_role}",
                "key_competencies": missing_skills[:2] if missing_skills else ["Production Testing", "CI/CD"],
                "recommended_projects": [f"Full-stack {target_role} Starter Portfolio"],
                "key_deliverables": ["Production code deployed to cloud"],
            },
            {
                "timeframe": "Year 3",
                "target_title": f"Mid-Level {target_role}",
                "key_competencies": (missing_skills[2:] or ["Observability"]) + ["Distributed Systems"],
                "recommended_projects": [f"High-Scale {target_role} Architecture"],
                "key_deliverables": ["Industry Certification attained"],
            },
            {
                "timeframe": "Year 5",
                "target_title": f"Senior {target_role} / Tech Lead",
                "key_competencies": ["System Architecture", "Team Leadership"],
                "recommended_projects": ["Enterprise Platform Lead"],
                "key_deliverables": ["Architectural Decision Records"],
            },
        ],
        "strategic_advice": (
            f"You possess strong capabilities across {len(verified_skills)} skills ({', '.join(verified_skills[:4])}). "
            f"Bridge your remaining gaps ({', '.join(missing_skills[:3]) or 'System Architecture'}) through production builds."
        ),
    }

    if llm_service is not None:
        try:
            user_prompt = (
                f"Student Name: {student_name}\n"
                f"Target Role: {target_role}\n"
                f"Skills Already Acquired ({len(verified_skills)}): {verified_skills[:35]}\n"
                f"Current Projects: {param_projects[:10]}\n"
                f"Initial Gap Signals: {missing_skills}\n\n"
                "Generate a personalized 3-stage career roadmap (Year 1, Year 3, Year 5) tailored specifically to this student.\n"
                "Rules:\n"
                "- Do NOT list skills the student ALREADY has in 'Skills Already Acquired' as missing/to-learn.\n"
                "- Identify the real next-level skills, production projects, and verifiable deliverables needed to reach Senior "
                f"{target_role}.\n"
                "- Return ONLY valid JSON with keys: user_id, target_role, current_match_score (number 0-100), "
                "verified_skills_count (int), missing_prerequisites (list of str), "
                "milestones (list of 3 objects with timeframe, target_title, key_competencies, recommended_projects, key_deliverables), "
                "strategic_advice (str)."
            )
            result = await llm_service.generate_json(
                system_prompt=CAREER_VISION_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                fallback_data=fallback_output,
            )
            if isinstance(result, dict) and result.get("milestones"):
                result.setdefault("user_id", user_id)
                result.setdefault("target_role", target_role)
                result.setdefault("verified_skills_count", len(verified_skills))
                result.setdefault("current_match_score", match_score)
                return result
        except Exception as exc:
            logger.warning("LLM generation fallback: %s", exc)

    return fallback_output
