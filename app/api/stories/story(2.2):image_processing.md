## Context

This story introduces synchronous image transformation for MVP: generate a WebP variant from the raw upload and store both in S3.

## What to Expect

### In Scope (MVP)

- Integrate Pillow utility to convert the uploaded image to WebP.
- Keep processing synchronous within the upload path for MVP simplicity.
- Upload both objects to S3:
    - original/raw object
    - `.webp` variant object
- Return response metadata that includes both variants.

### Out of Scope

- OCR extraction
- Full quality/optimization tuning
- Async worker architecture
- Broader format matrix unless explicitly needed in MVP

### Acceptance Criteria

- One upload creates exactly two objects in S3:
    - original
    - `.webp` variant
- WebP object is valid and retrievable.
- API response identifies both objects/formats.
- Conversion failures return proper API error (no false success).

## Timeline

- **30-45 min:** Conversion helper with clean function boundary.
- **1.5-2 hrs:** Integrate conversion into upload flow.
- **30-45 min:** Verify 2 objects in S3 from your AWS Console.
- **30 min:** Failure-path handling and response cleanup.

## Feedback

### **For the developer**

- Prioritise correctness and determinism over optimisation.

### **Reviewer check:**

- [x]  Check consistent key hierarchy, response clarity, clean failure semantics.