from sqlalchemy.orm import Session
from models.model import Asset, AssetVariant

def seed_db(session: Session):
    # optional test data
    asset = Asset(
        id="seed-asset-1",
        s3_key="seed/file.png",
        ocr_text="sample text",
        ocr_status="done"
    )

    variant = AssetVariant(
        id="seed-var-1",
        s3_key="seed/thumb.png",
        format="png",
        content_type="image/png"
    )

    asset.asset_variants.append(variant)

    session.add(asset)
    session.commit()