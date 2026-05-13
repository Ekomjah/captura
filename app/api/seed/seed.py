# scripts/seed.py

from datetime import datetime

from db.session import engine
from models.model import Asset, AssetVariant
from sqlalchemy.orm import Session

_seeds_cleaned = False


def seed_db(session: Session):
    """Seed initial dummy assets with WebP variants for testing."""

    # existence check — safe to run on every container startup
    if session.query(Asset).first():
        print("Already seeded — skipping")
        return

    now = datetime.utcnow()

    for i in range(1, 4):
        asset = Asset(
            id=f"dummy-seed-asset-{i}",
            s3_key=f"seed/raw/dummy-{i}.png",
            ocr_text=f"seeded receipt screenshot {i}",
            ocr_status="done",
            size_bytes=1024 * i,
            created_at=now,
            is_seeded=True,
        )

        variant = AssetVariant(
            asset_id=f"dummy-seed-asset-{i}",
            s3_key=f"seed/processed/dummy-{i}.webp",
            format="webp",
            content_type="image/webp",
            size_bytes=max(1, (1024 * i) // 2),
            created_at=now,
        )

        session.add(asset)
        session.flush()  # assigns asset to DB before variant FK references it
        session.add(variant)

    session.commit()
    print("Seeded successfully")


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
    session.commit()
    _seeds_cleaned = True
    print(f"Cleaned up {len(seeds)} seed assets")


if __name__ == "__main__":
    with Session(engine) as session:
        seed_db(session)
