from models.model import Asset
from schema.db_schema import UpsertRepo
from sqlalchemy.orm import Session


def store_asset(asset: UpsertRepo, db: Session) -> UpsertRepo:
    db_asset = Asset(
        id=asset.id,
        s3_key=asset.s3_key,
        ocr_text=asset.ocr_text,
        ocr_status=asset.ocr_status,
        size_bytes=asset.size_bytes,
        created_at=asset.created_at,
    )
    db.add(db_asset)
    db.commit()
    return asset
