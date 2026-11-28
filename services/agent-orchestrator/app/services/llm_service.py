"""LLM Inference Service for CareerPilot Agents.

Provides a unified interface to Groq's high-speed Language Processing Unit (LPU)
with:
- Strict structured JSON response parsing.
- Pydantic schema validation.
- Low-temperature deterministic reasoning.
- Graceful offline fallback simulator for local demos, offline testing, and Groq rate limit recovery.

Engineering Rationale:
- Abstracting LLM invocation into a dedicated service prevents prompt leaks across routes,
  centralizes retry loops, and allows seamless switching between Groq, OpenAI, and HuggingFace.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional, Type, TypeVar

from pydantic import BaseModel

from app.config import get_settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMService:
    """Manages LLM API connections, structured prompting, and JSON validation."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        temperature: float = 0.1,
    ) -> None:
        """Initialize the LLM service with configuration.

        Args:
            api_key: Groq API key (defaults to settings.groq_api_key).
            model_name: Model identifier (defaults to settings.groq_model e.g. 'llama-3.3-70b-versatile').
            temperature: Sampling temperature (0.1 for high determinism).
        """
        settings = get_settings()
        self.api_key = api_key or settings.groq_api_key
        self.model_name = model_name or settings.groq_model
        self.temperature = temperature
        self._llm: Any = None

    def _get_llm(self) -> Any:
        """Lazily initialize the ChatGroq client.

        Returns:
            ChatGroq instance if available, None otherwise.
        """
        if self._llm is not None:
            return self._llm

        if not self.api_key or self.api_key.startswith("dummy"):
            logger.info("No valid GROQ_API_KEY configured; LLM service operating in simulator mode.")
            return None

        try:
            from langchain_groq import ChatGroq

            self._llm = ChatGroq(
                model_name=self.model_name,
                temperature=self.temperature,
                groq_api_key=self.api_key,
                max_retries=2,
            )
            return self._llm
        except Exception as exc:
            logger.warning("Failed to initialize ChatGroq (%s); operating in simulator mode.", exc)
            return None

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Optional[Type[T]] = None,
        fallback_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Generate structured JSON output from LLM, optionally validated against a Pydantic schema.

        Args:
            system_prompt: Guiding instructions enforcing persona and JSON format.
            user_prompt: Contextual data and query for the model.
            schema: Optional Pydantic BaseModel class for validation.
            fallback_data: Mock output to return if LLM is offline or fails.

        Returns:
            Dict[str, Any]: Parsed and validated JSON payload.
        """
        llm = self._get_llm()

        if llm is not None:
            try:
                from langchain_core.messages import HumanMessage, SystemMessage

                messages = [
                    SystemMessage(
                        content=f"{system_prompt}\nIMPORTANT: Output ONLY a valid JSON object. No Markdown code fences, no explanations outside the JSON."
                    ),
                    HumanMessage(content=user_prompt),
                ]

                # Run inference asynchronously
                response = await llm.ainvoke(messages)
                content = str(response.content).strip()

                # Clean potential markdown wrapping (e.g. ```json ... ```)
                if content.startswith("```"):
                    lines = content.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    content = "\n".join(lines).strip()

                parsed = json.loads(content)

                if schema is not None:
                    # Validate against Pydantic schema
                    validated = schema.model_validate(parsed)
                    return validated.model_dump()

                return parsed
            except Exception as exc:
                logger.warning(
                    "Live Groq LLM inference encountered an error (%s); utilizing fallback data.",
                    exc,
                )

        # Fallback path for offline development or missing API key
        if fallback_data is not None:
            if schema is not None:
                validated = schema.model_validate(fallback_data)
                return validated.model_dump()
            return fallback_data

        return {"status": "success", "source": "simulator", "output": "Model inference completed."}


_llm_service_instance: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Return the process-wide LLMService singleton instance.

    Returns:
        LLMService: Initialized client.
    """
    global _llm_service_instance
    if _llm_service_instance is None:
        _llm_service_instance = LLMService()
    return _llm_service_instance

