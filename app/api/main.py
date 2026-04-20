from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Annotated
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

app = FastAPI(title="Captura API", version="0.1.0")


class VariantFormat(str, Enum):
    webp = "webp"
    jpeg = "jpeg"
    png = "png"


class VariantMeta(BaseModel):
    file_size: int = Field(..., description="Size in Bytes")
    format: VariantFormat
    download_url: str
    expires_at: datetime


class AssetSummary(BaseModel):
    """image obj for an image upload"""

    id: str
    created_at: datetime
    thumbnail_url: str
    ocr_snippet: str | None = None
    variants: list[VariantMeta]


class UploadResponse(BaseModel):
    """resp model for the upload endpoint"""

    id: str
    status: str = Field(..., examples=["processing", "uploaded"])
    message: str
    asset_uploaded: AssetSummary


class PaginatedAssetsResponse(BaseModel):
    """resp model for the history endpoint"""

    images: list[AssetSummary]
    page: int = 1
    page_size: int
    total: int


class SearchHit(BaseModel):
    asset: AssetSummary
    matched_text: str
    match_context: str | None = None


class PaginatedSearchResponse(BaseModel):
    """resp for the ocr search endpoint"""

    items: list[SearchHit]
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
        download_url=f"https://example.com/download/{uuid4()}?format={fmt.value}",
        expires_at=now + timedelta(minutes=15),
    )


def _fake_asset() -> AssetSummary:
    now = datetime.now(timezone.utc)
    return AssetSummary(
        id=str(uuid4()),
        created_at=now,
        thumbnail_url="https://example.com/thumb/sample.webp",
        ocr_snippet="ERR_CONNECTION_RESET in settings panel",
        variants=[
            _fake_variant(VariantFormat.webp),
            _fake_variant(VariantFormat.jpeg),
            _fake_variant(VariantFormat.png),
        ],
    )


@app.post("/v1/upload", status_code=201, response_model=UploadResponse, tags=["assets"])
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
        print(f"Successfully received file: {file.filename}")

        return UploadResponse(
            id=str(uuid4()),
            status="uploaded",
            message="File uploaded successfully",
            asset_uploaded=_fake_asset(),
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/history", response_model=PaginatedAssetsResponse, tags=["assets"])
async def get_history(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
):
    return PaginatedAssetsResponse(
        images=[_fake_asset()],
        page=page,
        page_size=page_size,
        total=1000,
    )


@app.get("/v1/search", response_model=PaginatedSearchResponse, tags=["search"])
async def search_assets(
    q: Annotated[str, Query(min_length=1)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
):
    fake_hit = SearchHit(
        asset=_fake_asset(),
        matched_text=q,
        match_context=f"...context around '{q}'...",
    )
    return PaginatedSearchResponse(
        items=[fake_hit],
        page=page,
        page_size=page_size,
        total=500,
        query=q,
    )
