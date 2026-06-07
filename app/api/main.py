import logging
from datetime import datetime
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models.map_db_exception import _map_db_exception
from repo.delete_asset import delete_asset_from_db
from repo.get_assets import get_all_assets
from repo.search_assets import search_assets
from repo.store_asset import store_asset
from repo.store_variant import store_asset_variant
from schema.db_schema import (
    ErrorResponse,
    PaginatedAssetsResponse,
    PaginatedSearchResponse,
    UpsertRepo,
    UpsertRepoVariant,
)
from schema.upload import UploadResponse, VariantFormat
from seed.seed import cleanup_seeds
from services.db_service import get_db
from services.img_service import ImageConversionError, convert_to_webp
from services.ocr_service import OCRExtractionError, extract_ocr_text
from services.s3_service import (
    delete_asset_from_s3,
    map_s3_exception,
    upload_raw_file,
    upload_variant_file,
)
from sqlalchemy.orm import Session

app = FastAPI(title="Captura API", version="0.1.0")
load_dotenv()
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.DEBUG,
    force=True,  # important with uvicorn
)
# Ensure all loggers can propagate to root
logging.getLogger().setLevel(logging.DEBUG)
for logger_name in ["repo", "services", "models", "schema"]:
    logging.getLogger(logger_name).setLevel(logging.DEBUG)


origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://captura-frontend-kappa.vercel.app",
    "https://captura-frontend-97r0gavl7-ekomjahs-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
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
        ocr_text, ocr_status = None, "pending"
        try:
            ocr_text = await extract_ocr_text(file_content)
            # For simplicity, we just take the first 100 chars as a snippet
            ocr_snippet = ocr_text[:100] if ocr_text else None
            ocr_status = "done"
        except OCRExtractionError:
            ocr_snippet = None
            ocr_status = "failed"

        logger.info(
            {
                "event": "upload_complete",
                "asset_id": upload_result.asset_id,
                "bucket": upload_result.bucket,
                "raw_s3_key": upload_result.s3_key,
                "variant_s3_key": upload_variant.s3_key,
                "variant_format": upload_variant.format.value,
                "filename": file.filename,
                "ocr_status": ocr_status,
                "ocr_snippet": ocr_snippet,
            }
        )

        resp = UploadResponse(
            asset_id=upload_result.asset_id,
            bucket=upload_result.bucket,
            s3_key=upload_result.s3_key,
            content_type=upload_result.content_type,
            size_bytes=upload_result.size_bytes,
            ocr_snippet=ocr_snippet,
            ocr_status=ocr_status,
            variants=[upload_variant],
        )
        db_store: UpsertRepo = UpsertRepo(
            id=upload_result.asset_id,
            ocr_text=ocr_text,
            ocr_status=ocr_status,
            s3_key=upload_result.s3_key,
            size_bytes=upload_result.size_bytes,
            created_at=datetime.utcnow(),
        )
        variant_data: UpsertRepoVariant = UpsertRepoVariant(
            s3_key=upload_variant.s3_key,
            format=upload_variant.format.value,
            content_type=upload_variant.content_type,
            size_bytes=upload_variant.size_bytes,
            created_at=datetime.utcnow(),
        )
        store_asset(db_store, db)
        store_asset_variant(variant_data, upload_result.asset_id, db)
        cleanup_seeds(db)
        return resp
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
    db: Session = Depends(get_db),
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
):
    try:
        return await get_all_assets(db, page, page_size)
    except Exception as e:
        error, detail, status_code = _map_db_exception(e, action="history query")
        raise UploadException(
            error=error,
            detail=detail,
            status_code=status_code,
        ) from e


@app.get("/v1/search", response_model=PaginatedSearchResponse, tags=["search"])
async def search_endpoint(
    q: Annotated[str, Query(min_length=1)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    db: Session = Depends(get_db),
):
    try:
        return await search_assets(db, q, page, page_size)
    except Exception as e:
        error, detail, status_code = _map_db_exception(e, action="search query")
        raise UploadException(
            error=error,
            detail=detail,
            status_code=status_code,
        ) from e


@app.delete("/v1/delete/{asset_id}", status_code=204, tags=["assets"])
async def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
):
    # Delete from S3 first — if this fails the DB stays untouched and the
    # user can retry. Only proceed to DB deletion after S3 succeeds.
    try:
        delete_asset_from_s3(asset_id)
    except Exception as e:
        error, detail, status_code = map_s3_exception(e)
        raise UploadException(
            error=error,
            detail=detail,
            status_code=status_code,
        ) from e

    try:
        delete_asset_from_db(asset_id, db)
    except ValueError:
        raise UploadException(
            error="NotFound",
            detail=f"Asset with id {asset_id} not found",
            status_code=404,
        )
    except Exception as e:
        error, detail, status_code = _map_db_exception(e, action="asset deletion")
        raise UploadException(
            error=error,
            detail=detail,
            status_code=status_code,
        ) from e
