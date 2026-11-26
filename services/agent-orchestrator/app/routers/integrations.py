"""Production External Integrations Router.

Provides live, non-mocked endpoints for:
1. Resume Parsing (PDF / TXT) -> Extracts verified technical skills and target role signals.
2. GitHub Profile & Repository Scanner -> Live GitHub REST API v3 ingestion.
3. LeetCode DSA Analyzer -> Live LeetCode GraphQL API ingestion and topic-gap diagnostics.
"""

from __future__ import annotations

import asyncio
import html
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


class GithubAuditRequest(BaseModel):
    """Request payload for deep GitHub repository & skill auditing."""

    username: str = Field(..., min_length=1)
    skills: List[str] = Field(default_factory=list)


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
    return await _run_github_audit(username, candidate_skills=[])


@router.post(
    "/api/v1/orchestrator/integrations/github/audit",
    summary="Deep-audit GitHub repositories against candidate profile skills",
)
@router.post(
    "/api/v1/integrations/github/audit",
    summary="Deep-audit GitHub repositories against candidate profile skills (alias)",
)
async def audit_github_profile(request: GithubAuditRequest) -> Dict[str, Any]:
    """Scan full repository trees, dependency manifests, and source code to verify
    the user's skills without hardcoding fixed skill lists.
    """
    return await _run_github_audit(request.username, candidate_skills=request.skills)


