import logging
import os
from dataclasses import dataclass
from typing import Literal
from uuid import uuid4

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from schema.upload import UploadVariant, VariantFormat

logger = logging.getLogger(__name__)


@dataclass
class S3UploadResult:
    asset_id: str
    bucket: str
    s3_key: str
    content_type: str
    size_bytes: int


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
) -> UploadVariant:
    config = load_s3_config()
    client = _s3_client(config)

    s3_key = build_upload_key(asset_id=asset_id, filename=filename, prefix="processed")

    client.put_object(
        Bucket=config.bucket_name,
        Key=s3_key,
        Body=file_bytes,
        ContentType=content_type,
    )

    return UploadVariant(
        s3_key=s3_key,
        content_type=content_type,
        size_bytes=len(file_bytes),
        format=format,
    )


def map_s3_exception(exc: Exception, action: str = "upload") -> tuple[str, str, int]:
    """Map S3 exceptions to error responses.

    Args:
        exc: The exception to map.
        action: The S3 action context ("upload", "delete", etc.) for better error messages.

    Returns:
        Tuple of (error_code, detail_message, status_code).
    """
    if isinstance(exc, S3ConfigError):
        return ("ConfigurationError", str(exc), 500)
    if isinstance(exc, ClientError):
        code = exc.response.get("Error", {}).get("Code", "ClientError")

        # Action-aware error messages
        action_iams = {
            "upload": "PutObject",
            "delete": "DeleteObject",
            "list": "ListBucket",
        }
        iam_action = action_iams.get(action, "S3 operations")

        mapping = {
            "SignatureDoesNotMatch": (
                "S3AuthError",
                "S3 signature mismatch. Verify access key, secret key, and AWS_DEFAULT_REGION.",
                500,
            ),
            "AccessDenied": (
                "S3AccessDenied",
                f"S3 denied access. Confirm IAM policy includes {iam_action} for this bucket.",
                500,
            ),
            "NoSuchBucket": (
                "S3BucketNotFound",
                "Configured S3 bucket does not exist.",
                500,
            ),
        }
        return mapping.get(
            code, ("S3Error", f"S3 {action} failed with code: {code}", 500)
        )
    if isinstance(exc, BotoCoreError):
        return (
            "S3ConnectionError",
            "Could not connect to S3 with current AWS configuration.",
            500,
        )
    return (
        "InternalServerError",
        "Something went wrong. Please try again later or confirm your network.",
        500,
    )


def _delete_objects_under_prefix(client, bucket_name: str, prefix: str) -> int:
    """Delete all objects under *prefix* in *bucket_name*. Returns count deleted."""
    paginator = client.get_paginator("list_objects_v2")
    deleted = 0
    for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
        contents = page.get("Contents", [])
        if not contents:
            continue
        objects = [{"Key": obj["Key"]} for obj in contents]
        client.delete_objects(
            Bucket=bucket_name,
            Delete={"Objects": objects},
        )
        deleted += len(objects)
    return deleted


def delete_objects_from_s3(s3_keys: list[str]) -> None:
    if not s3_keys:
        logger.debug("no S3 keys to delete")
        return

    config = load_s3_config()
    client = _s3_client(config)

    # AWS delete_objects supports up to 1000 objects per request
    chunk_size = 1000
    for i in range(0, len(s3_keys), chunk_size):
        chunk = s3_keys[i : i + chunk_size]
        try:
            objects = [{"Key": key} for key in chunk]
            response = client.delete_objects(
                Bucket=config.bucket_name,
                Delete={"Objects": objects},
            )
            deleted_count = len(response.get("Deleted", []))
            logger.info(
                "deleted %d object(s) from s3://%s: %s",
                deleted_count,
                config.bucket_name,
                chunk,
            )
        except (ClientError, BotoCoreError):
            logger.exception(
                "failed to delete objects from s3://%s: %s",
                config.bucket_name,
                chunk,
            )
            raise
