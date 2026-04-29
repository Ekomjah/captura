from datetime import datetime

from pydantic import BaseModel, ConfigDict


# todo: the thumbnail url and variants have to be gotten during uploads as their values are not stored in the db, we can add them to the db or we can get them from s3 during retrieval, for now we will just hardcode them in the response model
class AssetSummary(BaseModel):
    """image obj for an image upload"""

    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    s3_key: str
    # thumbnail_url: str
    ocr_text: str | None = None
    ocr_status: str
    # variants: list[UploadVariant]


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
