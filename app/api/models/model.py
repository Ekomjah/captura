from datetime import datetime
from uuid import uuid4

from db.base import Base
from sqlalchemy import Computed, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid(),
    )

    clerk_id: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    s3_key: Mapped[str] = mapped_column(nullable=False, index=True)
    ocr_text: Mapped[str | None] = mapped_column(nullable=True)
    ocr_status: Mapped[str] = mapped_column(
        nullable=False, default="pending", index=True
    )
    size_bytes: Mapped[int] = mapped_column(nullable=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(index=True, default=datetime.utcnow)
    is_seeded: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )
    asset_variants: Mapped[list["AssetVariant"]] = relationship(
        "AssetVariant", back_populates="asset", cascade="all, delete-orphan"
    )

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

    variant_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    asset_id: Mapped[str] = mapped_column(
        ForeignKey("assets.id"), nullable=False, index=True
    )
    s3_key: Mapped[str] = mapped_column(nullable=False, index=True)
    format: Mapped[str] = mapped_column(nullable=False)
    content_type: Mapped[str] = mapped_column(nullable=False)
    size_bytes: Mapped[int] = mapped_column(nullable=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(index=True, default=datetime.utcnow)
    asset: Mapped["Asset"] = relationship("Asset", back_populates="asset_variants")
