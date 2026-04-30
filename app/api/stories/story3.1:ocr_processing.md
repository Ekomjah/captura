## Context

This story adds text extraction from uploaded images and persists OCR output so the app can support searchable screenshot content.

## What to Expect

### In Scope (MVP)

- Integrate Tesseract/PyTesseract OCR extraction step.
- Extract text from upload (or derived image where appropriate).
- Persist OCR results to Postgres in a searchable column.
- Associate OCR text with uploaded asset record.
- Expose OCR status/summary in API responses needed by history/search.

### Out of Scope

- Advanced OCR quality enhancement workflows
- Multi-language OCR packs/tuning
- Worker queue migration (keep synchronous for MVP path)
- Semantic/vector search

### Acceptance Criteria

- Uploading an image with readable text stores OCR text in DB.
- OCR text is associated with the correct asset ID.
- API responses can expose OCR snippet/status.
- OCR failure is handled without crashing request lifecycle.
- `POST /v1/upload` keeps existing Story 2.2 fields and adds OCR fields:
    - `ocr_status`: `pending | done | failed`
    - `ocr_snippet`: `string | null` (short preview for UI)

### Implementation hint (boundaries + testing)

Use clear service/repository boundaries so Story 3.1 is easy to verify:

- **`ocr_service` boundary:** pure function `extract_ocr_text(image_bytes) -> str` (raises typed OCR error).
- **`assets_repo` boundary:** DB insert/update by `asset_id` (store `ocr_text`, `ocr_status`).
- **`upload route` orchestration:** upload -> OCR attempt -> persist OCR fields -> return API payload.
- **`history/search mapping`:** expose `ocr_snippet`/`ocr_status` from persisted values.

For persistence, **SQLAlchemy is the default in this repo**, but SQLModel is acceptable if used cleanly with test isolation:

- Use test fixtures + dependency overrides (`app.dependency_overrides`) to inject a test session.
- Avoid binding production DB sessions directly in route functions.

Alignment-only table excerpt (column naming target for Story 3.1):

```sql
-- Minimal `assets` table shape for OCR persistence alignment
id          TEXT PRIMARY KEY
s3_key      TEXT NOT NULL
ocr_text    TEXT NULL
ocr_status  TEXT NOT NULL -- pending | done | failed
created_at  TIMESTAMPTZ NOT NULL
```

```python
# POST /v1/upload shape (MVP, synchronous)
# 1) upload raw image to S3 (already done in Story 2.x)
# 2) attempt OCR extraction
# 3) persist OCR fields against same asset_id
# 4) return response with OCR status/snippet fields
ocr_text, ocr_status = None, "pending"
try:
    ocr_text = extract_ocr_text(file_content)
    ocr_status = "done"
except OCRExtractionError:
    ocr_status = "failed"

repo.upsert_ocr(
    asset_id=upload_result.asset_id,
    ocr_text=ocr_text,
    ocr_status=ocr_status,
)

return ...
```

## Timeline

- **45 min:** DB model update/migration planning.
- **2 hrs:** OCR integration and persistence wiring.
- **45 min:** Verification with known-text test image.
- **30 min:** Error-state behavior and logging polish.

## Feedback

### **For the developer**

- Keep MVP objective simple: reliable extraction + persistence.

### **Reviewer check:**

- [ ]  Upload stores `ocr_text` (or `ocr_status=failed`) without crashing request flow.
- [ ]  Persisted OCR row is linked to the same `asset_id` returned by upload.
- [ ]  `history/search` payloads expose stable `ocr_snippet`/`ocr_status` fields.
- [ ]  Tests isolate DB/session with fixtures or dependency overrides (no prod DB coupling).