from models.model import Asset
from schema.db_schema import AssetSummary, PaginatedAssetsResponse
from schema.upload import UploadVariant, VariantFormat
from sqlalchemy.orm import Session


def _asset_to_summary(asset: Asset) -> AssetSummary:
    # Find the WebP variant from persisted metadata
    webp_variant = next(
        (av for av in asset.asset_variants if av.format == VariantFormat.webp), None
    )
    webp_thumbnail_url = webp_variant.s3_key if webp_variant else None

    ocr_snippet = asset.ocr_text[:100] if asset.ocr_text else None

    # Create variants list using persisted metadata
    variants = [
        UploadVariant(
            s3_key=asset_variant.s3_key,
            content_type="image/webp",
            size_bytes=asset_variant.size_bytes,
            format=VariantFormat.webp,
        )
        for asset_variant in asset.asset_variants
    ]

    return AssetSummary(
        id=str(asset.id),
        created_at=asset.created_at,
        s3_key=str(asset.s3_key),
        thumbnail_url=str(webp_thumbnail_url),
        ocr_snippet=ocr_snippet,
        ocr_status=asset.ocr_status
        if asset.ocr_status in ("pending", "done", "failed")
        else "pending",
        variants=variants,
    )


async def get_db_assets(db: Session, page: int = 1, page_size: int = 10) -> list[Asset]:
    try:
        offset = (page - 1) * page_size
        db_assets = (
            db.query(Asset)
            .order_by(Asset.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return db_assets

    except Exception as e:
        raise Exception("Failed to retrieve assets from the database") from e


async def get_all_assets(
    db: Session, page: int = 1, page_size: int = 10
) -> PaginatedAssetsResponse:
    try:
        db_assets = await get_db_assets(db, page, page_size)
        total = db.query(Asset).count()

        assets = [_asset_to_summary(asset) for asset in db_assets]
        return PaginatedAssetsResponse(
            images=assets, page=page, page_size=page_size, total=total
        )

    except Exception as e:
        raise Exception("Failed to retrieve assets from the database") from e
