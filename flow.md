# Frontend Data Flow

## Entry Point

`main.tsx` bootstraps three providers in order:
1. `QueryClientProvider` — React Query server state
2. `ThemeProvider` — dark/light/system theme context
3. `RouterProvider` — React Router v6

## Routing

```
/          → AppShell > HistoryPage
/search    → AppShell > SearchPage
```

`AppShell` (`layouts/AppShell.tsx`) renders the sidebar, header, and `<Outlet />`.

## API Layer

```
lib/api/client.ts       Axios instance (base: VITE_API_BASE_URL || /v1, timeout: 10s)
lib/api/capturapi.ts    fetchAssets(page, page_size)   GET /history
                        uploadAsset(file)              POST /upload
                        searchAssets(query, page, ps)  GET /search
```

## State Management

| Layer | Tool | Scope |
|---|---|---|
| Server state | React Query | Fetching, caching, pagination |
| Theme | Context API | App-wide dark/light toggle |
| UI state | `useState` | Page number, modal open, upload progress |

## Hooks

```
useHistoryQuery(page, pageSize)   → useQuery wrapping fetchAssets
useSearchQuery(query, page, ps)   → useQuery (disabled when query is empty)
useUploadMutation()               → useMutation; invalidates history cache on success
useTheme()                        → reads/sets ThemeContext
```

## HistoryPage Data Flow

```
HistoryPage
│  useHistoryQuery(page, PAGE_SIZE)
│  → PaginatedAssetsResponse { images: AssetSummary[], page, page_size, total }
│
├─ loading  → skeleton grid
├─ error    → error state UI
├─ empty    → empty state UI
└─ success  → maps images[] to:
   │
   └─ AssetDialog (asset: AssetSummary)          dialog open/close state
      │  onClick → opens AssetDetailsModal
      │
      ├─ AssetCard (asset: AssetSummary)          card trigger
      │   ├─ AssetCardThumbnail  ← asset.thumbnail_url
      │   ├─ AssetCardBadges     ← asset.ocr_status, asset.variants
      │   ├─ CardTitle           ← getDisplayName(asset)  (filename from s3_key)
      │   ├─ CardDescription     ← formatAssetDate(asset.created_at)
      │   └─ CardContent         ← shortenText(asset.ocr_snippet, 60)
      │
      └─ AssetDetailsModal (asset: AssetSummary)  full detail view
          ├─ AssetPreviewPane    ← thumbnail, metadata
          ├─ AssetSidebarPane    ← full OCR text, variants
          └─ ActionFooter        ← download, copy actions

HistoryPagination
  ← page, total, PAGE_SIZE props from HistoryPage
  → calls setPage on user interaction
```

## Upload Flow

```
UploadButton (in HistoryPage header)
  → useUploadMutation()
  → POST /upload (multipart)
  → on success: invalidates ["assets", "history", *] query keys
  → HistoryPage refetches automatically
```

## Key Types (`lib/types/api.ts`)

```typescript
AssetSummary        { id, created_at, s3_key, thumbnail_url, ocr_snippet, ocr_status, variants }
PaginatedAssetsResponse { images: AssetSummary[], page, page_size, total }
SearchHit           { asset: AssetSummary, matched_text, match_context }
UploadResponse      { asset_id, bucket, s3_key, content_type, size_bytes, ocr_snippet, ocr_status, variants }
```

## Utility Functions

```
getDisplayName(asset)         extracts filename from asset.s3_key
formatAssetDate(created_at)   formats ISO date string for display
shortenText(text, maxLen)     truncates with ellipsis
```
