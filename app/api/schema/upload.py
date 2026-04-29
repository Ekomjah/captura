from enum import Enum
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field


class VariantFormat(str, Enum):
    webp = "webp"
    jpeg = "jpeg"
    png = "png"


class UploadVariant(BaseModel):
    """Variant object stored in S3 and returned on upload (shared API + service contract)."""

    s3_key: str
    content_type: str
    size_bytes: int = Field(..., description="Size in bytes")
    format: VariantFormat


class UploadResponse(BaseModel):
    """Response body for POST /v1/upload (raw object + derived variants)."""

    asset_id: str
    bucket: str
    s3_key: str
    content_type: str
    size_bytes: int
    ocr_snippet: str | None = None
    ocr_status: str = Field(..., examples=["pending", "done", "failed"])
    variants: list[UploadVariant]

    model_config = ConfigDict(from_attributes=True)

