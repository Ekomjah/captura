# Captura — UI Overhaul Design Spec ("Darkroom")

Approved direction: **Nothing-inspired "Darkroom instrument"** — Swiss/Braun/Teenage-Engineering.
Monochrome canvas, type-driven hierarchy, mono ALL-CAPS instrument labels, flat surfaces
(no shadows), **dark-first**. One signal accent: **sharpened cyan**.

> Scope rule: **styles, layout, visual presentation only.** No changes to routing, data
> fetching, state, business logic, or to any component's file name, exports, props, or event
> handlers. Implemented by remapping the existing shadcn token *values* (names unchanged) and
> editing Tailwind class strings.

---

## 1. Fonts (Google Fonts `@import`, no npm packages)

```css
@import url("https://fonts.googleapis.com/css2?family=Doto:wght@400..900&family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap");
```

| Role | Family | Notes |
|------|--------|-------|
| Display (hero only) | **Doto** | 36px+ only, dot-matrix; one moment per screen |
| Body / UI | **Space Grotesk** | 300/400/500/700 |
| Data / Labels | **Space Mono** | IDs, sizes, dimensions, OCR text, ALL-CAPS labels |

Token wiring (keep existing names so nothing breaks):
- `--font-sans` → `"Space Grotesk", "DM Sans", system-ui, sans-serif`
- `--font-heading` → `var(--font-sans)`
- `--font-roboto-mono` → `"Space Mono", "JetBrains Mono", monospace` *(name kept; 6 components reference it)*
- add `--font-mono` → same as above; add `--font-display` → `"Doto", "Space Mono", monospace`

---

## 2. Color tokens — remap shadcn values (names unchanged)

Default theme is **dark**. Values are exact Nothing palette; **cyan signal** = `oklch(0.60 0.14 224)`.

### Dark (`:root` default)
| shadcn token | value | meaning |
|---|---|---|
| `--background` | `#000000` | OLED black |
| `--foreground` | `#E8E8E8` | text-primary |
| `--card` / `--card-foreground` | `#111111` / `#E8E8E8` | surface |
| `--popover` / `--popover-foreground` | `#1A1A1A` / `#E8E8E8` | surface-raised |
| `--primary` / `--primary-foreground` | `oklch(0.60 0.14 224)` / `#000000` | **cyan signal / CTA** |
| `--secondary` / `--secondary-foreground` | `#1A1A1A` / `#E8E8E8` | neutral action |
| `--muted` / `--muted-foreground` | `#111111` / `#999999` | text-secondary |
| `--accent` / `--accent-foreground` | `#1A1A1A` / `#E8E8E8` | hover surface (shadcn menu hover) |
| `--destructive` | `#D71921` | red — errors/delete only |
| `--border` | `#222222` | subtle divider |
| `--input` | `#333333` | border-visible (inputs) |
| `--ring` | `oklch(0.60 0.14 224)` | cyan focus ring |
| `--radius` | `0.5rem` | crisper than current 0.625rem |
| `--sidebar` / `--sidebar-foreground` | `#000000` / `#E8E8E8` | |
| `--sidebar-primary` | `oklch(0.60 0.14 224)` | cyan active |
| `--sidebar-accent` / `--sidebar-border` | `#1A1A1A` / `#222222` | |

### Light (`.dark` inverts back to "printed manual")
| token | value |
|---|---|
| `--background` / `--foreground` | `#F5F5F5` / `#1A1A1A` |
| `--card` / `--popover` | `#FFFFFF` / `#F0F0F0` |
| `--primary` / `--primary-foreground` | `oklch(0.60 0.14 224)` / `#000000` |
| `--secondary` / `--muted` / `--accent` | `#F0F0F0` |
| `--muted-foreground` / `--secondary-foreground` | `#666666` / `#1A1A1A` |
| `--border` / `--input` | `#E8E8E8` / `#CCCCCC` |

> **Dark-first note:** `:root` carries the dark palette; the light values live where the
> system applies them so the existing `light`/`dark`/`system` toggle keeps working unchanged.

### New tokens to add (exposed via `@theme inline` as `--color-*`)
`--surface-raised` `#1A1A1A`/`#F0F0F0` · `--border-visible` `#333`/`#CCC` ·
`--text-display` `#FFF`/`#000` · `--text-secondary` `#999`/`#666` ·
`--text-disabled` `#666`/`#999` · `--success` `#4A9E5C` · `--warning` `#D4A843` ·
`--signal` = cyan (utility: `text-signal` / `bg-signal` / `border-signal`).

---

## 3. Type scale (Tailwind utilities map to these)

