"""Production External Integrations Router.

Provides live, non-mocked endpoints for:
1. Resume Parsing (PDF / TXT) -> Extracts verified technical skills and target role signals.
2. GitHub Profile & Repository Scanner -> Live GitHub REST API v3 ingestion.
3. LeetCode DSA Analyzer -> Live LeetCode GraphQL API ingestion and topic-gap diagnostics.
"""

from __future__ import annotations

import io
import json
import logging
import re
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from pypdf import PdfReader

from app.config import get_settings
from app.services.llm_service import get_llm_service

logger = logging.getLogger("orchestrator.integrations")

router = APIRouter(tags=["integrations"])

# Comprehensive engineering skill taxonomy: (Canonical Name, Category, Regex Pattern)
SKILL_TAXONOMY: List[tuple[str, str, str]] = [
    # Languages
    ("Python", "Languages", r"\bpython\b"),
    ("JavaScript", "Languages", r"\bjavascript\b|\bjs\b"),
    ("TypeScript", "Languages", r"\btypescript\b|\bts\b"),
    ("Java", "Languages", r"\bjava\b"),
    ("C++", "Languages", r"(?<![a-zA-Z])c\+\+(?![a-zA-Z])"),
    ("C", "Languages", r"(?<![a-zA-Z0-9])c(?![a-zA-Z0-9+#])"),
    ("C#", "Languages", r"(?<![a-zA-Z])c#(?![a-zA-Z])"),
    ("Go", "Languages", r"\bgolang\b|\bgo\b"),
    ("Rust", "Languages", r"\brust\b"),
    ("SQL", "Languages", r"\bsql\b"),
    ("Kotlin", "Languages", r"\bkotlin\b"),
    ("Swift", "Languages", r"\bswift\b"),
    ("Ruby", "Languages", r"\bruby\b"),
    ("PHP", "Languages", r"\bphp\b"),
    ("Scala", "Languages", r"\bscala\b"),
    ("R", "Languages", r"(?<![a-zA-Z])r(?![a-zA-Z0-9])"),
    ("Bash", "Languages", r"\bbash\b|\bshell\b"),
    ("HTML", "Languages", r"\bhtml5?\b"),
    ("CSS", "Languages", r"\bcss3?\b"),
    # Frameworks & Libraries
    ("React", "Frameworks", r"\breact(?:\.js|js)?\b"),
    ("Next.js", "Frameworks", r"\bnext(?:\.js|js)\b"),
    ("Node.js", "Frameworks", r"\bnode(?:\.js|js)?\b"),
    ("Express.js", "Frameworks", r"\bexpress(?:\.js|js)?\b"),
    ("FastAPI", "Frameworks", r"\bfastapi\b"),
    ("Django", "Frameworks", r"\bdjango\b"),
    ("Flask", "Frameworks", r"\bflask\b"),
    ("Spring Boot", "Frameworks", r"\bspring\s*boot\b|\bspring\b"),
    ("Angular", "Frameworks", r"\bangular\b"),
    ("Vue.js", "Frameworks", r"\bvue(?:\.js|js)?\b"),
    ("Tailwind CSS", "Frameworks", r"\btailwind(?:\s*css)?\b"),
    ("GraphQL", "Frameworks", r"\bgraphql\b"),
    ("gRPC", "Frameworks", r"\bgrpc\b"),
    ("Redux", "Frameworks", r"\bredux\b"),
    ("NestJS", "Frameworks", r"\bnestjs\b"),
    # AI & ML
    ("PyTorch", "AI & ML", r"\bpytorch\b"),
    ("TensorFlow", "AI & ML", r"\btensorflow\b"),
    ("Scikit-learn", "AI & ML", r"\bscikit-learn\b|\bsklearn\b"),
    ("LangChain", "AI & ML", r"\blangchain\b"),
    ("LangGraph", "AI & ML", r"\blanggraph\b"),
    ("Hugging Face", "AI & ML", r"\bhugging\s*face\b|\btransformers\b"),
    ("OpenCV", "AI & ML", r"\bopencv\b"),
    ("Pandas", "AI & ML", r"\bpandas\b"),
    ("NumPy", "AI & ML", r"\bnumpy\b"),
    ("RAG", "AI & ML", r"\brag\b|\bretrieval[-\s]augmented\b"),
    ("LLMs", "AI & ML", r"\bllm(?:s)?\b|\blarge language model\b"),
    ("NLP", "AI & ML", r"\bnlp\b|\bnatural language processing\b"),
    ("Computer Vision", "AI & ML", r"\bcomputer vision\b"),
    # Databases
    ("MongoDB", "Database", r"\bmongodb\b|\bmongoose\b"),
    ("PostgreSQL", "Database", r"\bpostgresql\b|\bpostgres\b"),
    ("MySQL", "Database", r"\bmysql\b"),
    ("Redis", "Database", r"\bredis\b"),
    ("Neo4j", "Database", r"\bneo4j\b|\bcypher\b"),
    ("ChromaDB", "Database", r"\bchromadb\b|\bchroma\b"),
    ("SQLite", "Database", r"\bsqlite\b"),
    ("Elasticsearch", "Database", r"\belasticsearch\b"),
    ("Firebase", "Database", r"\bfirebase\b"),
    ("Supabase", "Database", r"\bsupabase\b"),
    ("DynamoDB", "Database", r"\bdynamodb\b"),
    # DevOps & Cloud
    ("Docker", "DevOps & Cloud", r"\bdocker\b"),
    ("Kubernetes", "DevOps & Cloud", r"\bkubernetes\b|\bk8s\b"),
    ("AWS", "DevOps & Cloud", r"\baws\b|\bamazon web services\b"),
    ("GCP", "DevOps & Cloud", r"\bgcp\b|\bgoogle cloud\b"),
    ("Azure", "DevOps & Cloud", r"\bazure\b"),
    ("Terraform", "DevOps & Cloud", r"\bterraform\b"),
    ("CI/CD", "DevOps & Cloud", r"\bci/cd\b|\bgithub actions\b|\bjenkins\b"),
    ("Nginx", "DevOps & Cloud", r"\bnginx\b"),
    ("Linux", "DevOps & Cloud", r"\blinux\b|\bubuntu\b"),
    ("Kafka", "DevOps & Cloud", r"\bkafka\b"),
    ("Git", "DevOps & Cloud", r"\bgit\b|\bgithub\b"),
    ("Prometheus", "DevOps & Cloud", r"\bprometheus\b"),
    ("Grafana", "DevOps & Cloud", r"\bgrafana\b"),
]


