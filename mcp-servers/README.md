# MCP Servers (Tool / Integration Layer)

Owner: Arik (infrastructure), with requirements from Anindya & Arik

Each external data source is an MCP server exposing:
- GET /health
- POST /invoke  ({tool, params} -> {status, data, metadata})
- GET /tools

Planned:
- `github-mcp/` — repos, commits, contributions
- `job-board-mcp/` — job postings by role/location