| Use | Size / LH / tracking | Font |
|---|---|---|
| Hero (empty-state headline, one big number) | 48px / 1.05 / -0.02em | Doto |
| Page title | 24–30px / 1.2 / -0.01em | Space Grotesk 500 |
| Section heading | 18–20px / 1.3 | Space Grotesk 500 |
| Body | 16px / 1.5 | Space Grotesk 400 |
| Secondary body | 14px / 1.5 | Space Grotesk 400 |
| Caption | 12px / 1.4 / 0.04em | Space Mono |
| **Instrument label** | 11px / 1.2 / 0.08em **ALL CAPS** | Space Mono |

Hierarchy budget per screen: max 2 families, ~3 sizes, 2 weights. Distinction via **spacing/color before new sizes**.

---

## 4. Spacing (8px base — Tailwind native scale already matches)

`4 / 8 / 16 / 24 / 32 / 48 / 64 / 96`. Relationships: tight 4–8 = "belong together",
16 = same group, 32–48 = new section, 64–96 = new context. Page gutter `24px` mobile →
`32px` desktop. Card padding `16–24px`. Prefer spacing over dividers.

---

## 5. Component direction (file-by-file targets)

| Area | Files | Treatment |
|---|---|---|
| Global tokens/fonts | `index.css` | rewrite `@theme` + `:root`/`.dark`, add fonts |
| Buttons | `ui/button.tsx` | Space Mono, ALL-CAPS, 13px, tracking 0.06em, min-h 44; primary = cyan/black; secondary = transparent + `border-visible`; ghost = text-secondary; destructive = transparent + red border/text |
| Badges / tags | `ui/badge.tsx`, `badges/OcrStatusBadge`, `badges/VariantBadge` | mono caps, hairline border, no fill; status color on **value** (done=success, pending=warning, failed=red) |
| Cards | `ui/card.tsx`, `asset-card/*` | `--surface` bg, 1px `--border`, 8–12px radius, no shadow; hover = border brightens to `border-visible` + cyan tint; mono metadata row |
| Inputs | `ui/input.tsx`, `ui/textarea.tsx`, `ui/field.tsx`, `ui/label.tsx`, `layouts/SearchBar` | label above = instrument label; bottom-border or 8px border; focus → cyan ring; search text = Space Mono |
| Sidebar / nav | `layouts/AppShell`, `AppSideBar`, `NavMenu`, `ui/sidebar`, `ui/navigation-menu` | flat, border-separated; nav labels mono caps; active = `text-display` + cyan dot/underline; inactive = text-disabled |
| Modals / sheets | `ui/dialog`, `ui/sheet`, `asset-details/*`, `dialog/*` | backdrop `rgba(0,0,0,.8)`, `--surface` + 1px `border-visible`, 16px radius, no shadow; `[ X ]` ghost close |
| Pagination | `ui/pagination`, `HistoryPagination` | mono caps, `< PREV / NEXT >` instrument styling |
| Empty state | `EmptyHistoryState` | centered, 96px padding, headline `text-secondary`, one line `text-disabled`, optional dot-grid; **no mascot** |
| Loading | `ui/skeleton`, `asset-card/AssetCardSkeleton` | **kept** (don't remove) but restyled flat/mechanical — segmented blocks, no shimmer gradient |
| Toaster | `AppShell` (`sonner`) | **kept** (functional) — restyled minimal mono, no change to wiring |
| Separators | `ui/separator` | 1px `--border` |

### Signature motifs (used sparingly)
- **Dot-grid** background on empty states / hero (`radial-gradient(circle, var(--border-visible) 1px, transparent 1px)` @ 16px).
- **One break per screen** — e.g. a single Doto number or cyan dot — never more.

### Motion
150–250ms, `cubic-bezier(0.25,0.1,0.25,1)` ease-out, opacity over position. No spring/bounce/scale.

---

## 6. Responsiveness
- Sidebar → existing `Sheet` drawer on mobile (already wired via `use-mobile`).
- Asset grid: 1 → 2 → 3 → 4 cols (`sm`/`lg`/`xl`).
- Page gutters shrink on mobile; touch targets ≥ 44px.

---

## 7. Explicit deviations from `nothing-design` (user constraints win)
1. **Skeletons kept** (skill prefers `[LOADING]` text) — removing components violates "keep names/exports". Restyled flat instead.
2. **Toasts kept** (skill says none) — Sonner is functional wiring; restyled, not removed.
3. **Cyan accent** replaces Nothing's red as the *brand* signal; red retained for destructive/error only.

---

## 8. Out of scope
No new npm packages. No routing/data/state/logic changes. No new components or renamed exports.