def _extract_skills_from_text(text: str) -> List[Dict[str, Any]]:
    """Deterministically extract canonical technical skills from resume text."""
    found: List[Dict[str, Any]] = []
    seen = set()
    lower_text = text.lower()
    for name, category, pattern in SKILL_TAXONOMY:
        if re.search(pattern, lower_text, flags=re.IGNORECASE):
            if name.lower() not in seen:
                seen.add(name.lower())
                found.append(
                    {
                        "name": name,
                        "level": "intermediate",
                        "category": category,
                        "verified": False,
                        "source": "resume",
                    }
                )
    return found


def _infer_target_role(text: str, skills: List[Dict[str, Any]]) -> str:
    """Infer target role from explicit resume text or skill distribution."""
    lower = text.lower()
    if any(k in lower for k in ["machine learning engineer", "ai engineer", "ml engineer", "deep learning"]):
        return "AI / Machine Learning Engineer"
    if any(k in lower for k in ["data scientist", "data science"]):
        return "Data Scientist"
    if any(k in lower for k in ["devops", "site reliability", "cloud architect", "kubernetes"]):
        return "DevOps & Cloud Engineer"
    if any(k in lower for k in ["full stack", "full-stack", "mern"]):
        return "Full Stack Engineer"
    if any(k in lower for k in ["backend engineer", "backend developer", "fastapi", "microservices"]):
        return "Backend Engineer"
    if any(k in lower for k in ["frontend engineer", "frontend developer"]):
        return "Frontend Engineer"

    cats = {s["category"] for s in skills}
    if "AI & ML" in cats:
        return "AI / Machine Learning Engineer"
    if "DevOps & Cloud" in cats and "Frameworks" in cats:
        return "Full Stack Engineer"
    return "Software Development Engineer"


