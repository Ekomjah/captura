# CLAUDE.md

Captura turns a raw screenshot upload into a searchable, multi-format cloud asset. Upload an image → the original is stored in S3, an optimized WebP variant is generated in memory, text is extracted via OCR, and everything becomes searchable and downloadable through signed URLs.

- Always check available plugins and use whichever are relevant to the current task.

## Repo Layout

pnpm + uv monorepo. Two apps under `app/`, infra under `infra/`.

```
app/
  api/        FastAPI backend (Python 3.10+, uv)
  frontend/   React 19 + Vite + TS (pnpm workspace package "frontend")
infra/
  terraform/s3/   S3 bucket + IAM (private bucket, presigned URL access)
```

- `pnpm-workspace.yaml` only registers `app/frontend`. The backend is managed by `uv` in `app/api`, NOT by pnpm.
- Root `package.json` holds husky/commitlint and `dev:*` / `precommit:*` shortcuts. `Makefile` wraps the same commands.

## Commands

Run from repo root unless noted.

```bash
make install        # pnpm install + (cd app/api && uv sync)
make dev-web        # Vite dev server, --host
make dev-api        # uvicorn main:app --reload (from app/api)
make lint           # eslint (frontend) + ruff (app/api)
make test           # pytest from app/api
make build          # production frontend build
```

Direct equivalents: `pnpm dev:web`, `pnpm dev:api`, `pnpm --filter frontend lint`, and (in `app/api`) `uv run pytest`, `uv run ruff check .`.

## Backend (`app/api`)

FastAPI app in `main.py`. Layered: `services/` (external IO) → `repo/` (DB writes/reads) → `schema/` (Pydantic) → `models/` (SQLAlchemy + error mapping).

Endpoints (all under `/v1`, tagged `assets` / `search`):

| Method | Path | Notes |
|---|---|---|
| POST | `/v1/upload` | multipart; runs the full pipeline, returns `UploadResponse` |
| GET | `/v1/history` | paginated (`page`, `page_size` 1–100), signed URLs |
| GET | `/v1/search` | full-text over OCR (`q` required), paginated |
| DELETE | `/v1/delete/{asset_id}` | deletes S3 first, then DB |

Upload pipeline in `upload_file`: read bytes → `upload_raw_file` (S3 `raw/`) → `convert_to_webp` + `upload_variant_file` (S3 `processed/`) → `extract_ocr_text` (pytesseract, run in executor) → persist via `store_asset` + `store_asset_variant`. OCR failures are non-fatal (`ocr_status` = `pending`/`done`/`failed`); a WebP conversion failure aborts with 500.

Key conventions:
- Errors flow through the `UploadException` handler. Map raw exceptions with `map_s3_exception` (S3) or `_map_db_exception` (DB) — don't leak stack traces to clients.
- Settings: `core/config.py` (`get_settings()`, lru-cached). Only runtime values (env, CORS) live there; S3 and DB credentials are read where they're used (`services/s3_service.py`, `db/session.py`) so `main` imports cleanly with no secrets — tests depend on this.
- `docs_url` is disabled in production.
- Migrations: Alembic in `app/api/alembic/`. `alembic revision --autogenerate -m "..."`, check the generated `upgrade()`, then `alembic upgrade head`.

Local backend setup (half-docker + uv):
```bash
cd app/api
cp .env.example .env          # fill AWS, DB, ALLOWED_ORIGINS
uv sync
docker compose up -d          # postgres on host :5434, healthcheck-gated
alembic upgrade head
uv run uvicorn main:app --reload
```
Docs at `http://localhost:8000/docs`.

## Frontend (`app/frontend`)

React 19, Vite 8, TypeScript, Tailwind v4, shadcn/Radix UI, React Query, React Router v7. Path alias `@` → `src`.

Data flow (see `flow.md` for the full map):
- Entry `main.tsx` wraps `QueryClientProvider` → `ThemeProvider` → `RouterProvider`.
- Routes: `/` → HistoryPage, `/search` → SearchPage, both inside `AppShell`.
- API layer in `lib/api/`: `client.ts` (axios, base `VITE_API_BASE_URL || /v1`, 10s timeout), `capturapi.ts` (`fetchAssets`, `uploadAsset`, `searchAssets`).
- Server state via React Query hooks in `hooks/queries` and `hooks/mutations`. Upload mutation invalidates the history cache on success.
- Shared API types in `lib/types/api.ts` — keep these in sync with backend `schema/` responses.
- Feature components under `src/features/`, primitives under `src/components/ui/` (shadcn-generated).

Dev proxy: Vite forwards `/v1` → `http://localhost:8000`, so leave `VITE_API_BASE_URL` empty when running `make dev-api` locally.

## Conventions & CI

- Conventional commits enforced by commitlint + husky (`commitlint.config.js`).
- Pre-commit (`pnpm precommit:all`): frontend eslint, backend ruff, tests.
- CI (`.github/workflows/ci.yml`) on PRs to `staging`/`main`: backend `uv run pytest`, frontend type-check + build. `staging` is the integration branch.
- Lint/format: ruff (backend), eslint (frontend). Run `make lint` before pushing.
