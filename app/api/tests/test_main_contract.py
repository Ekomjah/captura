"""Self-contained contract tests for API routes.

These tests run without local Postgres/S3/Tesseract. They still exercise the
real repository code against an isolated SQLite database so we can verify the
Story 3.1 insert/read behavior end-to-end while pair-programming.
"""

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from db.base import Base
from models.model import Asset
from schema.upload import UploadVariant, VariantFormat
from services.ocr_service import OCRExtractionError

# Allow importing app modules without local DB setup.
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

import main
from main import app

client = TestClient(app)


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
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
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
        ocr_text=ocr_text,
        ocr_status=ocr_status,
        size_bytes=8,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def test_openapi_lists_mvp_paths_and_tags():
    response = client.get("/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/v1/upload" in paths
    assert "/v1/history" in paths
    assert "/v1/search" in paths
    assert paths["/v1/upload"]["post"]["tags"] == ["assets"]
    assert paths["/v1/history"]["get"]["tags"] == ["assets"]
    assert paths["/v1/search"]["get"]["tags"] == ["search"]


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


def test_post_upload_rejects_empty_filename():
    files = {"file": ("", b"x", "application/octet-stream")}
    response = client.post("/v1/upload", files=files)

    assert response.status_code in (400, 422)
    assert "detail" in response.json()


def test_get_history_reads_assets_from_db(
    client_with_db: TestClient,
    test_session: Session,
):
    _seed_asset(test_session)

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


def test_get_history_invalid_page_returns_422():
    response = client.get("/v1/history", params={"page": 0})

    assert response.status_code == 422


def test_get_search_reads_matching_ocr_text_from_db(
    client_with_db: TestClient,
    test_session: Session,
):
    _seed_asset(test_session)

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


def test_get_search_missing_q_returns_422():
    response = client.get("/v1/search")

    assert response.status_code == 422


def test_get_search_empty_q_returns_422():
    response = client.get("/v1/search", params={"q": ""})

    assert response.status_code == 422
"""Self-contained contract tests for API routes.

These tests intentionally avoid requiring a local Postgres/S3/Tesseract setup.
External integrations are mocked at the route boundary.
"""

import os

import pytest
from fastapi.testclient import TestClient
from schema.db_schema import AssetSummary, PaginatedAssetsResponse, PaginatedSearchResponse, SearchHit
from schema.upload import UploadVariant, VariantFormat
from services.ocr_service import OCRExtractionError

# Allow importing app modules without local DB setup.
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

import main
from main import app

client = TestClient(app)


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


def _sample_asset_summary() -> AssetSummary:
    return AssetSummary(
        id="asset-123",
        created_at="2026-04-30T12:00:00Z",
        s3_key="uploads/raw/asset-123/screenshot.png",
        thumbnail_url="uploads/processed/asset-123/screenshot.webp",
        ocr_snippet="hello from screenshot",
        ocr_status="done",
        variants=[
            UploadVariant(
                s3_key="uploads/processed/asset-123/screenshot.webp",
                content_type="image/webp",
                size_bytes=12,
                format=VariantFormat.webp,
            )
        ],
    )


def test_openapi_lists_mvp_paths_and_tags():
    r = client.get("/openapi.json")
    assert r.status_code == 200
    paths = r.json()["paths"]
    assert "/v1/upload" in paths
    assert "/v1/history" in paths
    assert "/v1/search" in paths
    assert paths["/v1/upload"]["post"]["tags"] == ["assets"]
    assert paths["/v1/history"]["get"]["tags"] == ["assets"]
    assert paths["/v1/search"]["get"]["tags"] == ["search"]


def test_post_upload_returns_201_and_asset_contract(monkeypatch, fake_upload_result, fake_variant):
    async def _fake_extract_ocr_text(_file_bytes: bytes) -> str:
        return "hello from screenshot"

    async def _fake_store_asset(_asset, _db):
        return _asset

    monkeypatch.setattr(main, "upload_raw_file", lambda **_: fake_upload_result)
    monkeypatch.setattr(main, "convert_to_webp", lambda _file_bytes: b"RIFF....WEBP")
    monkeypatch.setattr(main, "upload_variant_file", lambda **_: fake_variant)
    monkeypatch.setattr(main, "extract_ocr_text", _fake_extract_ocr_text)
    monkeypatch.setattr(main, "store_asset", _fake_store_asset)

    files = {"file": ("screenshot.png", b"\x89PNG\r\n\x1a\n", "image/png")}
    r = client.post("/v1/upload", files=files)
    assert r.status_code == 201
    data = r.json()
    assert data["asset_id"] == "asset-123"
    assert data["bucket"] == "captura-test"
    assert data["s3_key"] == "uploads/raw/asset-123/screenshot.png"
    assert data["content_type"] == "image/png"
    assert data["size_bytes"] == 8
    assert data["ocr_status"] == "done"
    assert data["ocr_snippet"] == "hello from screenshot"
    assert len(data["variants"]) == 1
    assert data["variants"][0]["format"] == "webp"


def test_post_upload_handles_ocr_failure_without_crash(monkeypatch, fake_upload_result, fake_variant):
    async def _fake_extract_ocr_text(_file_bytes: bytes) -> str:
        raise OCRExtractionError("mocked ocr failure")

    async def _fake_store_asset(_asset, _db):
        return _asset

    monkeypatch.setattr(main, "upload_raw_file", lambda **_: fake_upload_result)
    monkeypatch.setattr(main, "convert_to_webp", lambda _file_bytes: b"RIFF....WEBP")
    monkeypatch.setattr(main, "upload_variant_file", lambda **_: fake_variant)
    monkeypatch.setattr(main, "extract_ocr_text", _fake_extract_ocr_text)
    monkeypatch.setattr(main, "store_asset", _fake_store_asset)

    files = {"file": ("screenshot.png", b"\x89PNG\r\n\x1a\n", "image/png")}
    r = client.post("/v1/upload", files=files)
    assert r.status_code == 201
    data = r.json()
    assert data["ocr_status"] == "failed"
    assert data["ocr_snippet"] is None


def test_post_upload_rejects_empty_filename():
    files = {"file": ("", b"x", "application/octet-stream")}
    r = client.post("/v1/upload", files=files)
    assert r.status_code in (400, 422)
    assert "detail" in r.json()


def test_get_history_returns_paginated_images_contract(monkeypatch):
    async def _fake_get_all_assets(_db, page: int, page_size: int):
        return PaginatedAssetsResponse(
            images=[_sample_asset_summary()],
            page=page,
            page_size=page_size,
            total=1,
        )

    monkeypatch.setattr(main, "get_all_assets", _fake_get_all_assets)

    r = client.get("/v1/history", params={"page": 1, "page_size": 20})
    assert r.status_code == 200
    data = r.json()
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total"] == 1
    assert len(data["images"]) == 1
    img0 = data["images"][0]
    assert img0["ocr_status"] == "done"
    assert img0["ocr_snippet"] == "hello from screenshot"


def test_get_history_invalid_page_returns_422():
    r = client.get("/v1/history", params={"page": 0})
    assert r.status_code == 422


def test_get_search_returns_paginated_hits_and_query_echo(monkeypatch):
    async def _fake_search_assets(_db, q: str, page: int, page_size: int):
        asset = _sample_asset_summary()
        return PaginatedSearchResponse(
            items=[
                SearchHit(
                    asset=asset,
                    matched_text="connection",
                    match_context="... connection ...",
                )
            ],
            page=page,
            page_size=page_size,
            total=1,
            query=q,
        )

    monkeypatch.setattr(main, "search_assets", _fake_search_assets)

    r = client.get("/v1/search", params={"q": "connection", "page": 1, "page_size": 10})
    assert r.status_code == 200
    data = r.json()
    assert data["query"] == "connection"
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total"] == 1
    assert len(data["items"]) == 1
    hit = data["items"][0]
    assert hit["matched_text"] == "connection"
    assert "connection" in (hit["match_context"] or "")
    assert hit["asset"]["id"] == "asset-123"


def test_get_search_missing_q_returns_422():
    r = client.get("/v1/search")
    assert r.status_code == 422


def test_get_search_empty_q_returns_422():
    r = client.get("/v1/search", params={"q": ""})
    assert r.status_code == 422
