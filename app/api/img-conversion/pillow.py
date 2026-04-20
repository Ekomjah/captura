from PIL import Image
from pathlib import Path

input_path = "/home/ekomjah/captura/app/api/img-conversion/nft.jpg"
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR  # Point to img-conversion folder, not 3 levels up

original_dir = PROJECT_ROOT / "uploads" / "original"
output_dir = PROJECT_ROOT / "uploads" / "converted"
original_file = PROJECT_ROOT / "uploads" / "original" / "nft.jpg"

# Rest of code remains the same...
# Create both directories
output_dir.mkdir(parents=True, exist_ok=True)
original_dir.mkdir(parents=True, exist_ok=True)

im = Image.open(input_path)
im.save(output_dir / "nft.webp", "WEBP")
im.save(output_dir / "nft.png", "PNG")
im.save(output_dir / "nft.avif", "AVIF")

if im.mode == "RGBA":
    im = im.convert("RGB")

im.save(original_file, "JPEG")

im.show()
