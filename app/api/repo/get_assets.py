from models.model import Asset
from schema.db_schema import AssetSummary, PaginatedAssetsResponse
from schema.upload import UploadVariant, VariantFormat
from sqlalchemy.orm import Session


def _variant_format_from_db(value: str) -> VariantFormat:
    try:
        return VariantFormat(value)
    except ValueError:
        return VariantFormat.webp


def _asset_to_summary(asset: Asset) -> AssetSummary:
    # Thumbnail: persisted WebP variant key only (no filename inference on raw asset).
    webp_variant = next(
        (av for av in asset.asset_variants if av.format == VariantFormat.webp.value),
        None,
    )
    thumbnail_url = webp_variant.s3_key if webp_variant else ""

    variants = [
        UploadVariant(
            s3_key=asset_variant.s3_key,
            content_type=asset_variant.content_type,
            size_bytes=asset_variant.size_bytes,
            format=_variant_format_from_db(asset_variant.format),
        )
        for asset_variant in asset.asset_variants
    ]

    return AssetSummary(
        id=str(asset.id),
        created_at=asset.created_at,
        s3_key=str(asset.s3_key),
        thumbnail_url=thumbnail_url,
        ocr_text=asset.ocr_text,
        ocr_status=asset.ocr_status
        if asset.ocr_status in ("pending", "done", "failed")
        else "pending",
        variants=variants,
    )


async def get_db_assets(
    db: Session, page: int = 1, page_size: int = 10, user_id: str = None
) -> list[Asset]:
    try:
        offset = (page - 1) * page_size
        query = db.query(Asset)
        if user_id:
            query = query.filter(Asset.user_id == user_id)
        db_assets = (
            query.order_by(Asset.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return db_assets

    except Exception as e:
        raise Exception("Failed to retrieve assets from the database") from e


async def get_all_assets(
    db: Session, page: int = 1, page_size: int = 10, user_id: str = None
) -> PaginatedAssetsResponse:
    try:
        db_assets = await get_db_assets(db, page, page_size, user_id=user_id)
        total = (
            db.query(Asset).filter(Asset.user_id == user_id).count()
            if user_id
            else db.query(Asset).count()
        )

        assets = [_asset_to_summary(asset) for asset in db_assets]
        return PaginatedAssetsResponse(
            images=assets, page=page, page_size=page_size, total=total
        )

    except Exception as e:
        raise Exception("Failed to retrieve assets from the database") from e
