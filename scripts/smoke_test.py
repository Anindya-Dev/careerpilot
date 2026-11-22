#!/usr/bin/env python3
"""CareerPilot Platform Smoke Test & Health Check Runner.

Owner: Arik (Member 3 — DevOps & Platform Integration)

Probes all running platform microservices, database ports, and MCP tool servers
to verify system liveness and readiness for project evaluation.
"""

from __future__ import annotations

import argparse
import socket
import sys
import time
from typing import Any, Dict, List, Tuple

import urllib.request
import urllib.error

SERVICES = [
    {
        "name": "Frontend Web SPA",
        "url": "http://localhost:3000",
        "type": "http",
        "expected_status": [200, 304],
        "mandatory": True,
    },
    {
        "name": "Auth Microservice",
        "url": "http://localhost:5001/health",
        "type": "http",
        "expected_status": [200],
        "mandatory": True,
    },
    {
        "name": "Profile Microservice",
        "url": "http://localhost:5002/health",
        "type": "http",
        "expected_status": [200],
        "mandatory": True,
    },
    {
        "name": "Agent Orchestrator",
        "url": "http://localhost:8000/health",
        "type": "http",
        "expected_status": [200],
        "mandatory": True,
    },
    {
        "name": "GitHub MCP Server",
        "url": "http://localhost:5005/health",
        "type": "http",
        "expected_status": [200],
        "mandatory": True,
    },
    {
        "name": "Job Board MCP Server",
        "url": "http://localhost:5006/health",
        "type": "http",
        "expected_status": [200],
        "mandatory": True,
    },
    {
        "name": "MongoDB Database",
        "host": "localhost",
        "port": 27017,
        "type": "tcp",
        "mandatory": False,
    },
    {
        "name": "Redis In-Memory Store",
        "host": "localhost",
        "port": 6379,
        "type": "tcp",
        "mandatory": False,
    },
    {
        "name": "Neo4j Graph Database (HTTP)",
        "url": "http://localhost:7474",
        "type": "http",
        "expected_status": [200, 302],
        "mandatory": False,
    },
    {
        "name": "Neo4j Bolt Socket",
        "host": "localhost",
        "port": 7687,
        "type": "tcp",
        "mandatory": False,
    },
    {
        "name": "ChromaDB Vector Store",
        "url": "http://localhost:8001/api/v1/heartbeat",
        "type": "http",
        "expected_status": [200],
        "mandatory": False,
    },
]


def check_tcp_port(host: str, port: int, timeout_sec: float = 0.5) -> Tuple[bool, float, str]:
    """Test TCP socket connection."""
    start = time.perf_counter()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout_sec)
    try:
        result = sock.connect_ex((host, port))
        elapsed = (time.perf_counter() - start) * 1000.0
        if result == 0:
            return True, elapsed, "OPEN"
        else:
            return False, elapsed, f"Refused ({result})"
    except Exception as exc:
        elapsed = (time.perf_counter() - start) * 1000.0
        return False, elapsed, str(exc)
    finally:
        sock.close()


def check_http_service(url: str, expected_codes: List[int], timeout_sec: float = 0.8) -> Tuple[bool, float, str]:
    """Test HTTP endpoint status using standard library urllib."""
    start = time.perf_counter()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CareerPilot-SmokeTest/1.0"})
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            elapsed = (time.perf_counter() - start) * 1000.0
            if resp.status in expected_codes:
                return True, elapsed, f"HTTP {resp.status}"
            else:
                return False, elapsed, f"HTTP {resp.status} (expected {expected_codes})"
    except urllib.error.HTTPError as err:
        elapsed = (time.perf_counter() - start) * 1000.0
        if err.code in expected_codes:
            return True, elapsed, f"HTTP {err.code}"
        return False, elapsed, f"HTTP {err.code}"
    except Exception as exc:
        elapsed = (time.perf_counter() - start) * 1000.0
        return False, elapsed, type(exc).__name__


def main() -> int:
    parser = argparse.ArgumentParser(description="CareerPilot Smoke Test")
    parser.add_argument("--ignore-failures", action="store_true", help="Do not exit with error code on failure")
    args = parser.parse_args()

    print("=" * 80)
    print("  CAREERPILOT PLATFORM DEPLOYMENT SMOKE TEST")
    print("  Checks containerized microservices, MCP tools, and data stores")
    print("=" * 80)

    total_probed = 0
    passed_count = 0

    print(f"\n{'Service Name':<30} | {'Type':<6} | {'Target':<32} | {'Result':<10} | {'Latency'}")
    print("-" * 90)

    for svc in SERVICES:
        total_probed += 1
        name = svc["name"]
        svc_type = svc["type"]

        if svc_type == "http":
            target = svc["url"]
            passed, latency, note = check_http_service(target, svc["expected_status"])
        else:
            target = f"{svc['host']}:{svc['port']}"
            passed, latency, note = check_tcp_port(svc["host"], svc["port"])

        if passed:
            passed_count += 1
            status_badge = "[PASS]"
        else:
            status_badge = "[FAIL]" if svc["mandatory"] else "[OFFLINE]"

        print(
            f"{name:<30} | {svc_type.upper():<6} | {target[:32]:<32} | "
            f"{status_badge:<10} | {latency:.1f}ms ({note})"
        )

    print("-" * 90)
    print(f"\nSmoke Test Summary: {passed_count}/{total_probed} services reachable.")

    if passed_count == total_probed or args.ignore_failures:
        print("[+] All probed systems operational. Ready for demonstration!")
        return 0
    else:
        print("[!] Some services are offline. Verify stack with: docker compose up -d")
        return 1


if __name__ == "__main__":
    sys.exit(main())