@router.post(
    "/api/v1/orchestrator/integrations/resume/parse",
    summary="Parse uploaded resume (PDF/TXT) and extract technical skills",
)
@router.post(
    "/api/v1/integrations/resume/parse",
    summary="Parse uploaded resume (PDF/TXT) and extract technical skills (alias)",
)
async def parse_resume(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Extract text from an uploaded PDF/TXT resume and parse structured skills."""
    filename = (file.filename or "resume").lower()
    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    extracted_text = ""
    if filename.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(content))
            pages = [page.extract_text() or "" for page in reader.pages]
            extracted_text = "\n".join(pages).strip()
        except Exception as exc:
            logger.error("PDF extraction failed for %s: %s", filename, exc)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read PDF file: {exc}",
            )
    elif filename.endswith((".txt", ".md")):
        extracted_text = content.decode("utf-8", errors="ignore").strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF (.pdf) or Text (.txt, .md) resume.",
        )

    if len(extracted_text) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract readable text from the uploaded resume. Ensure it is not a scanned image-only PDF.",
        )

    # 1. Deterministic taxonomy extraction
    skills = _extract_skills_from_text(extracted_text)
    suggested_role = _infer_target_role(extracted_text, skills)
    llm_summary: Optional[str] = None

    # 2. Optional Groq LLM enrichment if API key is configured
    llm = get_llm_service()
    if llm._get_llm() is not None:
        try:
            prompt = (
                "Extract technical skills and target engineering role from this resume text. "
                "Return ONLY valid JSON with keys: "
                '{"skills": [{"name": str, "category": str, "level": "beginner"|"intermediate"|"advanced"}], '
                '"target_role": str, "summary": str}.\n\n'
                f"RESUME TEXT:\n{extracted_text[:6000]}"
            )
            parsed = await llm.generate_json(
                system_prompt="You are a precise technical resume parser. Return only valid JSON.",
                user_prompt=prompt,
                fallback_data={},
            )
            if isinstance(parsed, dict) and parsed:
                existing_names = {s["name"].lower() for s in skills}
                for item in parsed.get("skills", []):
                    sname = str(item.get("name", "")).strip()
                    if sname and sname.lower() not in existing_names:
                        existing_names.add(sname.lower())
                        skills.append(
                            {
                                "name": sname,
                                "level": item.get("level", "intermediate"),
                                "category": item.get("category", "General"),
                                "verified": False,
                                "source": "resume",
                            }
                        )
                if parsed.get("target_role"):
                    suggested_role = parsed["target_role"]
                llm_summary = parsed.get("summary")
        except Exception as exc:
            logger.warning("LLM resume enrichment skipped (%s); deterministic extraction succeeded.", exc)

    return {
        "filename": file.filename,
        "extracted_characters": len(extracted_text),
        "skills_count": len(skills),
        "skills": skills,
        "suggested_target_role": suggested_role,
        "summary": llm_summary or f"Extracted {len(skills)} technical competencies from {file.filename}.",
    }


def _extract_certifications_from_text(text: str) -> List[Dict[str, str]]:
    """Deterministically parse certifications from LinkedIn 'Save to PDF' text."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    section_headers = {
        "certifications",
        "licenses & certifications",
        "licenses and certifications",
    }
    stop_headers = {
        "experience",
        "education",
        "skills",
        "top skills",
        "languages",
        "honors-awards",
        "honors & awards",
        "projects",
        "publications",
        "summary",
        "contact",
        "patents",
        "volunteer experience",
    }

    certs: List[Dict[str, str]] = []
    in_section = False
    for line in lines:
        low = line.lower()
        if low in section_headers:
            in_section = True
            continue
        if in_section:
            if low in stop_headers or re.match(r"^page \d+ of \d+$", low):
                break
            if low.startswith(("http://", "https://", "credential id", "see credential")):
                continue
            if len(line) >= 4:
                certs.append({"name": line, "issuer": "LinkedIn PDF", "issue_date": ""})
    return certs


