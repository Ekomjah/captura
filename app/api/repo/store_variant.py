from models.model import Asset,AssetVariant
from schema.db_schema import UpsertRepoVariant
from sqlalchemy.orm import Session

def store_asset_variant(variant: UpsertRepoVariant, asset_id: str, db: Session):
    asset = db.get(Asset, asset_id)
    if not asset:
        raise ValueError(f"Asset with id {asset_id} not found")
    asset.asset_variants.append(AssetVariant(**variant.model_dump()))
    db.add(asset)
    db.commit()
    return variant