# Frontend Skill

## Stack
- React 19 + TypeScript + Vite 8, package name `frontend` (pnpm workspace)
- Tailwind v4 + shadcn primitives on Radix UI
- React Query (server state) + React Router v7 (routing)
- axios for HTTP; everything lives under `app/frontend/src/`
- Path alias `@` → `src` (configured in `vite.config.ts` + `tsconfig`)

## Layout
- `main.tsx` — bootstraps providers in order: `QueryClientProvider` →
  `ThemeProvider` → `RouterProvider`.
- `routes/routes.tsx` — `/` → HistoryPage, `/search` → SearchPage, both inside
  `layouts/AppShell.tsx`.
- `features/` — feature UI (history, search, upload). Each feature owns its
  components; cross-cutting pieces live in `features/components/`.
- `components/ui/` — shadcn-generated primitives. Don't hand-edit these for
  feature logic; compose them in `features/`.
- `hooks/queries/` + `hooks/mutations/` — React Query wrappers.
- `lib/api/` — `client.ts` (axios), `capturapi.ts` (typed calls), `getApiError.ts`.
- `lib/types/api.ts` — shared API types.
- `lib/utils/` — `assetHelpers`, `dateFormatter`, `fileSizeFormatter`, `textShortener`.

## Conventions
- Server state goes through React Query hooks, never raw `useState` + `useEffect`
  fetching. UI-only state (page number, modal open, upload progress) uses `useState`.
- All HTTP goes through `lib/api/capturapi.ts` (`fetchAssets`, `uploadAsset`,
  `searchAssets`) — components don't call axios directly.
- Mutations invalidate the relevant query keys on success (e.g. the upload
  mutation invalidates the history cache so the grid refetches).
- Keep `lib/types/api.ts` in sync with the backend `schema/` responses; the
  types mirror `UploadResponse`, `AssetSummary`, `PaginatedAssetsResponse`,
  `SearchHit`.
- Import via the `@` alias, not deep relative paths.
- Theme is Context-based (`context/ThemeContext.tsx`, `useTheme`); search filter
  state lives in `context/SearchContext.tsx`.

## When adding a feature
1. Add/extend the typed call in `lib/api/capturapi.ts` and types in
   `lib/types/api.ts`.
2. Add a hook in `hooks/queries/` or `hooks/mutations/`.
3. Build the UI in `features/...`, composing `components/ui/` primitives.
4. Wire it into `routes/routes.tsx` if it's a new page.

## Run / build
```bash
make dev-web                    # or: pnpm dev:web  (Vite, --host)
pnpm --filter frontend lint     # eslint
pnpm --filter frontend build    # tsc -b && vite build
```
Dev proxy: Vite forwards `/v1` → `http://localhost:8000`, so leave
`VITE_API_BASE_URL` empty when running the API locally (`make dev-api`).