@router.post(
    "/api/v1/orchestrator/integrations/linkedin/parse",
    summary="Parse LinkedIn 'Save to PDF' export for certifications and skills",
)
@router.post(
    "/api/v1/integrations/linkedin/parse",
    summary="Parse LinkedIn 'Save to PDF' export for certifications and skills (alias)",
)
async def parse_linkedin_pdf(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Extract certifications, skills, and target role from an official LinkedIn Profile PDF."""
    filename = (file.filename or "Profile.pdf").lower()
    content = await file.read()

    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    if not filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload the official PDF file exported from LinkedIn (More -> Save to PDF).",
        )

    try:
        reader = PdfReader(io.BytesIO(content))
        extracted_text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to read PDF: {exc}")

    if len(extracted_text) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract readable text from the uploaded LinkedIn PDF.",
        )

    skills = _extract_skills_from_text(extracted_text)
    certifications = _extract_certifications_from_text(extracted_text)
    suggested_role = _infer_target_role(extracted_text, skills)

    llm = get_llm_service()
    if llm._get_llm() is not None:
        try:
            prompt = (
                "Extract all Licenses & Certifications and technical skills from this LinkedIn Profile PDF text. "
                "Return ONLY valid JSON with keys: "
                '{"certifications": [{"name": str, "issuer": str, "issue_date": str}], '
                '"skills": [{"name": str, "category": str, "level": "intermediate"}], '
                '"target_role": str}.\n\n'
                f"LINKEDIN PDF TEXT:\n{extracted_text[:7000]}"
            )
            parsed = await llm.generate_json(
                system_prompt="You are a precise LinkedIn PDF parser. Return only valid JSON. Never invent entries not present in the text.",
                user_prompt=prompt,
                fallback_data={},
            )
            if isinstance(parsed, dict) and parsed:
                if parsed.get("certifications"):
                    certifications = [
                        {
                            "name": str(c.get("name", "")).strip(),
                            "issuer": str(c.get("issuer", "")).strip(),
                            "issue_date": str(c.get("issue_date", "")).strip(),
                        }
                        for c in parsed["certifications"]
                        if str(c.get("name", "")).strip()
                    ]
                existing_names = {s["name"].lower() for s in skills}
                for item in parsed.get("skills", []):
                    sname = str(item.get("name", "")).strip()
                    if sname and sname.lower() not in existing_names:
                        existing_names.add(sname.lower())
                        skills.append(
                            {
                                "name": sname,
                                "level": item.get("level", "intermediate"),
                                "category": item.get("category", "General"),
                                "verified": False,
                                "source": "linkedin",
                            }
                        )
                if parsed.get("target_role"):
                    suggested_role = parsed["target_role"]
        except Exception as exc:
            logger.warning("LLM LinkedIn PDF enrichment skipped (%s); using deterministic extraction.", exc)

    return {
        "filename": file.filename,
        "certifications_count": len(certifications),
        "certifications": certifications,
        "skills_count": len(skills),
        "skills": skills,
        "suggested_target_role": suggested_role,
    }


@router.get(
    "/api/v1/orchestrator/integrations/github/{username}",
    summary="Fetch live GitHub profile and public repositories",
)
@router.get(
    "/api/v1/integrations/github/{username}",
    summary="Fetch live GitHub profile and public repositories (alias)",
)
async def fetch_github_profile(username: str) -> Dict[str, Any]:
    """Query live GitHub REST API v3 for a user's profile and repositories."""
    clean_user = username.strip().lstrip("@")
    if not clean_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="GitHub username is required.")

    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CareerPilot-Orchestrator/1.0",
    }

    async with httpx.AsyncClient(timeout=8.0) as client:
        user_resp, repos_resp = await client.get(
            f"https://api.github.com/users/{clean_user}", headers=headers
        ), await client.get(
            f"https://api.github.com/users/{clean_user}/repos?sort=updated&per_page=30",
            headers=headers,
        )

    if user_resp.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GitHub user '{clean_user}' not found.",
        )
    if user_resp.status_code in (403, 429) or repos_resp.status_code in (403, 429):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub API rate limit reached. Please try again shortly.",
        )
    if user_resp.status_code != 200 or repos_resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"GitHub API error (HTTP {user_resp.status_code}).",
        )

    user_data = user_resp.json()
    raw_repos = repos_resp.json()

    repositories: List[Dict[str, Any]] = []
    language_counts: Dict[str, int] = {}
    total_stars = 0

    for r in raw_repos:
        lang = r.get("language")
        stars = r.get("stargazers_count", 0)
        total_stars += stars
        # Only verify languages from non-forked repositories and exclude non-language markers
        if lang and not r.get("fork") and lang not in ("Jupyter Notebook", "HTML", "CSS", "Makefile"):
            language_counts[lang] = language_counts.get(lang, 0) + 1
        repositories.append(
            {
                "id": r.get("id"),
                "name": r.get("name"),
                "description": r.get("description") or "",
                "html_url": r.get("html_url"),
                "language": lang or "Unknown",
                "stars": stars,
                "forks": r.get("forks_count", 0),
                "topics": r.get("topics", []),
                "is_fork": r.get("fork", False),
                "updated_at": r.get("updated_at"),
            }
        )

    detected_skills = [
        {
            "name": lang,
            "level": "advanced" if count >= 3 else "intermediate",
            "category": "Languages",
            "verified": True,
            "source": "github",
        }
        for lang, count in sorted(language_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "source": "live_github_api",
        "profile": {
            "username": user_data.get("login"),
            "name": user_data.get("name") or user_data.get("login"),
            "avatar_url": user_data.get("avatar_url"),
            "bio": user_data.get("bio") or "",
            "html_url": user_data.get("html_url"),
            "public_repos": user_data.get("public_repos", len(repositories)),
            "followers": user_data.get("followers", 0),
            "total_stars": total_stars,
        },
        "repositories": repositories,
        "detected_skills": detected_skills,
        "language_breakdown": language_counts,
    }


@router.get(
    "/api/v1/orchestrator/integrations/leetcode/{username}",
    summary="Fetch live LeetCode stats and compute DSA standard diagnostics",
)
@router.get(
    "/api/v1/integrations/leetcode/{username}",
    summary="Fetch live LeetCode stats and compute DSA standard diagnostics (alias)",
)
async def fetch_leetcode_dsa_analysis(username: str) -> Dict[str, Any]:
    """Query LeetCode's live GraphQL API for solved counts and topic-level DSA proficiency."""
    clean_user = username.strip()
    if not clean_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="LeetCode username is required.")

    query = {
        "query": """
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              userAvatar
              ranking
              reputation
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            tagProblemCounts {
              fundamental { tagName problemsSolved }
              intermediate { tagName problemsSolved }
              advanced { tagName problemsSolved }
            }
          }
        }
        """,
        "variables": {"username": clean_user},
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                "https://leetcode.com/graphql",
                json=query,
                headers={
                    "Content-Type": "application/json",
                    "Referer": "https://leetcode.com",
                    "User-Agent": "CareerPilot-Orchestrator/1.0",
                },
            )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to LeetCode API: {exc}",
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LeetCode GraphQL API returned HTTP {resp.status_code}.",
        )

    payload = resp.json()
    matched = (payload.get("data") or {}).get("matchedUser")
    if not matched:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LeetCode user '{clean_user}' not found.",
        )

    ac_stats = {
        item["difficulty"]: item["count"]
        for item in (matched.get("submitStats") or {}).get("acSubmissionNum", [])
    }
    total_solved = ac_stats.get("All", 0)
    easy = ac_stats.get("Easy", 0)
    medium = ac_stats.get("Medium", 0)
    hard = ac_stats.get("Hard", 0)

    # Compute DSA Standard Tier & Readiness Score from actual solved distribution
    if total_solved >= 300 and (medium + hard) >= 150:
        dsa_tier = "Competitive / FAANG-Ready"
        dsa_score = min(85 + int((medium + hard * 2) / 40), 99)
    elif total_solved >= 150 and medium >= 60:
        dsa_tier = "Interview Ready"
        dsa_score = min(65 + int((medium + hard * 2) / 10), 84)
    elif total_solved >= 50:
        dsa_tier = "Developing"
        dsa_score = min(40 + int(total_solved / 6), 64)
    else:
        dsa_tier = "Foundational"
        dsa_score = max(10, min(total_solved, 39))

    # Aggregate real topic counts
    tag_counts = matched.get("tagProblemCounts") or {}
    all_topics: Dict[str, int] = {}
    for bucket in ("fundamental", "intermediate", "advanced"):
        for entry in tag_counts.get(bucket, []):
            tname = entry.get("tagName")
            if tname:
                all_topics[tname] = entry.get("problemsSolved", 0)

    core_interview_topics = [
        ("Array", 20),
        ("String", 15),
        ("Hash Table", 15),
        ("Two Pointers", 10),
        ("Binary Search", 10),
        ("Tree", 12),
        ("Graph", 10),
        ("Dynamic Programming", 15),
        ("Backtracking", 8),
        ("Greedy", 10),
    ]

    weak_topics = [
        {"topic": topic, "solved": all_topics.get(topic, 0), "recommended_target": target}
        for topic, target in core_interview_topics
        if all_topics.get(topic, 0) < target
    ]
    strong_topics = sorted(
        [{"topic": k, "solved": v} for k, v in all_topics.items() if v > 0],
        key=lambda x: x["solved"],
        reverse=True,
    )[:6]

    suggestions: List[str] = []
    if total_solved == 0:
        suggestions.append("Start with the NeetCode 150 / Blind 75 roadmap focusing on Arrays and Hash Tables.")
    else:
        if medium < easy and total_solved >= 30:
            suggestions.append(
                f"Your Easy count ({easy}) exceeds Medium ({medium}). Shift 70% of daily practice to Medium problems to match technical interview bars."
            )
        if hard < 10 and total_solved >= 100:
            suggestions.append(
                f"Only {hard} Hard problems solved. Target 1-2 Hard problems per week in Graphs and Dynamic Programming."
            )
        for wt in weak_topics[:3]:
            suggestions.append(
                f"Strengthen '{wt['topic']}' (currently {wt['solved']} solved; aim for {wt['recommended_target']}+)."
            )
        if not suggestions:
            suggestions.append(
                "Balanced Easy/Medium/Hard distribution across core topics. Focus on timed 45-minute mock contests to sharpen speed."
            )

    profile_info = matched.get("profile") or {}
    return {
        "source": "live_leetcode_graphql",
        "username": matched.get("username"),
        "real_name": profile_info.get("realName") or matched.get("username"),
        "avatar_url": profile_info.get("userAvatar"),
        "ranking": profile_info.get("ranking"),
        "stats": {
            "total": total_solved,
            "easy": easy,
            "medium": medium,
            "hard": hard,
        },
        "dsa_standard": {
            "tier": dsa_tier,
            "score": dsa_score,
        },
        "strong_topics": strong_topics,
        "weak_topics": weak_topics[:5],
        "suggestions": suggestions,
    }


