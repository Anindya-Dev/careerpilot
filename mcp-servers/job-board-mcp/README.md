# CareerPilot Job Board MCP Server

Model Context Protocol (MCP) tool integration server providing live job posting search and real-time skill demand analytics.

## Features
- **Liveness & Protocol Compliance**: Exposes standard `/health`, `/tools`, and `/invoke` endpoints conforming to MCP specifications.
- **Pre-seeded Benchmark Dataset**: Bundles 70 verified realistic tech job postings (`data/job_postings.json`) spanning AI Engineering, Full Stack, Data Science, DevOps, Backend, Cybersecurity, and Mobile.
- **Tools**:
  - `search_job_postings`: Query job postings by target role, required skills, location, or experience level.
  - `get_skill_demand_trends`: Computes top 10 in-demand skills, average market salaries, and YoY growth indices.

## Local Execution
```bash
pip install -r requirements.txt
uvicorn app.main:app --port 5006 --reload
```

## Running Tests
```bash
pytest tests/
```
