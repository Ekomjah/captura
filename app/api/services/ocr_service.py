import asyncio
from io import BytesIO

import pytesseract
from PIL import Image


class OCRExtractionError(Exception):
    pass


async def extract_ocr_text(image_bytes: bytes) -> str:
    try:
        input_buffer = BytesIO(image_bytes)
        img = Image.open(input_buffer)

        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(None, pytesseract.image_to_string, img)
        if not text.strip():
            text = ""
        return text.strip()
    except Exception as e:
        raise OCRExtractionError("Failed to extract text from image using OCR") from e
