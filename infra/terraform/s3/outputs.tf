output "bucket_name" {
  description = "S3 bucket name (globally unique)."
  value       = aws_s3_bucket.captura.id
}

output "bucket_arn" {
  description = "S3 bucket ARN."
  value       = aws_s3_bucket.captura.arn
}

output "aws_region" {
  description = "Region where the bucket lives."
  value       = var.aws_region
}

output "public_object_url_base" {
  description = "Virtual-hosted base URL (append /object-key)."
  value       = "https://${aws_s3_bucket.captura.id}.s3.${var.aws_region}.amazonaws.com"
}

output "public_object_url_example" {
  description = "Example URL after uploading uploads/raw/<asset_id>/file.png"
  value       = "https://${aws_s3_bucket.captura.id}.s3.${var.aws_region}.amazonaws.com/uploads/raw/example-asset-id/screenshot.png"
}

output "cli_list_objects_example" {
  description = "When enable_public_listing is true: anonymous list command. Otherwise null (use IAM credentials or the console)."
  value       = var.enable_public_listing ? "aws s3 ls s3://${aws_s3_bucket.captura.id}/ --no-sign-request --region ${var.aws_region}" : null
}

output "console_url" {
  description = "Deep link to this bucket in the S3 console (requires IAM login)."
  value       = "https://s3.console.aws.amazon.com/s3/buckets/${aws_s3_bucket.captura.id}?region=${var.aws_region}"
}

output "enable_public_listing" {
  description = "Whether anonymous s3:ListBucket is allowed (matches variable)."
  value       = var.enable_public_listing
}

output "iam_user_name" {
  description = "IAM user with S3 access limited to this bucket."
  value       = aws_iam_user.captura_developer.name
}

output "iam_user_console_signin_url" {
  description = "Sign in as the IAM user (use with iam_user_name and initial_console_password)."
  value       = "https://${data.aws_caller_identity.current.account_id}.signin.aws.amazon.com/console"
}

output "iam_user_access_key_id" {
  description = "Access key ID for programmatic access (AWS CLI, boto3)."
  value       = aws_iam_access_key.captura_developer.id
}

output "iam_user_secret_access_key" {
  description = "Secret access key (show once; also stored in Terraform state)."
  value       = aws_iam_access_key.captura_developer.secret
  sensitive   = true
}
