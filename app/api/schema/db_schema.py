from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator
from schema.upload import UploadVariant


class AssetSummary(BaseModel):
    """Summary for an asset: raw object plus OCR fields and persisted variant rows."""

    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    s3_key: str
    thumbnail_url: str
    ocr_snippet: str | None = None
    ocr_status: Literal["pending", "done", "failed"]
    variants: list[UploadVariant]

    @field_validator("ocr_status", mode="before")
    @classmethod
    def normalize_status(cls, v: str) -> str:
        return v.lower()


class UpsertRepo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    s3_key: str
    ocr_text: str | None = None
    ocr_status: Literal["pending", "done", "failed"]
    size_bytes: int
    created_at: datetime

    @field_validator("ocr_status", mode="before")
    @classmethod
    def normalize_status(cls, v: str) -> str:
        return v.lower()


class UpsertRepoVariant(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    s3_key: str
    format: str
    content_type: str
    size_bytes: int
    created_at: datetime


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