class SkillBenchmarkRequest(BaseModel):
    """Request payload for real-time role-based skill market research."""

    target_role: str = Field(..., min_length=1)
    skills: List[Dict[str, Any]] = Field(default_factory=list)


def _score_student_skill(level: Any, verified: bool) -> int:
    base_map = {"beginner": 45, "intermediate": 70, "advanced": 85, "expert": 95}
    base = base_map.get(str(level or "intermediate").lower(), 65)
    return min(base + (10 if verified else 0), 100)


@router.post(
    "/api/v1/orchestrator/integrations/skills/benchmark",
    summary="Research target role market demand via Job Board MCP + LLM and benchmark user skills",
)
@router.post(
    "/api/v1/integrations/skills/benchmark",
    summary="Research target role market demand (alias)",
)
async def benchmark_skills_for_role(request: SkillBenchmarkRequest) -> Dict[str, Any]:
    """Dynamically research market skill requirements for the user's target role
    using the Job Board MCP Server and Groq LLM, then benchmark the user's real skills.
    """
    if not request.skills:
        return {"radarData": [], "narrative": "", "source": "empty_skills"}

    settings = get_settings()
    target_role = request.target_role.strip()
    user_skills_map = {
        str(s.get("name", "")).strip().lower(): s
        for s in request.skills
        if s.get("name")
    }

    # 1. Query live Job Board MCP server for real market postings matching target_role
    mcp_postings: List[Dict[str, Any]] = []
    mcp_trends: List[Dict[str, Any]] = []
    try:
        mcp_base = settings.job_board_mcp_url.rstrip("/")
        async with httpx.AsyncClient(timeout=4.0) as client:
            postings_resp, trends_resp = await client.post(
                f"{mcp_base}/invoke",
                json={"tool": "search_job_postings", "params": {"role": target_role, "limit": 15}},
            ), await client.post(
                f"{mcp_base}/invoke",
                json={"tool": "get_skill_demand_trends", "params": {"domain": target_role, "top_n": 10}},
            )
            if postings_resp.status_code == 200:
                mcp_postings = postings_resp.json().get("result", {}).get("postings", [])
            if trends_resp.status_code == 200:
                mcp_trends = trends_resp.json().get("result", {}).get("top_skills", [])
    except Exception as exc:
        logger.warning("Job Board MCP lookup skipped (%s); proceeding with LLM market research.", exc)

    # 2. Use Groq LLM to research & synthesize the role-specific benchmark radar
    llm = get_llm_service()
    if llm._get_llm() is not None:
        try:
            student_skill_summary = [
                {
                    "name": s.get("name"),
                    "level": s.get("level", "intermediate"),
                    "verified": bool(s.get("verified", False)),
                }
                for s in request.skills[:20]
            ]
            market_context = {
                "matching_job_titles": [p.get("title") for p in mcp_postings[:8]],
                "mcp_top_demanded_skills": mcp_trends[:8],
            }
            prompt = (
                f"Target Role: {target_role}\n"
                f"Student's Current Skills: {json.dumps(student_skill_summary)}\n"
                f"Live Job Market Data (from Job Board MCP): {json.dumps(market_context)}\n\n"
                "Task: Research the 6 to 7 most critical technical skills required in the real job market for "
                f"'{target_role}'. Include the student's relevant skills AND the most important missing skills they need "
                "for this role. For each skill, output:\n"
                "- skill: exact skill name (use student's exact skill name if they have it)\n"
                "- student: integer 0-100 (0-15 if student does not have this skill; 45-95 based on their level and verified=true bonus if they have it)\n"
                "- market: integer 65-95 representing real industry demand for this role\n"
                "Also provide a concise 1-2 sentence 'narrative' explaining the key alignment & gap for this target role.\n"
                'Return ONLY valid JSON: {"radarData": [{"skill": str, "student": int, "market": int, "fullMark": 100}], "narrative": str}'
            )
            parsed = await llm.generate_json(
                system_prompt="You are an expert technical career market researcher. Return only valid JSON.",
                user_prompt=prompt,
                fallback_data={},
            )
            radar = parsed.get("radarData") if isinstance(parsed, dict) else None
            if isinstance(radar, list) and len(radar) >= 3:
                cleaned_radar = []
                for item in radar[:7]:
                    sname = str(item.get("skill", "")).strip()
                    if not sname:
                        continue
                    # Ground student score against actual profile so LLM never over/under-reports possession
                    matched_sk = user_skills_map.get(sname.lower())
                    if matched_sk:
                        st_score = _score_student_skill(matched_sk.get("level"), bool(matched_sk.get("verified")))
                    else:
                        st_score = min(int(item.get("student", 10)), 25)
                    cleaned_radar.append(
                        {
                            "skill": sname,
                            "student": st_score,
                            "market": max(50, min(int(item.get("market", 80)), 100)),
                            "fullMark": 100,
                        }
                    )
                if cleaned_radar:
                    return {
                        "radarData": cleaned_radar,
                        "narrative": parsed.get("narrative", ""),
                        "source": "live_job_board_mcp+groq_llm" if mcp_trends or mcp_postings else "live_groq_llm",
                    }
        except Exception as exc:
            logger.warning("LLM market benchmark research failed (%s); falling back to Job Board MCP frequency.", exc)

    # 3. Deterministic fallback strictly from live Job Board MCP data + student's actual skills
    radar_items: List[Dict[str, Any]] = []
    seen = set()

    for trend in mcp_trends[:5]:
        tname = str(trend.get("skill", "")).strip()
        if not tname or tname.lower() in seen:
            continue
        seen.add(tname.lower())
        matched_sk = user_skills_map.get(tname.lower())
        radar_items.append(
            {
                "skill": tname,
                "student": _score_student_skill(matched_sk.get("level"), bool(matched_sk.get("verified"))) if matched_sk else 10,
                "market": max(65, min(int(trend.get("demand_percentage", 80)), 100)),
                "fullMark": 100,
            }
        )

    for sk in request.skills:
        if len(radar_items) >= 7:
            break
        sname = str(sk.get("name", "")).strip()
        if sname and sname.lower() not in seen:
            seen.add(sname.lower())
            radar_items.append(
                {
                    "skill": sname,
                    "student": _score_student_skill(sk.get("level"), bool(sk.get("verified"))),
                    "market": 80,
                    "fullMark": 100,
                }
            )

    return {
        "radarData": radar_items,
        "narrative": f"Benchmarked {len(request.skills)} profile skills against live Job Board MCP demand for {target_role}.",
        "source": "live_job_board_mcp",
    }
