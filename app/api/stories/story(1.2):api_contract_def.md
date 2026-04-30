## Context

Captura’s frontend MVP needs stable backend contracts for four UI flows: upload, history, search, and download variants.

The backend is currently minimal (root route only), so this story should focus on **defining clean API contracts** with FastAPI + Pydantic, not implementing full backend infrastructure.

This story directly supports:

- Upload progress and success feedback
- History gallery cards with format badges and OCR snippet
- OCR search results with match context
- Detail modal download actions for `webp` and `jpeg` (plus original metadata)

## What to Expect

### **Scope (MVP, in-scope)**

- Define Pydantic models for:
    - upload response
    - search response (paginated)
    - history response (paginated)
    - variant metadata (`format`, `file_size`, `download_url`, `expires_at`)
    - standardised error response
- Define route signatures and response models for:
    - `POST /v1/upload`
    - `GET /v1/history`
    - `GET /v1/search`
- Add status codes and OpenAPI-friendly typing/docstrings.
- Use mock/in-memory placeholder data where infra is not ready, so the frontend can integrate immediately.

### **Out of Scope (for this story)**

- Real S3 upload/presigned URL logic
- OCR extraction execution
- Image transcoding execution
- PostgreSQL storage/full-text implementation
- Background workers/queues
- Auth/roles/permissions

### **Definition of Done**

- Swagger/OpenAPI clearly documents all three endpoints.
- Frontend can consume payloads without guessing field names. (This does not mean creating UI. Reviewer will test API with `curl` ).
- Field names are stable and aligned to UI needs. Sample below is flexible.
- Story remains contract-only (no infra drift!).

#### Sample Starter for Captura’s API Contract

```python
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import List, Optional
from uuid import uuid4
from fastapi import FastAPI, File, Query, UploadFile
from pydantic import BaseModel, Field

app = FastAPI(title="Captura API", version="0.1.0")

class VariantFormat(str, Enum):
	webp = "webp"
	jpeg = "jpeg"
	png = "png"
	
class VariantMeta(BaseModel):
	format: VariantFormat
	file_size: int = Field(..., description="Bytes")
	download_url: str
	expires_at: datetime
	
class AssetSummary(BaseModel):
	id: str
	created_at: datetime
	thumbnail_url: str
	ocr_snippet: Optional[str] = None
	variants: List[VariantMeta]
	
class UploadResponse(BaseModel):
	id: str
	status: str = Field(..., examples=["uploaded", "processing"])
	message: str
	asset: AssetSummary
	
class PaginatedAssetsResponse(BaseModel):
	items: List[AssetSummary]
	page: int
	page_size: int
	total: int
	
class SearchHit(BaseModel):
	asset: AssetSummary
	matched_text: str
	match_context: Optional[str] = None
	
class PaginatedSearchResponse(BaseModel):
	items: List[SearchHit]
	page: int
	page_size: int
	total: int
	query: str
	
class ErrorResponse(BaseModel):
	error: str
	detail: str
	
def _fake_variant(fmt: VariantFormat) -> VariantMeta:
	now = datetime.now(timezone.utc)
	return VariantMeta(
		format=fmt,
		file_size=123456,
		download_url=f"[https://example.com/download/{uuid4()}?format={fmt.value}](https://example.com/download/%7Buuid4()%7D?format=%7Bfmt.value%7D)",
		expires_at=now + timedelta(minutes=15),
	)
	
def _fake_asset() -> AssetSummary:
	now = datetime.now(timezone.utc)
	return AssetSummary(
		id=str(uuid4()),
		created_at=now,
		thumbnail_url="https://example.com/thumb/sample.webp",
		ocr_snippet="ERR_CONNECTION_RESET in settings panel",
		variants=[_fake_variant(VariantFormat.webp), _fake_variant(VariantFormat.jpeg), _fake_variant(VariantFormat.png)],
	)
	
@app.post("/v1/upload", response_model=UploadResponse, tags=["assets"])
async def upload_image(file: UploadFile = File(...)) -> UploadResponse:
	
@app.get("/v1/history", response_model=PaginatedAssetsResponse, tags=["assets"])
async def get_history(
		page: int = Query(1, ge=1),
		page_size: int = Query(20, ge=1, le=100),
) -> PaginatedAssetsResponse:
	
	
@app.get("/v1/search", response_model=PaginatedSearchResponse, tags=["search"])
async def search_assets(
	q: str = Query(..., min_length=1),
		page: int = Query(1, ge=1),
		page_size: int = Query(20, ge=1, le=100),
) -> PaginatedSearchResponse:
```

## Timeline

- **Day 1 (Planning, 30-45 min):** Align field names with frontend UI needs.
- **Day 1 (Build, 2-3 hrs):** Implement Pydantic models + three route contracts.
- **Day 1 (Validation, 45-60 min):** Verify docs and sample responses in Swagger.
- **Day 1 (Polish, 30 min):** Clean naming, add docstrings, ensure consistent optional/required fields.

## Feedback

### **For the developer**

- Keep this story contract-focused. If you are touching S3/OCR/DB internals, you are likely out of scope.
- Ask clarifying questions in this format:
    - “Is this field required for the current UI?”
    - “Do we need real data now, or mocked response shape?”
    - “Will renaming this field break frontend integration in the future?”

### **Reviewer check:**

- [x]  Check field naming stability (`created_at`, `variants`, etc.).
- [x]  Check the optional vs required correctness.
- [x]  Check consistency of error responses for frontend toast handling.
- [x]  Confirm this story did **not** drift into infra implementation.