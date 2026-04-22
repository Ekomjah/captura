import os
from dataclasses import dataclass
from enum import Enum
from typing import Literal
from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, ClientError


class VariantFormat(str, Enum):
    webp = "webp"
    jpeg = "jpeg"
    png = "png"


@dataclass
class S3UploadResult:
    asset_id: str
    bucket: str
    s3_key: str
    content_type: str
    size_bytes: int


@dataclass
class S3UploadVariant:
    s3_key: str
    content_type: str
    size_bytes: int
    format: VariantFormat


@dataclass
class S3Config:
    region: str
    access_key_id: str
    secret_access_key: str
    bucket_name: str


class S3ConfigError(Exception):
    pass


def load_s3_config() -> S3Config:
    def _required_env(key: str) -> str:
        value = os.getenv(key, "").strip()
        if not value:
            raise S3ConfigError(f"Missing required environment variable: {key}")
        return value

    return S3Config(
        region=_required_env("AWS_DEFAULT_REGION"),
        access_key_id=_required_env("AWS_ACCESS_KEY_ID"),
        secret_access_key=_required_env("AWS_SECRET_ACCESS_KEY"),
        bucket_name=_required_env("S3_BUCKET_NAME"),
    )


def _s3_client(config: S3Config):
    return boto3.client(
        "s3",
        region_name=config.region,
        aws_access_key_id=config.access_key_id,
        aws_secret_access_key=config.secret_access_key,
    )


def build_upload_key(
    asset_id: str, filename: str, prefix: Literal["raw", "processed"]
) -> str:
    return f"uploads/{prefix}/{asset_id}/{filename}"


def upload_raw_file(
    filename: str, file_bytes: bytes, content_type: str
) -> S3UploadResult:
    config = load_s3_config()
    asset_id = str(uuid4())
    s3_key = build_upload_key(asset_id=asset_id, filename=filename, prefix="raw")
    client = _s3_client(config)
    client.put_object(
        Bucket=config.bucket_name,
        Key=s3_key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return S3UploadResult(
        asset_id=str(asset_id),
        bucket=config.bucket_name,
        s3_key=s3_key,
        content_type=content_type,
        size_bytes=len(file_bytes),
    )


def upload_variant_file(
    asset_id: str,
    filename: str,
    file_bytes: bytes,
    content_type: str,
    format: VariantFormat,
) -> S3UploadVariant:
    config = load_s3_config()
    client = _s3_client(config)

    s3_key = build_upload_key(asset_id=asset_id, filename=filename, prefix="processed")

    client.put_object(
        Bucket=config.bucket_name,
        Key=s3_key,
        Body=file_bytes,
        ContentType=content_type,
    )

    return S3UploadVariant(
        s3_key=s3_key,
        content_type=content_type,
        size_bytes=len(file_bytes),
        format=format,
    )


def map_s3_exception(exc: Exception) -> tuple[str, str, int]:
    if isinstance(exc, S3ConfigError):
        return ("ConfigurationError", str(exc), 500)
    if isinstance(exc, ClientError):
        code = exc.response.get("Error", {}).get("Code", "ClientError")
        mapping = {
            "SignatureDoesNotMatch": (
                "S3AuthError",
                "S3 signature mismatch. Verify access key, secret key, and AWS_DEFAULT_REGION.",
                500,
            ),
            "AccessDenied": (
                "S3AccessDenied",
                "S3 denied access. Confirm IAM policy includes PutObject for this bucket.",
                500,
            ),
            "NoSuchBucket": (
                "S3BucketNotFound",
                "Configured S3 bucket does not exist.",
                500,
            ),
        }
        return mapping.get(
            code, ("S3UploadError", f"S3 upload failed with code: {code}", 500)
        )
    if isinstance(exc, BotoCoreError):
        return (
            "S3ConnectionError",
            "Could not connect to S3 with current AWS configuration.",
            500,
        )
    return ("InternalServerError", "Something went wrong. Please try again later.", 500)