async def _run_github_audit(username: str, candidate_skills: List[str]) -> Dict[str, Any]:
    """Query live GitHub REST API v3, scan recursive repo trees & files, and verify skills."""
    clean_user = username.strip().lstrip("@")
    if not clean_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="GitHub username is required.")

    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CareerPilot-Orchestrator/1.0",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
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

    # --- Deep Code Audit: recursive repo tree + manifests + source imports + LLM semantic audit ---
    MANIFEST_NAMES = {
        "requirements.txt", "pyproject.toml", "pipfile",
        "package.json", "go.mod", "pom.xml", "build.gradle",
        "cargo.toml", "composer.json", "readme.md", "dockerfile",
    }
    CODE_EXTENSIONS = (".py", ".js", ".ts", ".tsx", ".jsx", ".ipynb")
    SKIP_DIRS = ("node_modules/", ".venv/", "venv/", "__pycache__/", "dist/", "build/", ".git/")

    top_repos = [r for r in raw_repos if not r.get("fork")][:8]
    files_scanned_count = 0

    async def _fetch_raw_file(client: httpx.AsyncClient, owner: str, repo: str, branch: str, path: str) -> tuple[str, str]:
        try:
            url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
            resp = await client.get(url, headers={"User-Agent": "CareerPilot-Orchestrator/1.0"})
            if resp.status_code == 200:
                return path, resp.text[:4500]
        except Exception:
            pass
        return path, ""

    async def _scan_repo_tree(client: httpx.AsyncClient, repo: Dict[str, Any]) -> Dict[str, Any]:
        owner = repo.get("owner", {}).get("login") or clean_user
        repo_name = repo.get("name", "")
        branch = repo.get("default_branch") or "main"

        tree_paths: List[str] = []
        try:
            tree_url = f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/{branch}?recursive=1"
            t_resp = await client.get(tree_url, headers=headers)
            if t_resp.status_code == 200:
                tree_paths = [
                    item.get("path", "")
                    for item in t_resp.json().get("tree", [])
                    if item.get("type") == "blob"
                    and not any(sd in item.get("path", "").lower() for sd in SKIP_DIRS)
                ]
        except Exception:
            pass

        # Pick manifests anywhere in repo (prioritize shallower paths)
        manifest_paths = sorted(
            [p for p in tree_paths if p.rsplit("/", 1)[-1].lower() in MANIFEST_NAMES],
            key=lambda p: (p.count("/"), len(p)),
        )[:5]

        # Pick top source files to inspect real imports & usage
        code_paths = sorted(
            [p for p in tree_paths if p.lower().endswith(CODE_EXTENSIONS)],
            key=lambda p: (p.count("/"), len(p)),
        )[:4]

        target_paths = manifest_paths + code_paths
        if not target_paths:
            # Fallback to root manifests if tree endpoint was unavailable
            target_paths = ["requirements.txt", "pyproject.toml", "package.json", "README.md"]

        fetched = await asyncio.gather(*[
            _fetch_raw_file(client, owner, repo_name, branch, p) for p in target_paths
        ])
        file_contents = {p: txt for p, txt in fetched if txt}

        return {
            "repo": repo_name,
            "language": repo.get("language") or "",
            "description": repo.get("description") or "",
            "topics": repo.get("topics") or [],
            "file_paths_sample": tree_paths[:40],
            "files": file_contents,
        }

    async with httpx.AsyncClient(timeout=12.0) as scan_client:
        repo_bundles = await asyncio.gather(*[_scan_repo_tree(scan_client, r) for r in top_repos])

    repo_text_by_name: Dict[str, str] = {}
    all_signal_text = ""
    for bundle in repo_bundles:
        files_scanned_count += len(bundle["files"])
        combined = " ".join([
            bundle["description"],
            " ".join(bundle["topics"]),
            bundle["language"],
            " ".join(bundle["file_paths_sample"]),
            " ".join(bundle["files"].values()),
        ])
        repo_text_by_name[bundle["repo"]] = combined
        all_signal_text += " " + combined

    for r in repositories:
        if r["name"] not in repo_text_by_name:
            repo_text_by_name[r["name"]] = (
                (r.get("description") or "") + " " + " ".join(r.get("topics") or []) + " " + (r.get("language") or "")
            )
            all_signal_text += " " + repo_text_by_name[r["name"]]

    # 3. Deterministic regex scan (SKILL_TAXONOMY + normalized candidate_skills)
    skill_hit_map: Dict[str, Dict[str, Any]] = {}

    for skill_name, category, pattern in SKILL_TAXONOMY:
        matches = re.findall(pattern, all_signal_text, flags=re.IGNORECASE)
        if matches:
            evidence_repos = [
                rname for rname, rtxt in repo_text_by_name.items()
                if re.search(pattern, rtxt, flags=re.IGNORECASE)
            ]
            skill_hit_map[skill_name] = {
                "name": skill_name,
                "category": category,
                "count": len(matches),
                "repos": evidence_repos[:3],
                "evidence_detail": None,
            }

    # Normalized matching for any custom/user-provided skills (e.g. SQLAlchemy, Sentence Transformers)
    for raw_skill in candidate_skills:
        cname = str(raw_skill or "").strip()
        if not cname or cname.lower() in {k.lower() for k in skill_hit_map}:
            continue
        # Match space/hyphen/underscore variants, e.g. "Sentence Transformers" -> sentence[-_\s]?transformers
        tokens = [re.escape(t) for t in re.split(r"[\s_\-/]+", cname) if t]
        if not tokens:
            continue
        flex_pattern = r"\b" + r"[-_\s]*".join(tokens) + r"\b"
        matches = re.findall(flex_pattern, all_signal_text, flags=re.IGNORECASE)
        if matches:
            evidence_repos = [
                rname for rname, rtxt in repo_text_by_name.items()
                if re.search(flex_pattern, rtxt, flags=re.IGNORECASE)
            ]
            skill_hit_map[cname] = {
                "name": cname,
                "category": "Technical",
                "count": len(matches),
                "repos": evidence_repos[:3],
                "evidence_detail": None,
            }

    # 4. Semantic Code Audit via Groq LLM (maps libraries/imports -> conceptual & custom skills without hardcoding)
    llm = get_llm_service()
    if llm._get_llm() is not None and repo_bundles:
        try:
            compact_evidence = [
                {
                    "repo": b["repo"],
                    "language": b["language"],
                    "description": b["description"][:200],
                    "topics": b["topics"][:10],
                    "files_scanned": list(b["files"].keys()),
                    "code_and_manifest_excerpts": {
                        p: txt[:1200] for p, txt in list(b["files"].items())[:4]
                    },
                }
                for b in repo_bundles
            ]
            prompt = (
                f"Candidate's Listed Skills to Audit: {json.dumps(candidate_skills[:40])}\n\n"
                f"Scanned GitHub Repository Evidence:\n{json.dumps(compact_evidence)[:11000]}\n\n"
                "Task: Inspect the actual dependency manifests, imports, file paths, descriptions, and code excerpts above. "
                "Verify which of the candidate's listed skills (including conceptual or library-backed skills like "
                "Computer Vision via opencv/cv2/yolo/torchvision/PIL, SQLAlchemy via sqlalchemy, Sentence Transformers via "
                "sentence-transformers, Semantic Search via embeddings/vector search/chromadb/faiss, etc.) "
                "have REAL evidence in the scanned repositories.\n"
                "STRICT RULES:\n"
                "- ONLY include skills that have genuine evidence in the provided repo data. NEVER guess or fabricate.\n"
                "- Use the EXACT spelling from Candidate's Listed Skills when verifying one of their skills.\n"
                "- For each verified skill, cite the exact repo name(s) and file/library/import that proves it.\n"
                'Return ONLY valid JSON: {"verified_skills": [{"name": str, "category": str, "repos": [str], "evidence_detail": str}]}'
            )
            parsed = await llm.generate_json(
                system_prompt="You are a strict, evidence-based code auditor. Return only valid JSON.",
                user_prompt=prompt,
                fallback_data={},
            )
            for item in parsed.get("verified_skills", []) if isinstance(parsed, dict) else []:
                sname = str(item.get("name", "")).strip()
                if not sname:
                    continue
                existing_key = next((k for k in skill_hit_map if k.lower() == sname.lower()), None)
                repos_cited = [str(r) for r in (item.get("repos") or []) if r][:3]
                ev_detail = str(item.get("evidence_detail") or "").strip()
                if existing_key:
                    if ev_detail:
                        skill_hit_map[existing_key]["evidence_detail"] = ev_detail
                    if repos_cited:
                        skill_hit_map[existing_key]["repos"] = repos_cited
                else:
                    skill_hit_map[sname] = {
                        "name": sname,
                        "category": str(item.get("category") or "Technical"),
                        "count": max(1, len(repos_cited)),
                        "repos": repos_cited,
                        "evidence_detail": ev_detail or None,
                    }
        except Exception as exc:
            logger.warning("LLM semantic GitHub audit skipped: %s", exc)

    # 5. Build evidence detail strings per skill
    def _build_evidence_detail(skill_name: str, info: Dict[str, Any]) -> str:
        if info.get("evidence_detail"):
            return info["evidence_detail"]
        repos = info.get("repos", [])
        count = info.get("count", 1)
        if repos:
            repo_list = ", ".join(f"`{r}`" for r in repos)
            return (
                f"Found in {count} reference(s) across your repos: {repo_list}. "
                f"Detected in dependency manifests, source imports, or repo metadata via GitHub tree scan."
            )
        return (
            f"Detected {count} reference(s) across repo topics, descriptions, and dependency files via GitHub API scan."
        )

    # Language skills from actual repo primary languages
    detected_skills = [
        {
            "name": lang,
            "level": "advanced" if count >= 3 else "intermediate",
            "category": "Languages",
            "verified": True,
            "source": "github",
            "evidence_detail": f"Primary language in {count} of your GitHub repositories (GitHub API language detection).",
        }
        for lang, count in sorted(language_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    lang_names_lower = {lang.lower() for lang in language_counts}

    # Framework/lib/AI/DB/DevOps/custom skills from deep code + semantic audit
    for skill_name, info in skill_hit_map.items():
        if skill_name.lower() in lang_names_lower:
            for s in detected_skills:
                if s["name"].lower() == skill_name.lower():
                    s["evidence_detail"] = _build_evidence_detail(skill_name, info)
            continue
        detected_skills.append({
            "name": info["name"],
            "level": "advanced" if info["count"] >= 4 else "intermediate",
            "category": info["category"],
            "verified": True,
            "source": "github",
            "evidence_detail": _build_evidence_detail(skill_name, info),
        })

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
        "code_audit": {
            "scanned_repos": [r["name"] for r in top_repos],
            "files_scanned_count": files_scanned_count,
            "skills_detected_from_code": len(skill_hit_map),
        },
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


# ------------------------------------------------------------------------------
# LIVE AUTO JOBFINDER & OUTREACH EMAIL GENERATOR
# ------------------------------------------------------------------------------

EMAIL_REGEX = re.compile(r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b")
IGNORED_EMAIL_DOMAINS = {"example.com", "sentry.io", "wixpress.com", "schema.org", "w3.org"}


def _clean_html(raw_html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw_html or "")
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _extract_public_email(text: str) -> Optional[str]:
    if not text:
        return None
    for match in EMAIL_REGEX.findall(text):
        lower = match.lower()
        domain = lower.split("@")[-1]
        if (
            domain not in IGNORED_EMAIL_DOMAINS
            and not lower.startswith(("noreply", "no-reply", "donotreply"))
            and not lower.endswith((".png", ".jpg", ".jpeg", ".svg", ".webp"))
        ):
            return match
    return None


def _is_internship(title: str, tags: List[str], job_type: str = "") -> bool:
    blob = f"{title} {' '.join(tags)} {job_type}".lower()
    return any(k in blob for k in ("intern", "internship", "trainee", "apprentice", "working student", "werkstudent"))


def _score_job_match(
    title: str,
    description: str,
    tags: List[str],
    user_skills: List[str],
    target_role: str,
) -> tuple[int, List[str], List[str]]:
    blob = f"{title} {' '.join(tags)} {description}".lower()
    matched: List[str] = []
    for sk in user_skills:
        if re.search(rf"(?<![a-zA-Z0-9]){re.escape(sk.lower())}(?![a-zA-Z0-9])", blob):
            matched.append(sk)

    # Extract notable required skills from taxonomy present in job description
    job_skills_found = [
        name for name, _, pattern in SKILL_TAXONOMY if re.search(pattern, blob, flags=re.IGNORECASE)
    ]
    user_set = {s.lower() for s in user_skills}
    missing = [js for js in job_skills_found if js.lower() not in user_set][:5]

    role_tokens = [t for t in re.split(r"[\s/,&-]+", target_role.lower()) if len(t) >= 2]
    role_hits = sum(1 for t in role_tokens if t in title.lower())

    skill_ratio = (len(matched) / max(1, min(len(job_skills_found), 6))) * 65
    role_bonus = min(role_hits * 15, 30)
    base = 15 if (matched or role_hits) else 5
    score = int(min(98, max(10, round(base + skill_ratio + role_bonus))))
    return score, matched[:8], missing


class JobDiscoverRequest(BaseModel):
    target_role: str = Field(default="Software Engineer")
    skills: List[Dict[str, Any]] = Field(default_factory=list)
    category: str = Field(default="all", description="'all', 'job', or 'internship'")
    search: str = Field(default="")
    limit: int = Field(default=30, ge=1, le=60)


class OutreachDraftRequest(BaseModel):
    job_title: str
    company: str
    contact_email: Optional[str] = None
    job_description: str = ""
    student_name: str = "Engineering Candidate"
    target_role: str = ""
    skills: List[str] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)


async def _fetch_remotive(client: httpx.AsyncClient, search_term: str) -> List[Dict[str, Any]]:
    try:
        url = "https://remotive.com/api/remote-jobs?limit=25"
        if search_term:
            url += f"&search={search_term}"
        resp = await client.get(url, headers={"User-Agent": "CareerPilot-JobFinder/1.0"})
        if resp.status_code != 200:
            return []
        jobs = resp.json().get("jobs", [])
        results = []
        for j in jobs:
            desc = _clean_html(j.get("description", ""))
            tags = j.get("tags") or []
            title = j.get("title", "")
            results.append(
                {
                    "id": f"remotive-{j.get('id')}",
                    "title": title,
                    "company": j.get("company_name", "Unknown"),
                    "location": j.get("candidate_required_location") or "Remote",
                    "remote": True,
                    "job_type": "internship" if _is_internship(title, tags, j.get("job_type", "")) else "job",
                    "url": j.get("url"),
                    "published_at": j.get("publication_date"),
                    "salary": j.get("salary") or "",
                    "tags": tags[:6],
                    "contact_email": _extract_public_email(desc),
                    "description_snippet": desc[:320],
                    "source": "Remotive",
                }
            )
        return results
    except Exception as exc:
        logger.warning("Remotive fetch failed: %s", exc)
        return []


async def _fetch_arbeitnow(client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    try:
        resp = await client.get(
            "https://www.arbeitnow.com/api/job-board-api",
            headers={"User-Agent": "CareerPilot-JobFinder/1.0"},
        )
        if resp.status_code != 200:
            return []
        jobs = resp.json().get("data", [])[:60]
        results = []
        for j in jobs:
            desc = _clean_html(j.get("description", ""))
            tags = j.get("tags") or []
            title = j.get("title", "")
            job_types = " ".join(j.get("job_types") or [])
            results.append(
                {
                    "id": f"arbeitnow-{j.get('slug')}",
                    "title": title,
                    "company": j.get("company_name", "Unknown"),
                    "location": j.get("location") or ("Remote" if j.get("remote") else "Global"),
                    "remote": bool(j.get("remote", False)),
                    "job_type": "internship" if _is_internship(title, tags, job_types) else "job",
                    "url": j.get("url"),
                    "published_at": str(j.get("created_at") or ""),
                    "salary": "",
                    "tags": tags[:6],
                    "contact_email": _extract_public_email(desc),
                    "description_snippet": desc[:320],
                    "source": "Arbeitnow",
                }
            )
        return results
    except Exception as exc:
        logger.warning("Arbeitnow fetch failed: %s", exc)
        return []


async def _fetch_remoteok(client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    try:
        resp = await client.get(
            "https://remoteok.com/api",
            headers={"User-Agent": "CareerPilot-JobFinder/1.0"},
        )
        if resp.status_code != 200:
            return []
        raw = resp.json()
        jobs = [item for item in raw if isinstance(item, dict) and item.get("position")][:40]
        results = []
        for j in jobs:
            desc = _clean_html(j.get("description", ""))
            tags = j.get("tags") or []
            title = j.get("position", "")
            salary_min = j.get("salary_min")
            salary_max = j.get("salary_max")
            salary = f"${salary_min:,} - ${salary_max:,}" if salary_min and salary_max else ""
            results.append(
                {
                    "id": f"remoteok-{j.get('id')}",
                    "title": title,
                    "company": j.get("company", "Unknown"),
                    "location": j.get("location") or "Remote",
                    "remote": True,
                    "job_type": "internship" if _is_internship(title, tags) else "job",
                    "url": j.get("apply_url") or j.get("url"),
                    "published_at": j.get("date"),
                    "salary": salary,
                    "tags": tags[:6],
                    "contact_email": _extract_public_email(desc),
                    "description_snippet": desc[:320],
                    "source": "RemoteOK",
                }
            )
        return results
    except Exception as exc:
        logger.warning("RemoteOK fetch failed: %s", exc)
        return []


@router.post(
    "/api/v1/orchestrator/integrations/jobs/discover",
    summary="Actively fetch live jobs & internships from Remotive, Arbeitnow, and RemoteOK",
)
@router.post(
    "/api/v1/integrations/jobs/discover",
    summary="Actively fetch live jobs & internships (alias)",
)
async def discover_live_jobs(request: JobDiscoverRequest) -> Dict[str, Any]:
    """Aggregate live jobs and internships from public APIs, extract any public contact emails,
    and rank them against the student's actual profile skills and target role.
    """
    user_skills = [str(s.get("name", "")).strip() for s in request.skills if s.get("name")]
    search_q = request.search.strip()

    async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
        remotive_res, arbeitnow_res, remoteok_res = await asyncio.gather(
            _fetch_remotive(client, search_q or ""),
            _fetch_arbeitnow(client),
            _fetch_remoteok(client),
        )

    combined = remotive_res + arbeitnow_res + remoteok_res

    filtered: List[Dict[str, Any]] = []
    for item in combined:
        if request.category in ("job", "internship") and item["job_type"] != request.category:
            continue
        if search_q:
            haystack = f"{item['title']} {item['company']} {' '.join(item['tags'])} {item['description_snippet']}".lower()
            if not all(tok in haystack for tok in search_q.lower().split()):
                continue

        score, matched, missing = _score_job_match(
            item["title"],
            item["description_snippet"],
            item["tags"],
            user_skills,
            request.target_role,
        )
        item["match_score"] = score
        item["matched_skills"] = matched
        item["missing_skills"] = missing
        filtered.append(item)

    filtered.sort(key=lambda x: (x["match_score"], bool(x["contact_email"])), reverse=True)
    final_list = filtered[: request.limit]

    return {
        "total_fetched": len(combined),
        "returned_count": len(final_list),
        "emails_found_count": sum(1 for x in final_list if x.get("contact_email")),
        "sources": ["Remotive", "Arbeitnow", "RemoteOK"],
        "jobs": final_list,
    }


@router.post(
    "/api/v1/orchestrator/integrations/jobs/outreach",
    summary="Generate personalized AI cold email / application draft for a job",
)
@router.post(
    "/api/v1/integrations/jobs/outreach",
    summary="Generate personalized AI cold email draft (alias)",
)
async def generate_job_outreach(request: OutreachDraftRequest) -> Dict[str, Any]:
    """Generate a tailored cold email / outreach draft grounded in the student's real skills and projects."""
    skills_str = ", ".join(request.skills[:10]) if request.skills else "software engineering"
    proj_names = [p.get("title") for p in request.projects[:2] if p.get("title")]
    proj_str = ", ".join(proj_names) if proj_names else "production engineering projects"

    llm = get_llm_service()
    if llm._get_llm() is not None:
        try:
            prompt = (
                f"Write a concise, high-impact cold outreach email from {request.student_name} "
                f"applying for '{request.job_title}' at '{request.company}'.\n"
                f"Candidate Skills: {skills_str}\n"
                f"Candidate Projects: {proj_str}\n"
                f"Job Context: {request.job_description[:800]}\n\n"
                "Keep it under 160 words, professional, specific, and free of fluff. "
                'Return ONLY valid JSON: {"subject": str, "body": str}.'
            )
            parsed = await llm.generate_json(
                system_prompt="You are a technical career coach writing concise, authentic job outreach emails. Return only valid JSON.",
                user_prompt=prompt,
                fallback_data={},
            )
            if isinstance(parsed, dict) and parsed.get("subject") and parsed.get("body"):
                return {
                    "to": request.contact_email or "",
                    "subject": parsed["subject"],
                    "body": parsed["body"],
                    "source": "live_groq_llm",
                }
        except Exception as exc:
            logger.warning("LLM outreach generation failed (%s); using structured template.", exc)

    subject = f"Application for {request.job_title} — {request.student_name}"
    body = (
        f"Hi {request.company} Hiring Team,\n\n"
        f"I'm {request.student_name}, an engineering candidate specializing in {skills_str}. "
        f"I recently came across your opening for {request.job_title} and wanted to reach out directly.\n\n"
        f"In my recent work ({proj_str}), I have built and shipped systems aligned with what your team is building. "
        f"I'd welcome the chance to share my work and discuss how I can contribute.\n\n"
        f"Best regards,\n{request.student_name}"
    )
    return {
        "to": request.contact_email or "",
        "subject": subject,
        "body": body,
        "source": "structured_template",
    }
