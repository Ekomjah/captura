import re

my_obj = {
    "images": [
        {
            "id": "12366fe8-9c48-46b2-adde-04ee0f689633",
            "created_at": "2026-04-29T05:58:35.658854",
            "s3_key": "uploads/raw/12366fe8-9c48-46b2-adde-04ee0f689633/s3.PNG",
            "ocr_text": "Ce Oma est\n\nDg\n\n \n\nerica\n\n= oO\nConsole Home i) aD\nApplications (0) into :\n\nRegion: US East (N. Virginia)\n\n \n\nRecently visited info :\n\n \n\n \n\n \n\nSelect Region\nus-east-1 (Current Region) ¥ | | Q Find applications\n\n1\nName v | Description v | Region v | Originati\n\n \n\n \n\n  \n\n@ > Access denied to servicecatalog:\n\n@ Diagnose with Amazon Q\n\n—————\n\nistApplications\n\n \n\nView all services 4 Go to myApplications 4\n\nSee eee",
            "ocr_status": "Done",
        },
        {
            "id": "1ad311d8-0c60-4c3b-a926-424b1b7c0bfd",
            "created_at": "2026-04-29T04:50:05.583663",
            "s3_key": "uploads/raw/1ad311d8-0c60-4c3b-a926-424b1b7c0bfd/always determined.png",
            "ocr_text": "My Notebook > to-dos V7\n\n \n\nGo to school and write my economics examinations\ntommorrow, 23rd October, 2024.\n\n22 October 2024 23:16\n\nPrepared to take first as usual in SS3.\n‘Owen shalln’t have itt.\n\nEconomics no wan enter my head fr...\n\nTill see this note in my future self, | will determine wheher | was smart or stupid enough.",
            "ocr_status": "Done",
        },
    ],
    "page": 1,
    "page_size": 2,
    "total": 5,
}

for image in my_obj["images"]:
    img_match, img = None, None
    escaped_word = re.escape("to-dos")
    pattern = rf"\b{escaped_word}\b"
    if my_obj["images"]:
        match = re.findall(pattern, image["ocr_text"])
        if match:
            img_match, img = match, image
    print(img_match, img)
