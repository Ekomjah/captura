import logging

from models.model import Asset, AssetVariant
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def delete_asset_from_db(asset_id: str, db: Session, user_id: str = None) -> None:
    asset = db.get(Asset, asset_id)
    if not asset:
        raise ValueError(f"Asset with id {asset_id} not found")
    if user_id and str(asset.user_id) != str(user_id):
        raise ValueError(f"Asset with id {asset_id} not found")
    variants = db.query(AssetVariant).filter(AssetVariant.asset_id == asset_id).all()
    for variant in variants:
        logger.debug(
            "deleting variant %s (format=%s, key=%s)",
            variant.variant_id,
            variant.format,
            variant.s3_key,
        )
        db.delete(variant)

    db.delete(asset)
    db.commit()
