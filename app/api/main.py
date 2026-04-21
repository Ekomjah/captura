import os
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Annotated
from uuid import uuid4

import boto3
from dotenv import load_dotenv
from fastapi import FastAPI, File, Query, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(title="Captura API", version="0.1.0")
load_dotenv()


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

    asset_id: str
    bucket: str
    s3_key: str
    content_type: str
    size_bytes: int
    status: str = Field(..., examples=["processing", "uploaded"])


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


class UploadException(Exception):
    def __init__(self, error: str, detail: str, status_code: int = 500):
        self.error = error
        self.detail = detail
        self.status_code = status_code


@app.exception_handler(UploadException)
async def upload_exception_handler(request, exc: UploadException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(error=exc.error, detail=exc.detail).model_dump(),
    )


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


@app.post(
    "/v1/upload",
    status_code=201,
    response_model=UploadResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad request, e.g. no file uploaded or invalid file type",
        },
        500: {"model": ErrorResponse, "description": "Error during file upload"},
    },
    tags=["assets"],
)
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise UploadException(
                error="ValidationError",
                detail="No file uploaded",
                status_code=400,
            )

        s3_client = boto3.client(
            "s3",
            region_name=os.environ["AWS_DEFAULT_REGION"],
            aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        )
        bucket_name = os.environ["S3_BUCKET_NAME"]
        # region = os.environ["AWS_DEFAULT_REGION"]
        s3_asset_id = uuid4()
        s3_key = f"uploads/raw/{s3_asset_id}/{file.filename}"
        # public_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{s3_key}"
        file_content = await file.read()
        size = len(file_content)
        type = file.content_type

        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=file_content,
            ContentType=file.content_type,
        )

        print(f"Successfully uploaded file: {file.filename}")

        return UploadResponse(
            asset_id=str(s3_asset_id),
            bucket=bucket_name,
            s3_key=s3_key,
            content_type=str(type),
            size_bytes=size,
            status="uploaded"
        )
    except UploadException as e:
        raise e  # re-reraising the error
    except Exception as e:
        raise UploadException(
            error="InternalServerError",
            detail=str(e),
            status_code=500,
        )


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
