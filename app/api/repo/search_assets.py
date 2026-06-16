import logging
import re

from models.model import Asset
from schema.db_schema import (
    PaginatedSearchResponse,
    SearchHit,
)
from sqlalchemy import func
from sqlalchemy.orm import Session

from repo.get_assets import _asset_to_summary

logger = logging.getLogger(__name__)


def _search_assets_sqlite(
    db: Session, q: str, page: int, page_size: int, user_id: str = None
) -> PaginatedSearchResponse:
    """Substrate match for contract tests: SQLite has no FTS operators used in prod."""
    pattern = re.compile(re.escape(q), re.IGNORECASE)
    q_obj = db.query(Asset).filter(Asset.ocr_text.isnot(None))
    if user_id:
        q_obj = q_obj.filter(Asset.user_id == user_id)
    ordered = q_obj.order_by(Asset.created_at.desc()).all()
    matches: list[tuple[Asset, str | None]] = []
    for asset in ordered:
        if not asset.ocr_text:
            continue
        m = pattern.search(asset.ocr_text)
        if not m:
            continue
        start = max(0, m.start() - 40)
        end = min(len(asset.ocr_text), m.end() + 40)
        matches.append((asset, asset.ocr_text[start:end]))

    total = len(matches)
    offset = (page - 1) * page_size
    page_rows = matches[offset : offset + page_size]
    items = [
        SearchHit(
            asset=_asset_to_summary(asset),
            matched_text=q,
            match_context=ctx,
        )
        for asset, ctx in page_rows
    ]
    return PaginatedSearchResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        query=q,
    )


async def search_assets(
    db: Session, q: str, page: int = 1, page_size: int = 20, user_id: str = None
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
        bind = db.get_bind()
        if bind.dialect.name == "sqlite":
            return _search_assets_sqlite(db, q, page, page_size, user_id=user_id)

        ts_query = func.plainto_tsquery("english", q)
        query = db.query(
            Asset,
            func.ts_rank(Asset.search_vector, ts_query).label("rank"),
            func.ts_headline("english", Asset.ocr_text, ts_query).label(
                "match_context"
            ),
        ).filter(Asset.search_vector.op("@@")(ts_query))
        if user_id:
            query = query.filter(Asset.user_id == user_id)
        query = query.order_by(func.ts_rank(Asset.search_vector, ts_query).desc())
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
