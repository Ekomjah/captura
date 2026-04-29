from models.model import Asset
from schema.db_schema import AssetSummary
from sqlalchemy.orm import Session


async def store_asset(asset: AssetSummary, db: Session) -> AssetSummary:
    db_asset = Asset(
        id=asset.id,
        s3_key=asset.s3_key,
        ocr_text=asset.ocr_text,
        ocr_status=asset.ocr_status,
    )
    db.add(db_asset)
    db.commit()
    return asset
