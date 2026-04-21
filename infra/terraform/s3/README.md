# Captura MVP — S3 (Story 2.1)

Terraform provisions a **public-read** S3 bucket (optional anonymous listing) and a scoped IAM user **`captura-developer`** for console + API access. Details live in `main.tf`, `iam.tf`, and `variables.tf`.

**Operators:** keep Terraform **state** and any exported secrets private.

## Credentials

Use the row in the spreadsheet for your dev credentials.

1. **Sign in to the console:** Open **Console sign-in URL**. Sign in as an **IAM user** using **User name** and **Password** (not the root-account “email only” flow unless told otherwise).

2. **Check uploads in S3:** Open **Console S3 URL**. You should land on the shared bucket; look under prefixes like `uploads/raw/…` after your API uploads.

3. **Run the API locally:** Set **Access key ID** and **Secret key** as environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, and set the region we gave you (e.g. `AWS_DEFAULT_REGION`). The FastAPI app uses these with boto3 to upload to this bucket.

Keep this sheet private; treat keys like passwords.

## Scope of the IAM user

Allowed **only** on this bucket: list/describe bucket, get/put/delete objects (including versions and multipart). No other AWS services.

## Security

MVP-only: public object reads (and optional public listing) are intentional for ease of testing. Do not store sensitive data. Keys will be rotated or revoked after MVP or when someone leaves the project.
