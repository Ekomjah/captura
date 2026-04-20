from datetime import datetime, timedelta
from enum import Enum
from typing import Annotated
from uuid import uuid4
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
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


class ImageAsset(BaseModel):
    """image obj for an image upload"""

    id: str
    uploaded_at: datetime
    original_url: str
    ocr_text: str | None = None
    asset_variant: list[ImageVariant]


class UploadResult(BaseModel):
    id: str
    status: str = Field(..., examples=["uploading", "uploaded"])
    message: str
    asset_uploaded: ImageAsset


class ImagesViewPage(BaseModel):
    """resp model for the history endpoint"""

    images: list[ImageAsset]
    page: int = 1
    page_size: int
    total: int


class SearchHit(BaseModel):
    asset: ImageAsset
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


@app.post("/v1/upload", response_model=UploadResult, tags=["assets"])
async def upload_file_v1(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
        print(f"Successfully received file: {file.filename}")

        return UploadResult(
            id=str(uuid4()),
            status="uploaded",
            message="File uploaded successfully",
            asset_uploaded=ImageAsset(
                id=str(uuid4()),
                uploaded_at=datetime.now(),
                original_url=f"https://example.com/{file.filename}/uuid4()",
                ocr_text=None,
                asset_variant=[
                    ImageVariant(
                        img_size=204800,
                        format=ImageFormat.webp,
                        download_url=f"https://example.com/{file.filename}/uuid4()?format=webp",
                        expires_at=datetime.now() + timedelta(minutes=15),
                    )
                ],
            ),
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/history", response_model=ImagesViewPage)
async def get_history_v1(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
):
    return ImagesViewPage(
        images=[
            ImageAsset(
                id=str(uuid4()),
                uploaded_at=datetime.now(),
                original_url=f"https://example.com/image_{i}.png",
                ocr_text="Sample OCR text",
                asset_variant=[
                    ImageVariant(
                        img_size=204800,
                        format=ImageFormat.webp,
                        download_url=f"https://example.com/image_{i}.webp",
                        expires_at=datetime.now() + timedelta(minutes=15),
                    )
                ],
            )
            for i in range((page - 1) * page_size, page * page_size)
        ],
        page=page,
        page_size=page_size,
        total=1000,
    )


@app.get("/v1/search_assets", response_model=SearchPage)
async def search_assets(
    q: Annotated[str, Query(min_length=1)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
):
    return SearchPage(
        items=[
            SearchHit(
                asset=ImageAsset(
                    id=str(uuid4()),
                    uploaded_at=datetime.now(),
                    original_url=f"https://example.com/image_{i}.png",
                    ocr_text="Sample OCR text containing " + q,
                    asset_variant=[
                        ImageVariant(
                            img_size=204800,
                            format=ImageFormat.webp,
                            download_url=f"https://example.com/image_{i}.webp",
                            expires_at=datetime.now() + timedelta(minutes=15),
                        )
                    ],
                ),
                matched_text=q,
                matched_context="...Sample OCR text containing " + q + "...",
            )
            for i in range((page - 1) * page_size, page * page_size)
        ],
        page=page,
        page_size=page_size,
        total=500,
        query=q,
    )


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


#
