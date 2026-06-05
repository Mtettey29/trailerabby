# Trailer Abby — Agent Guide

Use this file as the master prompt for Cursor Agent and other AI coding tools.

## Context files (read first)

- Product spec: [specs/001-trailer-dashboard/spec.md](specs/001-trailer-dashboard/spec.md)
- Constitution: [.specify/memory/constitution.md](.specify/memory/constitution.md)
- Main UI: [components/trailer-board.tsx](components/trailer-board.tsx)
- Storage: [lib/trailers.ts](lib/trailers.ts)

## Current focus: UI polish (v1)

Polish efferd shell + trailer board cohesion; sidebar scroll-to-section; no new features unless specced.

---

## Master development prompt

You are building **Trailer Abby** — a shared trailer tracking dashboard for a small logistics dispatch team (dispatcher, colleague, supervisor). ~10 trailers. Desktop-first. Replaces manual Excel copy/paste.

### Product goal

Dispatchers track trailers in three status-driven sections. Changing status automatically moves a trailer between sections — no duplicate rows, no manual copy/paste.

**Statuses (only these):**

- `outbound` — on the road
- `onsite` — stationary at a location
- `in_shop` — broken / in repair

**Fields per trailer:** trailerNumber (required), status, driver, location, notes, updatedAt (server-side on every write).

### Users and constraints

- 3 people on office desktops; shared live board
- No login in v1 — private URL only
- Do NOT add auth, mobile layouts, ELD integration, or audit logs unless explicitly requested
- ~10 trailers — keep scope minimal

### Tech stack (do not replace)

- Next.js 15 App Router, TypeScript, Tailwind v4
- shadcn/ui (base-nova) + Lucide icons
- @efferd/dashboard-1 shell: AppShell, AppSidebar, AppHeader
- Upstash Redis in production; `.data/trailers.json` locally without Redis env vars
- Deploy: Vercel Hobby

### Design system

X/Twitter-inspired dark UI: black `#000` background, `#2f3336` borders, `#e7e9ea` text, `#71767b` muted, white Lucide icons (`strokeWidth={1.75}`), white rounded-full primary CTA. Status accents: outbound `#1d9bf0`, onsite `#00ba7c`, in shop `#ffad1f`.

### Architecture

```
app/page.tsx → components/dashboard.tsx → AppShell + TrailerBoard
TrailerBoard → SummaryCards, TrailerSection, TrailerTable, TrailerModal
API: app/api/trailers | lib/trailers.ts | lib/types.ts
```

### Implementation rules

1. Read spec and constitution before behavior changes
2. Minimal diffs; match existing conventions (`@/` imports, shadcn components)
3. Run `npm run build` before claiming done
4. Do not install Spec Kit CLI unless asked

### Acceptance checklist

- Trailer in exactly one section per status
- Status change moves row; counts stay in sync
- `updatedAt` on every server write
- Shared board updates within 30s poll or Refresh
- Black UI, white icons, desktop tables
- `npm run build` passes

---

## Shorter prompts for focused sessions

**UI polish only:**

```
Polish Trailer Abby's UI to feel cohesive: black X/Twitter theme, efferd AppShell sidebar, shadcn components, white Lucide icons. Work in components/trailer-board.tsx, TrailerSection.tsx, TrailerTable.tsx, app-sidebar.tsx. Remove unused efferd demo components. Run npm run build. Do not add features or auth.
```

**Deploy to Vercel:**

```
Prepare Trailer Abby for Vercel production: verify Upstash Redis integration in lib/trailers.ts, confirm .env.example is complete, ensure npm run build passes, and give me step-by-step deploy instructions. No new features.
```

**Spec Kit workflow (Cursor chat):**

```
/speckit.specify [paste product description]
/speckit.plan Next.js 15, shadcn, efferd dashboard-1 shell, Upstash Redis, Vercel
/speckit.tasks
/speckit.implement
```
