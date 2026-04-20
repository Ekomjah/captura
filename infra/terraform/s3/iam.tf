# Scoped IAM user for developer / local API: only this bucket; console + programmatic access.
# Secrets (password, access key) are in Terraform state and should be protected accordingly.

data "aws_caller_identity" "current" {}

resource "aws_iam_user" "captura_developer" {
  name = var.developer_iam_user_name
  path = "/"

  tags = {
    Project     = "captura"
    Story       = "2.1"
    Environment = "mvp-dev"
    Purpose     = "S3 bucket scoped developer"
  }

  # Allows `terraform destroy` to remove the user when access keys / login profile exist.
  force_destroy = true
}

data "aws_iam_policy_document" "developer_s3" {
  statement {
    sid    = "ListAndDescribeBucket"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:ListBucketVersions",
    ]

    resources = [
      aws_s3_bucket.captura.arn,
    ]
  }

  statement {
    sid    = "ObjectReadWriteMultipart"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:AbortMultipartUpload",
      "s3:ListMultipartUploadParts",
      "s3:GetObjectVersion",
      "s3:DeleteObjectVersion",
    ]

    resources = [
      "${aws_s3_bucket.captura.arn}/*",
    ]
  }
}

resource "aws_iam_user_policy" "captura_developer_s3" {
  name   = "captura-developer-s3-mvp"
  user   = aws_iam_user.captura_developer.name
  policy = data.aws_iam_policy_document.developer_s3.json
}

resource "aws_iam_access_key" "captura_developer" {
  user = aws_iam_user.captura_developer.name
}

resource "aws_iam_user_login_profile" "captura_developer" {
  user                    = aws_iam_user.captura_developer.name
  password_length         = 24
  password_reset_required = true
}
