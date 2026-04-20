# S3 bucket for Captura Story 2.1 (MVP): public reads so dev can verify uploads via URL or CLI.
# Scoped IAM user (see iam.tf) is the supported way to access the bucket in the console or programatically.
# Not production-hardened yet — see README for caveats.

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

locals {
  bucket_name = "${var.name_prefix}-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket" "captura" {
  bucket = local.bucket_name

  tags = {
    Project     = "captura"
    Story       = "2.1"
    Environment = "mvp-dev"
  }
}

resource "aws_s3_bucket_public_access_block" "captura" {
  bucket = aws_s3_bucket.captura.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "captura" {
  bucket = aws_s3_bucket.captura.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

data "aws_iam_policy_document" "public_read" {
  statement {
    sid    = "PublicReadObjects"
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.captura.arn}/*",
    ]
  }

  dynamic "statement" {
    for_each = var.enable_public_listing ? [1] : []
    content {
      sid    = "PublicListBucket"
      effect = "Allow"

      principals {
        type        = "*"
        identifiers = ["*"]
      }

      actions = [
        "s3:ListBucket",
      ]

      resources = [
        aws_s3_bucket.captura.arn,
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "captura" {
  bucket = aws_s3_bucket.captura.id
  policy = data.aws_iam_policy_document.public_read.json

  depends_on = [
    aws_s3_bucket_public_access_block.captura,
  ]
}

resource "aws_s3_bucket_cors_configuration" "captura" {
  bucket = aws_s3_bucket.captura.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_versioning" "captura" {
  bucket = aws_s3_bucket.captura.id

  versioning_configuration {
    status = "Enabled"
  }
}
