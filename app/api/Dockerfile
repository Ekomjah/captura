FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*
    
# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /api

ENV UV_PROJECT_ENVIRONMENT=/app/.venv-docker
ENV PYTHONPATH=/api

# Copy dependency files first (better layer caching)
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev
# Copy app
COPY . .
CMD ["sh", "-c", "uv run alembic upgrade head && uv run python seed/seed.py && uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]

