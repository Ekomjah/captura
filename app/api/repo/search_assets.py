import re

from schema.db_schema import (
    PaginatedSearchResponse,
    SearchHit,
)
from sqlalchemy.orm import Session

from repo.get_assets import get_all_assets


async def search_assets(
    db: Session, q: str, page: int = 1, page_size: int = 20
) -> PaginatedSearchResponse:
    assets = await get_all_assets(db)
    search_hits = []
    escaped_word = re.escape(q)
    pattern = rf"\b{escaped_word}\b"
    for asset in assets.images:
        if asset.ocr_text:
            matches = [
                (m.group(), m.start())
                for m in re.finditer(pattern, asset.ocr_text, re.IGNORECASE)
            ]
            for match_text, index in matches:
                start = max(0, index - 40)
                end = min(len(asset.ocr_text), index + len(q) + 40)
                context = asset.ocr_text[start:end]

                search_hits.append(
                    SearchHit(
                        asset=asset,
                        matched_text=match_text,
                        match_context=context,
                    )
                )
    return PaginatedSearchResponse(
        items=search_hits,
        page=page,
        page_size=page_size,
        total=len(search_hits) if search_hits else 0,
        query=q,
    )
