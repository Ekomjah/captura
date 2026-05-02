import logging

from models.model import Asset
from schema.db_schema import (
    PaginatedSearchResponse,
    SearchHit,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from repo.get_assets import _asset_to_summary

logger = logging.getLogger(__name__)


async def search_assets(
    db: Session, q: str, page: int = 1, page_size: int = 20
) -> PaginatedSearchResponse:

    ts_query = func.plainto_tsquery("english", q)
    results = (
        (
            db.query(
                Asset,
                func.ts_rank(Asset.search_vector, ts_query).label("rank"),
                func.ts_headline("english", Asset.ocr_text, ts_query).label(
                    "match_context"
                ),
            )
            .filter(Asset.search_vector.op("@@")(ts_query))
            .order_by(func.ts_rank(Asset.search_vector, ts_query).desc())
        )
        .limit(page_size)
        .offset((page - 1) * page_size)
        .all()
    )
    asset_summaries = []
    logger.info("results: %s", results)
    for asset, _rank, match_context in results:
        asset_summary = _asset_to_summary(asset)
        asset_summaries.append(
            SearchHit(
                asset=asset_summary,
                matched_text=q,
                match_context=match_context,
            )
        )
    # # Fetch all assets for searching
    # all_assets = await get_all_db_assets(db)

    # # Search through all assets and collect hits
    # search_hits = []
    # escaped_word = re.escape(q)
    # pattern = rf"\b{escaped_word}\b"

    # for asset in all_assets:
    #     if asset.ocr_text:
    #         matches = [
    #             (m.group(), m.start())
    #             for m in re.finditer(pattern, asset.ocr_text, re.IGNORECASE)
    #         ]
    #         logger.debug(f"Asset {asset.id} matches: {matches}")
    #         asset_summary = _asset_to_summary(asset)
    #         for match_text, index in matches:
    #             start = max(0, index - 40)
    #             end = min(len(asset.ocr_text), index + len(q) + 40)
    #             context = asset.ocr_text[start:end]

    #             search_hits.append(
    #                 SearchHit(
    #                     asset=asset_summary,
    #                     matched_text=match_text,
    #                     match_context=context,
    #                 )
    #             )

    # # Paginate the search results
    # total = len(search_hits)
    # offset = (page - 1) * page_size
    # paginated_hits = search_hits[offset : offset + page_size]

    return PaginatedSearchResponse(
        items=asset_summaries,
        page=page,
        page_size=page_size,
        total=len(asset_summaries),
        query=q,
    )
