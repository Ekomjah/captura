from datetime import datetime
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class NewScreenshot(BaseModel):
    id: int
    set_key: str
    ocr_text: str
    size: int
    timestamp: datetime


class UpdateScreenshot(BaseModel):
    id: Optional[int] = None
    set_key: Optional[str] = None
    ocr_text: Optional[str] = None
    size: Optional[int] = None
    timestamp: Optional[datetime] = None


@app.get("/")
def read_root():
    return {"message": "Captura API running"}


screenshot_dict = {
    1: {
        "id": 1,
        "set_key": "uploads/a1b2c3_original.png",
        "ocr_text": "NullPointerException at line 42 in U...",
        "size": 204800,
        "timestamp": "2024-06-01T12:00:00Z",
    }
}


@app.get("/screenshots/{screenshot_id}")
def get_screenshot(screenshot_id: int):
    return screenshot_dict[screenshot_id]


@app.get("/get_by_timestamp")
def get_by_timestamp(timestamp):
    for screenshot in screenshot_dict:
        if screenshot_dict[screenshot]["timestamp"] == timestamp:
            return screenshot_dict[screenshot]

    return {"Error": "Value not found"}


@app.post("/add_screenshot/{img_id}")
def create_student(img_id: int, img: NewScreenshot):
    if img_id in screenshot_dict:
        return {"Error": "Object already exists"}
    screenshot_dict[img_id] = img
    return screenshot_dict[img_id]


@app.delete("/remove_ss/{ss_id}")
def remove_ss(ss_id: int):
    if ss_id not in screenshot_dict:
        return {"Error": "No such image"}
    del screenshot_dict[ss_id]
    return {"Done": "Screenshot deleted successfully"}
