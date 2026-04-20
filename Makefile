# Captura — thin wrappers around pnpm (JS) and uv (Python).
# Prereqs: Node with pnpm, Python 3.10+ with uv.
#
# The Makefile does not replace package.json or pyproject.toml; it only
# documents and shortcuts commands that contributors reach for first.

.DEFAULT_GOAL := help

.PHONY: help install dev-web dev-api lint test build

help:
	@echo "Captura — common commands"
	@echo ""
	@echo "  make install    pnpm install + uv sync (app/api)"
	@echo "  make dev-web    Vite dev server (frontend, --host)"
	@echo "  make dev-api    FastAPI + uvicorn --reload (app/api)"
	@echo "  make lint       ESLint (frontend package)"
	@echo "  make test       pytest (app/api, Story 1.2 contract tests)"
	@echo "  make build      Production build (frontend)"
	@echo ""

install:
	pnpm install
	cd app/api && uv sync

dev-web:
	pnpm run dev:web

dev-api:
	pnpm run dev:api

lint:
	pnpm --filter frontend lint

test:
	uv run --project app/api pytest

build:
	pnpm --filter frontend build
