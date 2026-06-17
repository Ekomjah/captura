# scripts/seed.py

from datetime import datetime

from db.session import engine
from models.model import Asset, AssetVariant, User
from sqlalchemy.orm import Session

_seeds_cleaned = False

SEED_USER_ID = "00000000-0000-0000-0000-000000000000"
SEED_USER_EMAIL = "seed@internal.local"
SEED_USER_CLERK_ID = "seed_clerk_id"


def seed_db(session: Session):
    """Seed initial dummy assets with WebP variants for testing."""

    # existence check — safe to run on every container startup
    if session.query(Asset).first():
        print("Already seeded — skipping")
        return

    now = datetime.utcnow()

    seed_user = User(
        id=SEED_USER_ID,
        clerk_id=SEED_USER_CLERK_ID,
        email=SEED_USER_EMAIL,
    )
    session.add(seed_user)
    session.flush()

    for i in range(1, 4):
        asset = Asset(
            id=f"dummy-seed-asset-{i}",
            user_id=seed_user.id,
            s3_key=f"seed/raw/dummy-{i}.png",
            ocr_text=f"seeded receipt screenshot {i}",
            ocr_status="done",
            size_bytes=1024 * i,
            created_at=now,
            is_seeded=True,
        )
        session.add(asset)
        session.flush()  # assigns asset to DB before variant FK references it

        variant = AssetVariant(
            asset_id=f"dummy-seed-asset-{i}",
            s3_key=f"seed/processed/dummy-{i}.webp",
            format="webp",
            content_type="image/webp",
            size_bytes=max(1, (1024 * i) // 2),
            created_at=now,
        )
        session.add(variant)

    session.commit()
    print("Seeded successfully")


SEED_ASSETS_PER_USER = 3


def seed_user_assets(session: Session, user_id) -> None:
    """Seed dummy assets (+ webp variants) for a newly created user.

    Ids are namespaced by user_id so seeds never collide across accounts.
    """
    now = datetime.utcnow()

    for i in range(1, SEED_ASSETS_PER_USER + 1):
        asset = Asset(
            id=f"seed-{user_id}-{i}",
            user_id=user_id,
            s3_key=f"seed/raw/dummy-{i}.png",
            ocr_text=f"seeded receipt screenshot {i}",
            ocr_status="done",
            size_bytes=1024 * i,
            created_at=now,
            is_seeded=True,
        )
        session.add(asset)
        session.flush()  # assigns asset before variant FK references it

        variant = AssetVariant(
            asset_id=asset.id,
            s3_key=f"seed/processed/dummy-{i}.webp",
            format="webp",
            content_type="image/webp",
            size_bytes=max(1, (1024 * i) // 2),
            created_at=now,
        )
        session.add(variant)

    session.commit()


def cleanup_user_seeds(session: Session, user_id) -> int:
    """Delete only *this user's* seeded assets (+ variants). Returns count deleted.

    Set-based delete: one lookup, then bulk-delete variants before assets
    (asset_variants.asset_id has no ON DELETE CASCADE). Idempotent — a no-op
    once the user has no seeds left.
    """
    seed_ids = [
        row[0]
        for row in session.query(Asset.id)
        .filter(Asset.is_seeded.is_(True), Asset.user_id == user_id)
        .all()
    ]
    if not seed_ids:
        return 0

    session.query(AssetVariant).filter(AssetVariant.asset_id.in_(seed_ids)).delete(
        synchronize_session=False
    )
    deleted = (
        session.query(Asset)
        .filter(Asset.id.in_(seed_ids))
        .delete(synchronize_session=False)
    )
    session.commit()
    return deleted


def cleanup_seeds(session: Session):
    global _seeds_cleaned

    if _seeds_cleaned:
        return  # ← free — no DB query at all after first cleanup

    seeds = session.query(Asset).filter(Asset.is_seeded).all()
    if not seeds:
        _seeds_cleaned = True
        return

    for seed in seeds:
        session.delete(seed)

    seed_user = session.query(User).filter_by(email=SEED_USER_EMAIL).first()
    if seed_user:
        session.delete(seed_user)

    session.commit()
    _seeds_cleaned = True
    print(f"Cleaned up {len(seeds)} seed assets")


if __name__ == "__main__":
    with Session(engine) as session:
        seed_db(session)
