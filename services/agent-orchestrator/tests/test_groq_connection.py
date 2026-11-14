"""Standalone verification script for Groq LLM API.

Verifies connectivity to Groq's high-speed inference engine (LPU)
and ensures structured JSON responses can be parsed reliably.

Reference: Phase 1 Deliverable 3 (Member 2 Build Manual)
"""

from __future__ import annotations

import json
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


def verify_groq() -> None:
    """Verify Groq API connectivity and assert valid structured JSON response."""
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key or api_key == "dummy-placeholder-key":
        print("[-] NOTICE: GROQ_API_KEY is not set or contains dummy placeholder in .env.")
        print("[-] Set a valid Groq API key in services/agent-orchestrator/.env to test live inference.")
        sys.exit(0)

    try:
        from langchain_core.messages import HumanMessage, SystemMessage
        from langchain_groq import ChatGroq
    except ImportError as exc:
        print(f"[-] Missing required package: {exc}. Run pip install langchain-groq.")
        sys.exit(1)

    print("[*] Connecting to Groq LPU with model: mixtral-8x7b-32768...")
    llm = ChatGroq(
        model_name="mixtral-8x7b-32768",
        temperature=0.1,
        groq_api_key=api_key,
    )

    messages = [
        SystemMessage(
            content='You are an automated health check responder. Output ONLY valid JSON: {"status": "ok", "provider": "groq"}'
        ),
        HumanMessage(content="Ping healthcheck"),
    ]

    try:
        response = llm.invoke(messages)
        content_str = str(response.content).strip()
        parsed = json.loads(content_str)
        assert parsed.get("status") == "ok", f"Unexpected Groq response payload: {parsed}"
        print(f"[+] Server Response: {parsed}")
        print(">>> SUCCESS: Groq API connected and returning structured JSON!")
    except json.JSONDecodeError as err:
        print(f"[-] Failed to decode JSON from Groq response: {err}")
        print(f"[-] Raw output was: {response.content}")
        sys.exit(1)
    except Exception as exc:
        print(f"[-] Groq API call failed: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    verify_groq()
