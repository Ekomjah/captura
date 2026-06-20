"""Per-user seeding lifecycle tests.

New accounts get dummy seeds; a user's first upload clears only *their* seeds
while leaving the real upload and other users' data untouched.
"""

import os
from collections.abc import Generator
from datetime import datetime
from uuid import UUID

import pytest
from db.base import Base
from models.model import Asset, AssetVariant, User
from sqlalchemy import String, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

from seed.seed import (  # noqa: E402
    SEED_ASSETS_PER_USER,
    cleanup_user_seeds,
    seed_user_assets,
)

USER_A = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
USER_B = UUID("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")


@pytest.fixture
def db() -> Generator[Session]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # SQLite can't compile the Postgres TSVECTOR/computed column.
    Asset.__table__.c.search_vector.type = String()
    Asset.__table__.c.search_vector.computed = None
    Asset.__table__.c.search_vector.server_default = None
    Base.metadata.create_all(bind=engine)

    session = sessionmaker(bind=engine)()
    session.add(User(id=USER_A, clerk_id="clerk_a", email="a@example.com"))
    session.add(User(id=USER_B, clerk_id="clerk_b", email="b@example.com"))
    session.commit()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def _seeds(session: Session, user_id) -> list[Asset]:
    return (
        session.query(Asset)
        .filter(Asset.is_seeded.is_(True), Asset.user_id == user_id)
        .all()
    )


def test_seed_user_assets_creates_namespaced_seeds_with_variants(db: Session):
    seed_user_assets(db, USER_A)

    seeds = _seeds(db, USER_A)
    assert len(seeds) == SEED_ASSETS_PER_USER
    assert all(a.id.startswith(f"seed-{USER_A}-") for a in seeds)
    # each seed carries exactly one webp variant
    for asset in seeds:
        assert len(asset.asset_variants) == 1
        assert asset.asset_variants[0].format == "webp"


def test_seed_user_assets_is_idempotent(db: Session):
    seed_user_assets(db, USER_A)
    seed_user_assets(db, USER_A)

    assert len(_seeds(db, USER_A)) == SEED_ASSETS_PER_USER
    assert db.query(AssetVariant).count() == SEED_ASSETS_PER_USER


def test_first_upload_cleanup_removes_only_callers_seeds(db: Session):
    seed_user_assets(db, USER_A)
    seed_user_assets(db, USER_B)

    # Simulate user A's first real upload landing before cleanup.
    real = Asset(
        id="real-upload-a",
        user_id=USER_A,
        s3_key="uploads/raw/real-upload-a/shot.png",
        ocr_text="real receipt",
        ocr_status="done",
        size_bytes=2048,
        created_at=datetime.utcnow(),
        is_seeded=False,
    )
    db.add(real)
    db.commit()

    deleted = cleanup_user_seeds(db, USER_A)

    assert deleted == SEED_ASSETS_PER_USER
    # A's seeds gone, A's real upload survives (CONFIRM)
    assert _seeds(db, USER_A) == []
    assert db.get(Asset, "real-upload-a") is not None
    # B untouched
    assert len(_seeds(db, USER_B)) == SEED_ASSETS_PER_USER
    # orphaned variants for A's seeds are also gone
    assert db.query(AssetVariant).count() == SEED_ASSETS_PER_USER  # B's only


def test_cleanup_user_seeds_is_idempotent(db: Session):
    seed_user_assets(db, USER_A)

    assert cleanup_user_seeds(db, USER_A) == SEED_ASSETS_PER_USER
    assert cleanup_user_seeds(db, USER_A) == 0
