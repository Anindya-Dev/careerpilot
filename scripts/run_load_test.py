#!/usr/bin/env python3
"""CareerPilot Concurrency & Load Testing Benchmark Runner.

Owner: Arik (Member 3 — DevOps & Platform Integration)

Simulates 10 concurrent requests to CareerPilot Agent Orchestrator and MCP servers.
Validates Build Manual Section 6 (Phase 5) SLA thresholds:
- Target 1: 10 concurrent users supported without failure.
- Target 2: p50 latency <= 3.0s, p95 latency <= 8.0s.
- Target 3: 0% unhandled server error rate.
"""

from __future__ import annotations

import asyncio
import json
import logging
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import httpx

REPO_ROOT = Path(__file__).resolve().parents[1]
sys_path_added = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("load_test")

THRESHOLDS = {
    "concurrent_users": 10,
    "max_p50_latency_sec": 3.0,
    "max_p95_latency_sec": 8.0,
    "max_error_rate_pct": 0.0,
}


def percentile(data: List[float], p: float) -> float:
    """Compute the p-th percentile of a list of floats."""
    if not data:
        return 0.0
    sorted_data = sorted(data)
    idx = int(len(sorted_data) * (p / 100.0))
    idx = min(idx, len(sorted_data) - 1)
    return sorted_data[idx]


async def simulate_user_workflow(user_idx: int, client: httpx.AsyncClient) -> Dict[str, Any]:
    """Simulate single user multi-agent assessment request flow."""
    start_time = time.perf_counter()
    errors = []

    # 1. MCP Job Board Trends Probe
    try:
        mcp_resp = await client.post(
            "http://localhost:5006/invoke",
            json={"tool": "get_skill_demand_trends", "params": {"domain": "AI Engineer", "top_n": 5}},
            timeout=5.0,
        )
        if mcp_resp.status_code != 200:
            errors.append(f"Job Board MCP HTTP {mcp_resp.status_code}")
    except Exception as exc:
        errors.append(f"Job Board MCP: {type(exc).__name__}")

    # 2. MCP GitHub Code Evidence Probe
    try:
        gh_resp = await client.post(
            "http://localhost:5005/invoke",
            json={"tool": "audit_code_evidence", "params": {"username": f"student-{user_idx}", "repo": "careerpilot"}},
            timeout=5.0,
        )
        if gh_resp.status_code != 200:
            errors.append(f"GitHub MCP HTTP {gh_resp.status_code}")
    except Exception as exc:
        errors.append(f"GitHub MCP: {type(exc).__name__}")

    # 3. Agent Orchestrator Health / Ready Check
    try:
        orch_resp = await client.get("http://localhost:8000/health", timeout=5.0)
        if orch_resp.status_code != 200:
            errors.append(f"Orchestrator HTTP {orch_resp.status_code}")
    except Exception as exc:
        errors.append(f"Orchestrator: {type(exc).__name__}")

    elapsed = time.perf_counter() - start_time

    return {
        "user_index": user_idx,
        "latency_sec": elapsed,
        "success": len(errors) == 0,
        "errors": errors,
    }


async def main() -> None:
    print("=" * 80)
    print("  CAREERPILOT: CONCURRENT LOAD & LATENCY BENCHMARK RUNNER")
    print("  Testing 10 Concurrent Simulated User Workflows")
    print("=" * 80)

    num_concurrent = 10
    tasks = []

    async with httpx.AsyncClient() as client:
        print(f"[*] Dispatching {num_concurrent} concurrent simulated user workflows...")
        start_batch = time.perf_counter()

        for i in range(num_concurrent):
            tasks.append(simulate_user_workflow(i + 1, client))

        results = await asyncio.gather(*tasks)
        total_batch_time = time.perf_counter() - start_batch

    latencies = [r["latency_sec"] for r in results]
    successes = [r for r in results if r["success"]]
    error_count = len(results) - len(successes)
    error_rate = (error_count / len(results)) * 100.0

    p50 = percentile(latencies, 50)
    p95 = percentile(latencies, 95)
    p99 = percentile(latencies, 99)
    avg_latency = statistics.mean(latencies) if latencies else 0.0

    print("\n" + "=" * 80)
    print("  LOAD TEST BENCHMARK RESULTS")
    print("=" * 80)
    print(f"• Total Concurrent Users: {num_concurrent}")
    print(f"• Successful Workflows  : {len(successes)}/{num_concurrent}")
    print(f"• Error Rate            : {error_rate:.1f}%")
    print(f"• Batch Total Duration  : {total_batch_time:.3f}s")
    print(f"• Average Latency       : {avg_latency:.3f}s")
    print(f"• p50 System Latency    : {p50:.3f}s (Target: <= {THRESHOLDS['max_p50_latency_sec']}s)")
    print(f"• p95 System Latency    : {p95:.3f}s (Target: <= {THRESHOLDS['max_p95_latency_sec']}s)")
    print(f"• p99 System Latency    : {p99:.3f}s")

    report = {
        "benchmark_timestamp": datetime.now(timezone.utc).isoformat(),
        "concurrent_users": num_concurrent,
        "metrics": {
            "avg_latency_sec": round(avg_latency, 4),
            "p50_latency_sec": round(p50, 4),
            "p95_latency_sec": round(p95, 4),
            "p99_latency_sec": round(p99, 4),
            "error_rate_pct": round(error_rate, 2),
            "total_batch_time_sec": round(total_batch_time, 4),
        },
        "compliance": {
            "p50_pass": p50 <= THRESHOLDS["max_p50_latency_sec"],
            "p95_pass": p95 <= THRESHOLDS["max_p95_latency_sec"],
            "error_rate_pass": error_rate <= THRESHOLDS["max_error_rate_pct"],
        },
        "individual_runs": results,
    }

    out_file = REPO_ROOT / "evaluations" / "load_test_report.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\n[+] Benchmark metrics saved to: {out_file}")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
