## Context

This story implements the first real persistence path: stream uploaded files from FastAPI into the Captura S3 bucket.
Goal is reliability and traceability, not full production hardening.

## What to Expect

### In Scope (MVP)

- Add S3 service module for file uploads from FastAPI.
- Wire `POST /v1/upload` to the S3 service.
- Store raw objects under predictable keys (for example: `uploads/raw/{asset_id}/{filename}`).
- Return upload metadata:
    - `asset_id`, `bucket`, `s3_key`, `content_type`, `size_bytes`, `status`
- Read AWS config from env variables

### Out of Scope

- Presigned download URL lifecycle
- OCR/transcoding
- DB writes and relational records
- Background jobs/retry queue
- Multi-part optimization for very large files

### Acceptance Criteria

- Upload via Swagger or `curl` to `POST /v1/upload` succeeds.
- Uploaded object exists in AWS Console under expected key.
- Returned `s3_key` is non-empty and matches stored object.
- Failure returns clear API error shape (no raw trace output).

### Implementation hint (use `boto3`)

Configure the client from env vars (see shared CSV) for `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_DEFAULT_REGION`. Upload streaming from FastAPI typically uses `upload_fileobj` or `put_object` with a bucket name and key such as `uploads/raw/{asset_id}/{filename}`  e.g:

```python
import os

import boto3

s3 = boto3.client(
    "s3",
    region_name=os.environ["AWS_DEFAULT_REGION"],
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)

# Example: stream upload from a file-like object
# s3.upload_fileobj(fileobj, Bucket=os.environ["CAPTURA_S3_BUCKET"], Key=s3_key)
```

## Timeline

- **1.5-2 hrs:** Upload service + route integration.
- **30-45 min:** AWS Console verification of uploads in `S3`.
- **30 min:** Error handling and logging polish.

## Feedback

### **For the developer**

- Keep this story binary: "Can I upload from API and confirm in S3?"
- Avoid solving future concerns prematurely (image processing/queues/workers/retries).

### **Reviewer check:**

- [x]  Check stable key naming, clean config, safe error handling.