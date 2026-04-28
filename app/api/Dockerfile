FROM python:3.12-slim

WORKDIR /app

# Install system deps Pillow needs
RUN apt-get update && apt-get install -y \
    libwebp-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first (better layer caching)
COPY pyproject.toml uv.lock ./

# Install dependencies using uv (no venv, install straight to system)
RUN uv sync --frozen --no-dev

COPY ./app ./app

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]