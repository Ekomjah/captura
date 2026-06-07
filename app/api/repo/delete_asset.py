import logging

from models.model import Asset, AssetVariant
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def delete_asset_from_db(asset_id: str, db: Session) -> None:
    """Delete an asset and all its variants from the database.

    Variants are deleted explicitly (not just via cascade) so the intent is
    clear and future-proof — when more variants are added later, every linked
    row is guaranteed to be removed regardless of relationship configuration.

    Raises ValueError if no asset with the given id exists.
    """
    asset = db.get(Asset, asset_id)
    if not asset:
        raise ValueError(f"Asset with id {asset_id} not found")

    # Delete all linked variants explicitly, then the parent asset.
    variants = (
        db.query(AssetVariant)
        .filter(AssetVariant.asset_id == asset_id)
        .all()
    )
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
