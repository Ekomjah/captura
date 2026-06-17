"""Self-contained contract tests for API routes.

These tests run without local Postgres/S3/Tesseract. They still exercise the
real repository code against an isolated SQLite database so we can verify the
Story 3.1 insert/read behavior end-to-end while pair-programming.
"""

import os
from collections.abc import Generator
from uuid import UUID

import jwt
import pytest
from db.base import Base
from fastapi.testclient import TestClient
from models.model import Asset, AssetVariant, User
from repo.auth.dependencies import get_current_user
from schema.upload import UploadVariant, VariantFormat
from services.ocr_service import OCRExtractionError
from sqlalchemy import String, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Allow importing app modules without local DB setup.
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

import main
import seed.seed as seed_module
from main import app

client = TestClient(app)
TEST_SEED_ASSET_ID_PREFIX = "dummy-seed-asset-"
TEST_USER_ID = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
TEST_CLERK_ID = "user_test_123"


@pytest.fixture
def test_session() -> Generator[Session]:
    """Create a fresh in-memory DB per test.

    StaticPool keeps the same SQLite in-memory database available across the
    route session and the assertions in the test body.
    """

    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )
    # SQLite can't compile Postgres-specific TSVECTOR/computed expression.
    # Adapt the column in tests so table creation remains self-contained.
    Asset.__table__.c.search_vector.type = String()
    Asset.__table__.c.search_vector.computed = None
    Asset.__table__.c.search_vector.server_default = None
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    seed_module._seeds_cleaned = False
    db.add(User(id=TEST_USER_ID, clerk_id=TEST_CLERK_ID, email="test@example.com"))
    db.commit()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def client_with_db(test_session: Session) -> Generator[TestClient]:
    """Override FastAPI's DB dependency with the test session."""

    def override_get_db() -> Generator[Session]:
        yield test_session

    async def override_current_user() -> User:
        user = test_session.get(User, TEST_USER_ID)
        assert user is not None
        return user

    app.dependency_overrides[main.get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_current_user
    try:
        yield client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def client_with_real_auth(test_session: Session) -> Generator[TestClient]:
    """Override only DB so auth provisioning runs through the real dependency."""

    def override_get_db() -> Generator[Session]:
        yield test_session

    app.dependency_overrides[main.get_db] = override_get_db
    try:
        yield client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def fake_variant() -> UploadVariant:
    return UploadVariant(
        s3_key="uploads/processed/asset-123/screenshot.webp",
        content_type="image/webp",
        size_bytes=12,
        format=VariantFormat.webp,
    )


@pytest.fixture
def fake_upload_result():
    class _FakeUploadResult:
        asset_id = "asset-123"
        bucket = "captura-test"
        s3_key = "uploads/raw/asset-123/screenshot.png"
        content_type = "image/png"
        size_bytes = 8

    return _FakeUploadResult()


@pytest.fixture
def mock_storage_and_conversion(monkeypatch, fake_upload_result, fake_variant):
    """Keep tests focused on API/DB behavior, not cloud or Pillow setup."""

    monkeypatch.setattr(main, "upload_raw_file", lambda **_: fake_upload_result)
    monkeypatch.setattr(main, "convert_to_webp", lambda _file_bytes: b"RIFF....WEBP")
    monkeypatch.setattr(main, "upload_variant_file", lambda **_: fake_variant)


def _seed_asset(
    db: Session,
    *,
    asset_id: str = "asset-123",
    ocr_text: str | None = "hello from screenshot with connection reset",
    ocr_status: str = "done",
) -> Asset:
    asset = Asset(
        id=asset_id,
        s3_key=f"uploads/raw/{asset_id}/screenshot.png",
        user_id=TEST_USER_ID,
        ocr_text=ocr_text,
        ocr_status=ocr_status,
        size_bytes=8,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def _seed_webp_variant(
    db: Session,
    *,
    asset_id: str = "asset-123",
    size_bytes: int = 12,
) -> AssetVariant:
    variant = AssetVariant(
        asset_id=asset_id,
        s3_key=f"uploads/processed/{asset_id}/screenshot.webp",
        format=VariantFormat.webp.value,
        content_type="image/webp",
        size_bytes=size_bytes,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


def _seed_dummy_assets_for_cleanup(db: Session) -> None:
    for i in range(1, 4):
        asset_id = f"{TEST_SEED_ASSET_ID_PREFIX}{i}"
        asset = Asset(
            id=asset_id,
            user_id=TEST_USER_ID,
            s3_key=f"seed/raw/dummy-{i}.png",
            ocr_text=f"seeded text {i}",
            ocr_status="done",
            size_bytes=1000 * i,
            is_seeded=True,
        )
        db.add(asset)
        db.flush()
        _seed_webp_variant(db, asset_id=asset_id, size_bytes=max(1, (1000 * i) // 2))
    db.commit()


def test_openapi_lists_mvp_paths_and_tags():
    response = client.get("/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/v1/upload" in paths
    assert "/v1/history" in paths
    assert "/v1/search" in paths
    assert paths["/v1/upload"]["post"]["tags"] == ["assets"]
    assert paths["/v1/history"]["get"]["tags"] == ["assets"]
    assert "/v1/delete/{asset_id}" in paths
    assert paths["/v1/delete/{asset_id}"]["delete"]["tags"] == ["assets"]


def test_post_upload_stores_ocr_text_in_db(
    monkeypatch,
    client_with_db: TestClient,
    test_session: Session,
    mock_storage_and_conversion,
):
    async def fake_extract_ocr_text(_file_bytes: bytes) -> str:
        return "hello from screenshot"

    monkeypatch.setattr(main, "extract_ocr_text", fake_extract_ocr_text)

    files = {"file": ("screenshot.png", b"\x89PNG\r\n\x1a\n", "image/png")}
    response = client_with_db.post("/v1/upload", files=files)

    assert response.status_code == 201
    data = response.json()
    assert data == {
        "asset_id": "asset-123",
        "bucket": "captura-test",
        "s3_key": "uploads/raw/asset-123/screenshot.png",
        "content_type": "image/png",
        "size_bytes": 8,
        "ocr_snippet": "hello from screenshot",
        "ocr_status": "done",
        "variants": [
            {
                "s3_key": "uploads/processed/asset-123/screenshot.webp",
                "content_type": "image/webp",
                "size_bytes": 12,
                "format": "webp",
            }
        ],
    }

    stored_asset = test_session.get(Asset, "asset-123")
    assert stored_asset is not None
    assert stored_asset.s3_key == "uploads/raw/asset-123/screenshot.png"
    assert stored_asset.ocr_text == "hello from screenshot"
    assert stored_asset.ocr_status == "done"
    stored_variant = (
        test_session.query(AssetVariant)
        .filter(AssetVariant.asset_id == "asset-123", AssetVariant.format == "webp")
        .one_or_none()
    )
    assert stored_variant is not None
    assert stored_variant.size_bytes > 0
    assert stored_variant.s3_key == "uploads/processed/asset-123/screenshot.webp"
    assert stored_variant.content_type == "image/webp"


def test_post_upload_stores_failed_status_when_ocr_fails(
    monkeypatch,
    client_with_db: TestClient,
    test_session: Session,
    mock_storage_and_conversion,
):
    async def fake_extract_ocr_text(_file_bytes: bytes) -> str:
        raise OCRExtractionError("mocked ocr failure")

    monkeypatch.setattr(main, "extract_ocr_text", fake_extract_ocr_text)

    files = {"file": ("screenshot.png", b"\x89PNG\r\n\x1a\n", "image/png")}
    response = client_with_db.post("/v1/upload", files=files)

    assert response.status_code == 201
    data = response.json()
    assert data["ocr_status"] == "failed"
    assert data["ocr_snippet"] is None

    stored_asset = test_session.get(Asset, "asset-123")
    assert stored_asset is not None
    assert stored_asset.ocr_text is None
    assert stored_asset.ocr_status == "failed"


def test_post_upload_rejects_empty_filename(client_with_db: TestClient):
    files = {"file": ("", b"x", "application/octet-stream")}
    response = client_with_db.post("/v1/upload", files=files)

    assert response.status_code in (400, 422)
    assert "detail" in response.json()


def test_get_history_reads_assets_from_db(
    client_with_db: TestClient,
    test_session: Session,
):
    _seed_asset(test_session)
    _seed_webp_variant(test_session)

    response = client_with_db.get("/v1/history", params={"page": 1, "page_size": 20})

    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total"] == 1
    assert len(data["images"]) == 1

    image = data["images"][0]
    assert image["id"] == "asset-123"
    assert image["s3_key"] == "uploads/raw/asset-123/screenshot.png"
    assert image["ocr_status"] == "done"
    assert image["ocr_snippet"] == "hello from screenshot with connection reset"
    assert image["thumbnail_url"] == "uploads/processed/asset-123/screenshot.webp"
    assert image["variants"][0]["format"] == "webp"
    assert image["variants"][0]["size_bytes"] > 0


def test_get_history_invalid_page_returns_422(client_with_db: TestClient):
    response = client_with_db.get("/v1/history", params={"page": 0})

    assert response.status_code == 422


def test_get_history_lazily_creates_missing_clerk_user(
    client_with_real_auth: TestClient,
    test_session: Session,
):
    token = jwt.encode(
        {"sub": "user_new_gmail", "email": "new-gmail@example.com"},
        "test-secret-with-enough-length-for-hs256",
        algorithm="HS256",
    )

    response = client_with_real_auth.get(
        "/v1/history",
        headers={"Authorization": f"Bearer {token}"},
        params={"page": 1, "page_size": 20},
    )

    assert response.status_code == 200
    data = response.json()
    # lazy provisioning creates the user but seeds nothing
    assert data["total"] == 0
    assert data["images"] == []

    user = (
        test_session.query(User)
        .filter(User.clerk_id == "user_new_gmail")
        .one_or_none()
    )
    assert user is not None
    assert user.email == "new-gmail@example.com"
    assert (
        test_session.query(Asset).filter(Asset.user_id == user.id).count() == 0
    )


def test_get_search_reads_matching_ocr_text_from_db(
    client_with_db: TestClient,
    test_session: Session,
):
    _seed_asset(test_session)
    _seed_webp_variant(test_session)

    response = client_with_db.get(
        "/v1/search",
        params={"q": "connection", "page": 1, "page_size": 10},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "connection"
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total"] == 1
    assert len(data["items"]) == 1

    hit = data["items"][0]
    assert hit["matched_text"] == "connection"
    assert "connection" in (hit["match_context"] or "")
    assert hit["asset"]["id"] == "asset-123"
    assert hit["asset"]["ocr_status"] == "done"
    assert hit["asset"]["ocr_snippet"] == "hello from screenshot with connection reset"
    assert hit["asset"]["variants"][0]["format"] == "webp"
    assert hit["asset"]["variants"][0]["size_bytes"] > 0


def test_get_search_missing_q_returns_422(client_with_db: TestClient):
    response = client_with_db.get("/v1/search")

    assert response.status_code == 422


# ===== 4.1 Acceptance Tests: Variant Metadata Persistence =====


def test_post_upload_creates_variant_row_in_db(
    monkeypatch,
    client_with_db: TestClient,
    test_session: Session,
    mock_storage_and_conversion,
):
    """Accept 4.1: Variant row is persisted in DB after upload."""

    async def fake_extract_ocr_text(_file_bytes: bytes) -> str:
        return "test ocr"

    monkeypatch.setattr(main, "extract_ocr_text", fake_extract_ocr_text)

    files = {"file": ("test.png", b"\x89PNG\r\n\x1a\n", "image/png")}
    response = client_with_db.post("/v1/upload", files=files)

    assert response.status_code == 201

    # Verify variant row exists in database
    stored_variant = (
        test_session.query(AssetVariant)
        .filter(
            AssetVariant.asset_id == "asset-123",
            AssetVariant.format == VariantFormat.webp.value,
        )
        .one_or_none()
    )
    assert stored_variant is not None
    assert stored_variant.s3_key == "uploads/processed/asset-123/screenshot.webp"
    assert stored_variant.content_type == "image/webp"
    assert stored_variant.size_bytes == 12  # From fake_variant fixture


def test_get_history_returns_persisted_variant_size_bytes(
    client_with_db: TestClient,
    test_session: Session,
):
    """Accept 4.1: History returns real variant size_bytes from DB, not placeholder."""

    _asset = _seed_asset(test_session, asset_id="history-test-1")
    _variant = _seed_webp_variant(
        test_session, asset_id="history-test-1", size_bytes=4096
    )

    response = client_with_db.get("/v1/history", params={"page": 1, "page_size": 20})

    assert response.status_code == 200
    data = response.json()
    assert len(data["images"]) == 1

    image = data["images"][0]
    # Verify variant size_bytes is the persisted DB value, not constructed/placeholder
    assert image["variants"][0]["size_bytes"] == 4096
    assert (
        image["variants"][0]["s3_key"]
        == "uploads/processed/history-test-1/screenshot.webp"
    )


def test_get_search_returns_persisted_variant_size_bytes(
    client_with_db: TestClient,
    test_session: Session,
):
    """Accept 4.1: Search returns real variant size_bytes from DB, not placeholder."""

    _asset = _seed_asset(test_session, asset_id="search-test-1")  # noqa: F401
    _variant = _seed_webp_variant(
        test_session, asset_id="search-test-1", size_bytes=2048
    )  # noqa: F401

    response = client_with_db.get(
        "/v1/search",
        params={"q": "connection", "page": 1, "page_size": 10},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1

    hit = data["items"][0]
    # Verify variant size_bytes is the persisted DB value
    assert hit["asset"]["variants"][0]["size_bytes"] == 2048
    assert (
        hit["asset"]["variants"][0]["s3_key"]
        == "uploads/processed/search-test-1/screenshot.webp"
    )


# ===== Delete endpoint tests =====


def test_delete_asset_removes_from_db(
    client_with_db: TestClient,
    test_session: Session,
    monkeypatch,
):
    """Deleting an existing asset returns 204 and removes the asset + variants."""
    monkeypatch.setattr(main, "delete_asset_from_s3", lambda asset_id: None)

    _seed_asset(test_session, asset_id="delete-me-1")
    _seed_webp_variant(test_session, asset_id="delete-me-1")

    response = client_with_db.delete("/v1/delete/delete-me-1")

    assert response.status_code == 204
    assert response.content == b""

    # Asset row must be gone.
    assert test_session.get(Asset, "delete-me-1") is None

    # All variant rows must be gone too (explicit deletion).
    remaining_variants = (
        test_session.query(AssetVariant)
        .filter(AssetVariant.asset_id == "delete-me-1")
        .all()
    )
    assert len(remaining_variants) == 0


def test_delete_asset_not_found_returns_404(
    client_with_db: TestClient,
    monkeypatch,
):
    """Deleting a non-existent asset returns 404."""
    monkeypatch.setattr(main, "delete_asset_from_s3", lambda asset_id: None)

    response = client_with_db.delete("/v1/delete/nonexistent-id")

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "NotFound"
    assert "nonexistent-id" in data["detail"]


def test_delete_asset_s3_failure_returns_500_and_preserves_db_row(
    client_with_db: TestClient,
    test_session: Session,
    monkeypatch,
):
    """When S3 deletion fails the asset stays in DB (S3-first safety)."""
    from botocore.exceptions import ClientError

    def fake_s3_delete(asset_id: str):
        raise ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
            "DeleteObject",
        )

    monkeypatch.setattr(main, "delete_asset_from_s3", fake_s3_delete)

    _seed_asset(test_session, asset_id="keep-me")
    _seed_webp_variant(test_session, asset_id="keep-me")

    response = client_with_db.delete("/v1/delete/keep-me")

    assert response.status_code == 500
    data = response.json()
    assert data["error"] == "S3AccessDenied"

    # Asset must still exist — S3 failure means we bail before DB deletion.
    assert test_session.get(Asset, "keep-me") is not None
