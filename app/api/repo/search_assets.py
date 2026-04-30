import logging
import re

from schema.db_schema import (
    PaginatedSearchResponse,
    SearchHit,
)
from sqlalchemy.orm import Session

from repo.get_assets import _asset_to_summary, get_db_assets

logger = logging.getLogger(__name__)


async def search_assets(
    db: Session, q: str, page: int = 1, page_size: int = 20
) -> PaginatedSearchResponse:
    # Fetch all assets for searching (iterate through pages)
    all_assets = []
    current_page = 1
    batch_size = 100  # Internal batch size for fetching

    while True:
        batch = await get_db_assets(db, current_page, batch_size)
        if not batch:
            break
        all_assets.extend(batch)
        current_page += 1

    # Search through all assets and collect hits
    search_hits = []
    escaped_word = re.escape(q)
    pattern = rf"\b{escaped_word}\b"

    for asset in all_assets:
        if asset.ocr_text:
            matches = [
                (m.group(), m.start())
                for m in re.finditer(pattern, asset.ocr_text, re.IGNORECASE)
            ]
            logger.debug(f"Asset {asset.id} matches: {matches}")
            asset_summary = _asset_to_summary(asset)
            for match_text, index in matches:
                start = max(0, index - 40)
                end = min(len(asset.ocr_text), index + len(q) + 40)
                context = asset.ocr_text[start:end]

                search_hits.append(
                    SearchHit(
                        asset=asset_summary,
                        matched_text=match_text,
                        match_context=context,
                    )
                )

    # Paginate the search results
    total = len(search_hits)
    offset = (page - 1) * page_size
    paginated_hits = search_hits[offset : offset + page_size]

    return PaginatedSearchResponse(
        items=paginated_hits,
        page=page,
        page_size=page_size,
        total=total,
        query=q,
    )
