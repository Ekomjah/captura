## Context

This story makes OCR data discoverable through efficient Postgres full-text search and the `GET /v1/search` endpoint.

## What to Expect

### In Scope (MVP)

- Add Postgres full-text index strategy for OCR content (GIN-based).
- Implement query logic for OCR text search.
- Wire and finalize `GET /v1/search` endpoint using indexed search.
- Return search results with:
    - asset metadata
    - matched text/snippet context
    - pagination fields

### Out of Scope

- Semantic/ranking ML search
- Complex typo-tolerant relevance tuning
- Cross-tenant access control layers
- Analytics/reporting on search usage

### Acceptance Criteria

- Search endpoint returns matching assets for known OCR text.
- Query execution uses indexed full-text path (not table-scan baseline).
- Results include enough context for UI highlight display.
- No-results case returns a clean empty list response.

## Timeline

- **45 min:** Migration/index design.
- **1.5-2 hrs:** Search query + endpoint integration.
- **45 min:** Validate with seeded OCR records.
- **30 min:** Pagination and response polish.

## Feedback

### **For the developer**

- Ship indexed search first; optimize ranking later.

### **Reviewer check:**

- [ ]  Check index usage.
- [ ]  Check query safety.
- [ ]  Check stable response shape for frontend rendering.
