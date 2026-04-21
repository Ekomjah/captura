variable "aws_region" {
  type        = string
  description = "AWS region for the Captura bucket (e.g. us-east-1)."
  default     = "us-east-1"
}

variable "name_prefix" {
  type        = string
  description = "Prefix for the bucket name; a short random suffix is appended for global uniqueness."
  default     = "captura-mvp"
}

variable "enable_public_listing" {
  type        = bool
  description = "If true, allows unauthenticated s3:ListBucket (e.g. aws s3 ls --no-sign-request). Disable for slightly stricter public-read-only objects."
  default     = true
}

variable "developer_iam_user_name" {
  type        = string
  description = "IAM user name for bucket-scoped developer access (console + API keys)."
  default     = "captura-developer"
}
