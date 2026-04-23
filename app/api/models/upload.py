from enum import Enum

from pydantic import BaseModel, Field


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
