# CareerPilot GitHub MCP Server

Model Context Protocol (MCP) tool integration server providing GitHub code evidence inspection and AST cyclomatic complexity analysis.

## Features
- **Liveness & Protocol Compliance**: Exposes standard `/health`, `/tools`, and `/invoke` endpoints.
- **Academic Viva Resilience**: Includes a built-in offline synthetic fallback simulator. If `GITHUB_TOKEN` is unset, rate-limited, or offline during presentation, realistic AST evaluation data is automatically returned without breaking the demo.
- **Tools**:
  - `get_user_repos`: Lists public repositories, primary languages, star counts, and tags.
  - `audit_code_evidence`: Evaluates code AST complexity, test coverage, and commit recency.

## Local Execution
```bash
pip install -r requirements.txt
uvicorn app.main:app --port 5005 --reload
```

## Running Tests
```bash
pytest tests/
```
