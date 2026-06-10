import logging
from dataclasses import dataclass

from models.model import Asset, AssetVariant
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


@dataclass
class AssetS3Keys:
    """S3 keys for an asset and all its variants."""

    asset_s3_key: str
    variant_s3_keys: list[str]


def asset_exists(asset_id: str, db: Session) -> bool:
    return db.get(Asset, asset_id) is not None


def get_asset_s3_keys(asset_id: str, db: Session) -> AssetS3Keys:
    asset = db.get(Asset, asset_id)
    if not asset:
        raise ValueError(f"Asset with id {asset_id} not found")

    variants = db.query(AssetVariant).filter(AssetVariant.asset_id == asset_id).all()

    variant_keys = [v.s3_key for v in variants]

    logger.debug(
        "fetched S3 keys for asset %s: asset_key=%s, variant_keys=%s",
        asset_id,
        asset.s3_key,
        variant_keys,
    )

    return AssetS3Keys(
        asset_s3_key=asset.s3_key,
        variant_s3_keys=variant_keys,
    )


def delete_asset_from_db(asset_id: str, db: Session) -> None:
    asset = db.get(Asset, asset_id)
    if not asset:
        raise ValueError(f"Asset with id {asset_id} not found")

    # Delete all linked variants explicitly, then the parent asset.
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
