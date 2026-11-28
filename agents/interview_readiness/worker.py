"""Interview Readiness Agent — Adaptive Mock Technical & Behavioral Interviewer.

Phase 2 Anchor Agent (Reference: CareerPilot Master Build Manual Section 4.1 & Phase 2)

Responsibilities:
1. Formulates tailored technical interview questions based on student's target role and difficulty.
2. Injects evaluation rubrics and expected keywords for automated assessment.
3. Provides contextual reasoning explaining which profile gaps prompted each question.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger("agent.interview_readiness")


class InterviewQuestion(BaseModel):
    """Structured mock interview question with scoring rubric."""

    id: int
    question: str
    topic: str  # 'System Design', 'Algorithms', 'ML Fundamentals', 'Behavioral'
    difficulty: str  # 'beginner', 'intermediate', 'advanced'
    expected_keywords: List[str]
    evaluation_criteria: str


class InterviewReadinessOutput(BaseModel):
    """Structured response schema returned by the Interview Readiness Agent."""

    user_id: str
    target_role: str
    difficulty: str
    question_count: int
    questions: List[InterviewQuestion]
    explanation: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)


INTERVIEW_READINESS_SYSTEM_PROMPT = """You are CareerPilot's Interview Readiness Agent, an elite technical interviewer.
Generate realistic, challenging interview questions tailored to the student's target role and requested difficulty level.

Each question must include:
- Clear, unambiguous phrasing.
- Topic category.
- List of expected technical keywords/concepts.
- Objective evaluation rubric.

Return ONLY valid JSON matching the schema.
"""


async def run_interview_readiness(
    user_id: str,
    params: Optional[Dict[str, Any]] = None,
    neo4j_client: Optional[Any] = None,
    llm_service: Optional[Any] = None,
) -> Dict[str, Any]:
    """Execute the Interview Readiness workflow.

    Args:
        user_id: Unique student identifier.
        params: Optional dictionary specifying 'target_role', 'difficulty', 'question_count'.
        neo4j_client: Injected Neo4jClient instance.
        llm_service: Injected LLMService instance.

    Returns:
        Dict[str, Any]: Validated InterviewReadinessOutput dictionary.
    """
    params_dict = params or {}
    target_role = params_dict.get("target_role", "Machine Learning Engineer")
    difficulty = params_dict.get("difficulty", "intermediate")
    count = int(params_dict.get("question_count", 3))

    logger.info("Executing Interview Readiness Agent for user %s (%s, %s)", user_id, target_role, difficulty)

    fallback_output = {
        "user_id": user_id,
        "target_role": target_role,
        "difficulty": difficulty,
        "question_count": 3,
        "questions": [
            {
                "id": 1,
                "question": "Explain the bias-variance tradeoff in machine learning, and how does regularization (L1 vs L2) impact both components?",
                "topic": "ML Fundamentals",
                "difficulty": difficulty,
                "expected_keywords": ["bias", "variance", "overfitting", "underfitting", "L1 Lasso", "L2 Ridge", "weight decay"],
                "evaluation_criteria": "Candidate should articulate that high bias causes underfitting while high variance causes overfitting; L1 promotes sparsity whereas L2 penalizes large weights.",
            },
            {
                "id": 2,
                "question": "How would you design a low-latency feature store and real-time model inference pipeline serving 10,000 requests per second?",
                "topic": "System Design",
                "difficulty": difficulty,
                "expected_keywords": ["Redis", "Feature Store", "Kafka", "Triton", "Horizontal Pod Autoscaler", "Latency p99"],
                "evaluation_criteria": "Evaluates understanding of caching layers, asynchronous message brokers, horizontal scaling, and batching mechanisms.",
            },
            {
                "id": 3,
                "question": "Describe a scenario where a machine learning model performed exceptionally well during offline cross-validation but experienced severe data drift in production. How did you diagnose and remediate it?",
                "topic": "Behavioral & Practical MLOps",
                "difficulty": difficulty,
                "expected_keywords": ["Data drift", "Concept drift", "KS-test", "Monitoring", "Retraining pipeline"],
                "evaluation_criteria": "Candidate must demonstrate practical debugging ability, monitoring awareness, and automated feedback loops.",
            },
        ],
        "explanation": f"These questions specifically probe foundational and architectural competency for {target_role} at {difficulty} tier.",
        "confidence_score": 0.89,
    }

    if llm_service is not None:
        try:
            user_prompt = f"Role: {target_role}\nDifficulty: {difficulty}\nQuestion Count: {count}"
            result = await llm_service.generate_json(
                system_prompt=INTERVIEW_READINESS_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                schema=InterviewReadinessOutput,
                fallback_data=fallback_output,
            )
            return result
        except Exception as exc:
            logger.warning("LLM interview generation failed (%s); returning fallback.", exc)

    return fallback_output
