# Captura — thin wrappers around pnpm (JS) and uv (Python).
# Prereqs: Node with pnpm, Python 3.10+ with uv.
#
# The Makefile does not replace package.json or pyproject.toml; it only
# documents and shortcuts commands that contributors reach for first.

.DEFAULT_GOAL := help

.PHONY: help install dev-web dev-api lint lint-frontend lint-api test build

help:
	@echo "Captura — common commands"
	@echo ""
	@echo "  make install    pnpm install + uv sync (app/api)"
	@echo "  make dev-web    Vite dev server (frontend, --host)"
	@echo "  make dev-api    FastAPI + uvicorn --reload (app/api)"
	@echo "  make lint            lint-frontend + lint-api"
	@echo "  make lint-frontend   ESLint (frontend package)"
	@echo "  make lint-api        ruff (app/api; ensures dev dep via uv add)"
	@echo "  make test       pytest from app/api"
	@echo "  make build      Production build (frontend)"
	@echo ""

install:
	pnpm install
	cd app/api && uv sync

dev-web:
	pnpm run dev:web

dev-api:
	pnpm run dev:api

lint: lint-frontend lint-api

lint-frontend:
	pnpm --filter frontend lint

lint-api:
	cd app/api && uv add --dev ruff && uv run ruff check .

test:
	cd app/api && uv run pytest

build:
	pnpm --filter frontend build
