from models.model import Asset
from schema.upload import UploadResponse
from sqlalchemy.orm import Session


async def create_asset(asset: UploadResponse, db: Session) -> UploadResponse:
    db_asset = Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return UploadResponse.model_validate(db_asset)
