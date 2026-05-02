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
    q = q.strip()
    if not q:
        return PaginatedSearchResponse(
            items=[],
            page=page,
            page_size=page_size,
            total=0,
            query=q,
        )
    try:
        ts_query = func.plainto_tsquery("english", q)
        query = (
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
        total = query.count()

        offset = (page - 1) * page_size
        results = query.offset(offset).limit(page_size).all()
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
        return PaginatedSearchResponse(
            items=asset_summaries,
            page=page,
            page_size=page_size,
            total=total,
            query=q,
        )
    except Exception as e:
        logger.error("Error searching assets: %s", e)
        raise Exception("Failed to search assets in the database") from e
