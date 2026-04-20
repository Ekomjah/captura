from datetime import datetime
from enum import Enum

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Captura API", version="0.1.0")


class ImageFormat(str, Enum):
    webp = "webp"
    jpeg = "jpeg"
    png = "png"
    avif = "avif"


class ImageVariant(BaseModel):
    img_size: int = Field(..., description="Size in Bytes")
    format: ImageFormat
    download_url: str
    expires_at: datetime


class ScreenshotAsset(BaseModel):
    """screenshot obj for a screenshot upload"""

    id: int
    uploaded_at: datetime
    original_url: str
    ocr_text: str | None = None
    asset_variant: list[ImageVariant]


class UploadResult(BaseModel):
    id: str
    status: str = Field(..., examples=["uploading", "uploaded"])
    message: str
    asset_uploaded: ScreenshotAsset


class ScreenshotPage(BaseModel):
    """resp model for the history endpoint"""

    screenshots: list[ScreenshotAsset]
    page: int = 1
    page_size: int
    total: int


class SearchHit(BaseModel):
    asset: ScreenshotAsset
    matched_text: str
    matched_context: str | None = None


class SearchPage(BaseModel):
    """resp for the ocr search endpoint"""

    items: list[SearchHit]
    page: int
    page_size: int
    total: int
    query: int


class ErrorResponse(BaseModel):
    error: str
    detail: str


@app.get("/")
def read_root():
    return {"message": "Captura API running"}


# @app.get("/screenshots/{screenshot_id}")
# def get_screenshot(screenshot_id: int):
#     return screenshot_dict[screenshot_id]


# @app.get("/get_by_timestamp")
# def get_by_timestamp(timestamp):
#     for screenshot in screenshot_dict:
#         if screenshot_dict[screenshot]["timestamp"] == timestamp:
#             return screenshot_dict[screenshot]

#     return {"Error": "Value not found"}


# @app.post("/add_screenshot/{img_id}")
# def create_student(img_id: int, img: NewScreenshot):
#     if img_id in screenshot_dict:
#         return {"Error": "Object already exists"}
#     screenshot_dict[img_id] = img
#     return screenshot_dict[img_id]


@app.delete("/remove_ss/{ss_id}")
def remove_ss(ss_id: int):
    if ss_id not in screenshot_dict:
        return {"Error": "No such image"}
    del screenshot_dict[ss_id]
    return {"Done": "Screenshot deleted successfully"}
