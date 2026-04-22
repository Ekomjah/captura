from io import BytesIO

from PIL import Image


class ImageConversionError(Exception):
    pass


def convert_to_webp(image_bytes: bytes, format: str = "WEBP") -> bytes:
    try:
        input_buffer = BytesIO(image_bytes)
        img = Image.open(input_buffer)

        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        output_buffer = BytesIO()
        img.save(output_buffer, format=format.upper())

        return output_buffer.getvalue()

    except Exception as e:
        raise ImageConversionError("Failed to convert image to WebP") from e
