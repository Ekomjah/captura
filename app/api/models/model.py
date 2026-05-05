from datetime import datetime

from db.base import Base
from sqlalchemy import Computed, Index,ForeignKey
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column,relationship


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
    asset_variants: Mapped[list["AssetVariant"]] = relationship("AssetVariant", back_populates="asset", cascade="all, delete-orphan")

    search_vector: Mapped[str] = mapped_column(
        TSVECTOR,
        Computed("to_tsvector('english', coalesce(ocr_text, ''))", persisted=True),
        nullable=True,
    )

    __table_args__ = (
        Index(
            "ix_assets_search_vector",
            "search_vector",
            postgresql_using="gin",
        ),
    )

class AssetVariant(Base):
    __tablename__ = "asset_variants"

    variant_id:Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    asset_id: Mapped[str] = mapped_column(
        ForeignKey("assets.id"),
        nullable=False,
        index=True
    )
    s3_key: Mapped[str] = mapped_column(nullable=False, index=True)
    format: Mapped[str] = mapped_column(nullable=False)
    content_type: Mapped[str] = mapped_column(nullable=False)
    size_bytes: Mapped[int] = mapped_column(nullable=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(index=True, default=datetime.utcnow)
    asset: Mapped["Asset"] = relationship("Asset", back_populates="asset_variants")
