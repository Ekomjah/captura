# Captura

Screenshots are dead data. Generic filenames, no searchability, no structure. Captura fixes that by turning a raw image upload into a searchable, multi-format cloud asset.

**Targeted at:** QA engineers and developers who need to quickly reference error logs and UI states.

---

## What It Does

Upload a screenshot → Captura stores the original, generates optimized variants (WebP, JPEG), extracts any text via OCR, and makes it all searchable and downloadable via signed URLs.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/v1/upload` | Upload an image. Triggers the full processing pipeline. |
| `GET` | `/v1/history` | Paginated list of uploads with signed download URLs. |
| `GET` | `/v1/search` | Full-text search over OCR-extracted image content. |

All images are served via **S3 presigned URLs** that expire after 15 minutes. The bucket has no public access.

---

## System Design

### Networking — FastAPI
Async RESTful API. Handles concurrent uploads without blocking. Pydantic models enforce strict request/response schemas.

### Compute — Pillow + PyTesseract
- `Pillow` transcodes uploads into WebP and JPEG variants in memory (no disk writes).
- `PyTesseract` extracts text from the image for OCR indexing.
- Current implementation is synchronous. Post-MVP: CPU-bound tasks move to a background worker.

### Storage — AWS S3
```
uploads/
├── raw/{uuid}                  ← original source of truth
└── processed/{uuid}/{format}   ← optimized variants
```

### Database — PostgreSQL
```
Upload  → id, s3_key, ocr_text (GIN indexed), created_at
Variant → screenshot_id (FK), format, file_size, s3_key
```
Full-text search runs against the GIN index on `ocr_text` for fast OCR queries.

---

## Stack

| Layer | Tech |
|---|---|
| API | FastAPI |
| Validation | Pydantic |
| Image Processing | Pillow (PIL) |
| OCR | PyTesseract |
| Storage | AWS S3 |
| Database | PostgreSQL |

---

## Running Locally

```bash
# install dependencies
pip install fastapi uvicorn pillow pytesseract python-multipart psycopg2 boto3

# start the server
uvicorn main:app --reload
```

API docs available at `http://localhost:8000/docs`.

---

## User Stories

| # | Story |
|---|---|
| US-1 | Upload an image and have it safely stored in S3. |
| US-2 | Get an auto-generated WebP version to save bandwidth. |
| US-3 | Search for text inside images to find specific screenshots. |
| US-4 | Download optimized variants (JPEG/WebP) for different use cases. |
