import logging
from datetime import datetime, timezone
from typing import Annotated
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, File, Query, UploadFile
from fastapi.responses import JSONResponse
from app.api.schema.upload import UploadResponse, VariantFormat
from pydantic import BaseModel, Field
from services.img_service import ImageConversionError, convert_to_webp
from services.s3_service import map_s3_exception, upload_raw_file, upload_variant_file

app = FastAPI(title="Captura API", version="0.1.0")
load_dotenv()
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    force=True,  # important with uvicorn
)


class VariantMeta(BaseModel):
    asset_id: str
    file_name: str
    file_bytes: int = Field(..., description="Size in Bytes")
    content_type: str
    format: VariantFormat


class AssetSummary(BaseModel):
    """image obj for an image upload"""

    id: str
    created_at: datetime
    thumbnail_url: str
    ocr_snippet: str | None = None

    variants: list[VariantMeta]


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


def _content_type_for_format(fmt: VariantFormat) -> str:
    return {
        VariantFormat.webp: "image/webp",
        VariantFormat.jpeg: "image/jpeg",
        VariantFormat.png: "image/png",
    }[fmt]


def _fake_variant(fmt: VariantFormat) -> VariantMeta:
    return VariantMeta(
        asset_id="",
        file_name=f"sample.{fmt.value}",
        file_bytes=123456,
        content_type=_content_type_for_format(fmt),
        format=fmt,
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

        file_content = await file.read()
        content_type = file.content_type or "application/octet-stream"
        upload_result = upload_raw_file(
            filename=file.filename,
            file_bytes=file_content,
            content_type=content_type,
        )

        try:
            webp_bytes = convert_to_webp(file_content)
            webp_filename = file.filename.rsplit(".", 1)[0] + ".webp"
            upload_variant = upload_variant_file(
                asset_id=upload_result.asset_id,
                filename=webp_filename,
                file_bytes=webp_bytes,
                content_type=_content_type_for_format(VariantFormat.webp),
                format=VariantFormat.webp,
            )
        except ImageConversionError:
            raise UploadException(
                error="ImageConversionError",
                detail="Could not convert image to WebP",
                status_code=500,
            )

        logger.info(
            {
                "event": "upload_complete",
                "asset_id": upload_result.asset_id,
                "bucket": upload_result.bucket,
                "raw_s3_key": upload_result.s3_key,
                "variant_s3_key": upload_variant.s3_key,
                "variant_format": upload_variant.format.value,
                "filename": file.filename,
            }
        )

        return UploadResponse(
            asset_id=upload_result.asset_id,
            bucket=upload_result.bucket,
            s3_key=upload_result.s3_key,
            content_type=upload_result.content_type,
            size_bytes=upload_result.size_bytes,
            status="uploaded",
            variants=[upload_variant],
        )
    except UploadException:
        raise
    except Exception as exc:
        error, detail, status_code = map_s3_exception(exc)
        raise UploadException(
            error=error,
            detail=detail,
            status_code=status_code,
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
