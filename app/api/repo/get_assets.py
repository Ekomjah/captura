from models.model import Asset
from schema.db_schema import AssetSummary, PaginatedAssetsResponse
from sqlalchemy.orm import Session


async def get_all_assets(
    db: Session, page: int = 1, page_size: int = 10
) -> PaginatedAssetsResponse:
    try:
        offset = (page - 1) * page_size
        db_assets = (
            db.query(Asset)
            .order_by(Asset.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        total = db.query(Asset).count()

        assets = list(map(AssetSummary.model_validate, db_assets))

        return PaginatedAssetsResponse(
            images=assets, page=page, page_size=page_size, total=total
        )
    except Exception as e:
        raise Exception("Failed to retrieve assets from the database") from e
