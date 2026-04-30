from models.model import Asset
from schema.db_schema import AssetSummary, PaginatedAssetsResponse, UpsertRepo
from schema.upload import UploadVariant, VariantFormat
from sqlalchemy.orm import Session


def _asset_to_summary(asset: UpsertRepo) -> AssetSummary:
    # Format: uploads/raw/{asset_id}/{filename}
    parts = asset.s3_key.split("/")
    asset_id = asset.id
    original_filename = parts[3] if len(parts) > 3 else "image"
    webp_filename = original_filename.rsplit(".", 1)[0] + ".webp"
    webp_thumbnail_url = f"uploads/processed/{asset_id}/{webp_filename}"

    # Generate ocr_snippet (first 100 chars of ocr_text, matching upload behavior)
    ocr_snippet = asset.ocr_text[:100] if asset.ocr_text else None

    # Create variants list with the WebP variant
    variants = [
        UploadVariant(
            s3_key=webp_thumbnail_url,
            content_type="image/webp",
            size_bytes=0,  #! Size is not stored in the db for variants, we can consider storing it in the future
            format=VariantFormat.webp,
        )
    ]

    return AssetSummary(
        id=str(asset.id),
        created_at=asset.created_at,
        s3_key=str(asset.s3_key),
        thumbnail_url=webp_thumbnail_url,
        ocr_snippet=ocr_snippet,
        ocr_status=asset.ocr_status
        if asset.ocr_status in ("pending", "done", "failed")
        else "pending",
        variants=variants,
    )


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


async def get_db_assets(
    db: Session, page: int = 1, page_size: int = 10
) -> list[UpsertRepo]:
    try:
        offset = (page - 1) * page_size
        db_assets = (
            db.query(Asset)
            .order_by(Asset.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return [UpsertRepo.model_validate(asset) for asset in db_assets]
    except Exception as e:
        raise Exception("Failed to retrieve assets from the database") from e
