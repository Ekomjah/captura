# Deploy Skill

## Overview
- **Backend** — containerized and deployed to **Render** via a deploy hook, with
  the image built and pushed by GitHub Actions.
- **Frontend** — deployed on **Vercel** via its git integration (no workflow file;
  preview deploys per branch, `@vercel/analytics` + speed-insights wired in).
- Branch model: `staging` is integration, `main` is production. PRs into either
  run CI (`.github/workflows/ci.yml`).

## Backend pipelines
Both trigger only on pushes that touch `app/api/**` (or the workflow file itself).

### Staging — `.github/workflows/deploy-backend-staging.yml`
- Trigger: push to `staging`.
- Builds `app/api` and pushes to **GHCR** (`ghcr.io/<repo>/captura-api`), tags
  `staging-latest` and `staging-<short-sha>`, with registry-cache layers.
- Then `deploy` job (GitHub environment `staging`) curls
  `secrets.RENDER_DEPLOY_HOOK_STAGING`.

### Production — `.github/workflows/deploy-backend-prod.yml`
- Trigger: push to `main`.
- Builds `app/api` and pushes to **Docker Hub**
  (`<user>/captura-api:latest` and `:<sha>`).
- Then curls `secrets.RENDER_DEPLOY_HOOK`.

## Image (`app/api/Dockerfile`)
- `python:3.11-slim`, installs `tesseract-ocr` + `tesseract-ocr-eng` (OCR needs it),
  installs `uv`, `uv sync --frozen --no-dev`.
- Container start command runs migrations + seed + server:
  `uv run alembic upgrade head && uv run python seed/seed.py && uv run uvicorn main:app --host 0.0.0.0 --port 8000`.
- So a fresh deploy auto-migrates the database; no manual migration step on Render.

## Required secrets / config
- Staging: `RENDER_DEPLOY_HOOK_STAGING`, `GITHUB_TOKEN` (auto, for GHCR).
- Production: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `RENDER_DEPLOY_HOOK`.
- Render service env (matches `app/api/.env.example`): `DATABASE_URL`,
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`,
  `S3_BUCKET_NAME`, `ALLOWED_ORIGINS` (+ optional `ALLOWED_ORIGIN_REGEX` for
  Vercel preview URLs), `ENVIRONMENT`.
- Frontend (Vercel): `VITE_API_BASE_URL` pointing at the deployed API.

## Infra
- `infra/terraform/s3/` provisions the private S3 bucket + IAM. The bucket has no
  public access; assets are served only via presigned URLs (15 min expiry).

## To ship a change
1. Merge into `staging` → staging image builds + Render staging redeploys.
2. Verify staging, then merge `staging` → `main` → prod image builds + Render
   prod redeploys.
3. Backend deploys only fire when `app/api/**` changed; frontend redeploys on any
   push Vercel sees for the branch.
