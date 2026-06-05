# Implementation Plan: Trailer Tracking Dashboard

**Branch**: `001-trailer-dashboard` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

## Summary

Build a Next.js dashboard on Vercel where ~10 trailers are tracked in three status-driven
sections (Outbound, Onsite, In Shop). Shared state via Vercel KV; status change automatically
moves rows between sections. Desktop-first, no auth.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 20+

**Primary Dependencies**: Next.js 15 (App Router), Tailwind CSS, @upstash/redis

**Storage**: Upstash Redis via Vercel (key `trailers`); local JSON fallback for dev

**Testing**: Manual acceptance per spec scenarios; `npm run build` for CI

**Target Platform**: Vercel serverless, desktop browsers

**Constraints**: ~10 trailers, 3 users, 30s polling, no auth v1

## Constitution Check

- Simplicity: single KV key, four API routes, one page — PASS
- Desktop-first: table layout — PASS
- Single source of truth: status drives placement — PASS
- Minimal deps: Next + KV only — PASS
- Trustworthy timestamps: server-side updatedAt — PASS

## Project Structure

```text
app/
├── api/trailers/
│   ├── route.ts              # GET, POST
│   └── [id]/route.ts         # PATCH, DELETE
├── layout.tsx
├── page.tsx                  # Dashboard
└── globals.css
components/
├── SummaryCards.tsx
├── TrailerSection.tsx
├── TrailerTable.tsx
└── TrailerModal.tsx
lib/
├── trailers.ts               # KV + dev fallback
└── types.ts
specs/001-trailer-dashboard/
├── spec.md
├── plan.md
└── tasks.md
```

## API Contracts

| Method | Route | Body | Response |
|--------|-------|------|----------|
| GET | /api/trailers | — | `{ trailers: Trailer[] }` |
| POST | /api/trailers | `{ trailerNumber, status, driver?, location?, notes? }` | `{ trailer }` |
| PATCH | /api/trailers/[id] | partial fields | `{ trailer }` |
| DELETE | /api/trailers/[id] | — | `{ ok: true }` |

## Deployment

1. Push to GitHub, import in Vercel.
2. Create Vercel KV store, link env vars.
3. Deploy; share URL with team.

See `.env.example` for required variables.
