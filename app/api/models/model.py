# -- Minimal `assets` table shape for OCR persistence alignment
# id          TEXT PRIMARY KEY
# s3_key      TEXT NOT NULL
# ocr_text    TEXT NULL
# ocr_status  TEXT NOT NULL -- pending | done | failed
# created_at  TIMESTAMPTZ NOT NULL


# TODO: - We can consider adding a `variants` column to store the derived variants in the db for easier retrieval instead of having to get them from s3 during retrieval
# TODO: - We can also add a thumbnail_url column to adhere the the `AssetSummary`'s model and the initial story for api contracts

from datetime import datetime

from db.base import Base
from sqlalchemy.orm import Mapped, mapped_column


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(primary_key=True)
    s3_key: Mapped[str] = mapped_column(nullable=False, index=True)
    ocr_text: Mapped[str | None] = mapped_column(nullable=True)
    ocr_status: Mapped[str] = mapped_column(
        nullable=False, default="pending", index=True
    )
    size_bytes: Mapped[int] = mapped_column(nullable=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(index=True, default=datetime.utcnow)
