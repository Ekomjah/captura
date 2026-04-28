"""Tests for Story 1.2 and Story 2.1 API contracts."""

from fastapi.testclient import TestClient

import main
from main import app
from app.api.schema.upload import UploadVariant, VariantFormat

client = TestClient(app)


def test_openapi_lists_mvp_paths_and_tags():
    r = client.get("/openapi.json")
    assert r.status_code == 200
    spec = r.json()
    paths = spec["paths"]
    assert "/v1/upload" in paths
    assert "/v1/history" in paths
    assert "/v1/search" in paths
    assert paths["/v1/upload"]["post"]["tags"] == ["assets"]
    assert paths["/v1/history"]["get"]["tags"] == ["assets"]
    assert paths["/v1/search"]["get"]["tags"] == ["search"]


def test_post_upload_returns_201_and_asset_contract():
    class _FakeUploadResult:
        asset_id = "asset-123"
        bucket = "captura-test"
        s3_key = "uploads/raw/asset-123/screenshot.png"
        content_type = "image/png"
        size_bytes = 8

    fake_variant = UploadVariant(
        s3_key="uploads/processed/asset-123/screenshot.webp",
        content_type="image/webp",
        size_bytes=12,
        format=VariantFormat.webp,
    )

    main.upload_raw_file = lambda filename, file_bytes, content_type: _FakeUploadResult()
    main.convert_to_webp = lambda file_bytes: b"RIFF....WEBP"
    main.upload_variant_file = lambda **kwargs: fake_variant
    files = {"file": ("screenshot.png", b"\x89PNG\r\n\x1a\n", "image/png")}
    r = client.post("/v1/upload", files=files)
    assert r.status_code == 201
    data = r.json()
    assert data["asset_id"] == "asset-123"
    assert data["bucket"] == "captura-test"
    assert data["s3_key"] == "uploads/raw/asset-123/screenshot.png"
    assert data["content_type"] == "image/png"
    assert data["size_bytes"] == 8
    assert data["status"] == "uploaded"
    assert len(data["variants"]) == 1
    v0 = data["variants"][0]
    assert v0["s3_key"] == "uploads/processed/asset-123/screenshot.webp"
    assert v0["content_type"] == "image/webp"
    assert v0["size_bytes"] == 12
    assert v0["format"] == "webp"


def test_post_upload_rejects_empty_filename():
    """Empty filename may be rejected by multipart validation (422) or the handler (400)."""
    files = {"file": ("", b"x", "application/octet-stream")}
    r = client.post("/v1/upload", files=files)
    assert r.status_code in (400, 422)
    assert "detail" in r.json()


def test_get_history_returns_paginated_images_contract():
    r = client.get("/v1/history", params={"page": 1, "page_size": 20})
    assert r.status_code == 200
    data = r.json()
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total"] == 1000
    assert len(data["images"]) >= 1
    img0 = data["images"][0]
    assert img0["variants"]
    assert all("format" in v for v in img0["variants"])


def test_get_history_invalid_page_returns_422():
    r = client.get("/v1/history", params={"page": 0})
    assert r.status_code == 422


def test_get_search_returns_paginated_hits_and_query_echo():
    r = client.get("/v1/search", params={"q": "connection", "page": 1, "page_size": 10})
    assert r.status_code == 200
    data = r.json()
    assert data["query"] == "connection"
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total"] == 500
    assert len(data["items"]) == 1
    hit = data["items"][0]
    assert hit["matched_text"] == "connection"
    assert "connection" in (hit["match_context"] or "")
    assert hit["asset"]["id"]
    assert hit["asset"]["variants"]


def test_get_search_missing_q_returns_422():
    r = client.get("/v1/search")
    assert r.status_code == 422


def test_get_search_empty_q_returns_422():
    r = client.get("/v1/search", params={"q": ""})
    assert r.status_code == 422
