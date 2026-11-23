# Multi-stage production build for Job Board MCP Server
FROM python:3.11-slim AS builder

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim AS runner

WORKDIR /usr/src/app

RUN addgroup --system --gid 1003 mcpgroup && \
    adduser --system --uid 1003 --ingroup mcpgroup mcpuser

COPY --from=builder /root/.local /home/mcpuser/.local

ENV PATH=/home/mcpuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=5006

COPY --chown=mcpuser:mcpgroup data/ ./data
COPY --chown=mcpuser:mcpgroup app/ ./app
COPY --chown=mcpuser:mcpgroup .env.example ./.env.example

USER mcpuser

EXPOSE 5006

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5006/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5006"]
