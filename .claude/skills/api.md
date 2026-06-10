# API Skill

## Stack
- FastAPI + SQLAlchemy + PostgreSQL, managed with `uv` (not pnpm)
- Everything lives under `app/api/`
- Endpoints are defined in `app/api/main.py` (single app, no `routes/` package)
- Pydantic schemas in `app/api/schema/` (`upload.py`, `db_schema.py`)
- DB write/read functions in `app/api/repo/`
- External IO (S3, image, OCR) in `app/api/services/`
- SQLAlchemy models + error mapping in `app/api/models/`

## Conventions
- Route handlers are `async`.
- All endpoints are versioned under `/v1` and tagged (`assets` / `search`).
- Errors are raised as `UploadException(error, detail, status_code)` and rendered
  by the registered handler as `ErrorResponse` → `{"error": "...", "detail": "..."}`.
  Do NOT return bare `{"detail": "..."}`.
- Map raw exceptions before raising — `map_s3_exception(exc)` for S3,
  `_map_db_exception(exc, action=...)` for DB. Never leak stack traces to clients.
- Every endpoint declares request and response Pydantic models plus `responses={...}`
  for error codes.
- Settings come from `core/config.get_settings()` (lru-cached). Keep S3/DB
  credentials out of `config.py` — read them at point-of-use (`services/s3_service.py`,
  `db/session.py`) so `main` imports with no secrets set (the test suite relies on this).
- CPU-bound work (OCR) runs via `loop.run_in_executor`; OCR failures are non-fatal
  (`ocr_status`: `pending` | `done` | `failed`).

## When adding a new endpoint
1. Add the schema(s) in `app/api/schema/` (request + response).
2. Add the data-access function in `app/api/repo/`.
3. Add the handler to `app/api/main.py` under `/v1`, async, with `tags`, a
   `response_model`, and error `responses`. Inject the session with
   `db: Session = Depends(get_db)`.
4. Wrap failures in `UploadException`, mapping via `map_s3_exception` /
   `_map_db_exception`.
5. If the DB shape changed: `uv run alembic revision --autogenerate -m "..."`,
   review the generated `upgrade()`, then `uv run alembic upgrade head`.

## Run / test
```bash
cd app/api
uv sync
docker compose up -d            # postgres on :5434, healthcheck-gated
uv run alembic upgrade head
uv run uvicorn main:app --reload   # docs at http://localhost:8000/docs
uv run pytest                   # contract tests in tests/
uv run ruff check .
```
