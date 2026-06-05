<!--
Sync Impact Report
Version change: template → 1.0.0
Principles: Simplicity, Desktop-First, Shared Truth, Minimal Dependencies, Ship Fast
Templates: ✅ spec/plan/tasks aligned
-->

# Trailer Abby Constitution

## Core Principles

### I. Simplicity Over Features

Every feature MUST solve a real dispatcher pain point. No ELD integration, auth, or mobile
layouts in v1 unless explicitly specced. YAGNI applies to ~10 trailers and 3 users.

### II. Desktop-First Operations

UI MUST be optimized for office desktop use: readable tables, clear status sections, minimal
clicks to change a trailer's status. Mobile is out of scope for v1.

### III. Single Source of Truth

Trailer status is the sole driver of which section (Outbound, Onsite, In Shop) a row appears
in. No duplicate records, no manual copy/paste between categories.

### IV. Minimal Dependencies

Prefer Next.js on Vercel + Vercel KV. Avoid heavy databases, ORMs, and frameworks beyond what
the deployment target requires.

### V. Trustworthy Timestamps

Every write MUST set `updatedAt` server-side so dispatchers can see when a trailer was last
changed.

## Additional Constraints

- Shared board accessible via private URL (no user accounts in v1).
- Data volume: ~10 trailers, 3 concurrent desktop users.
- Hosting: Vercel Hobby + Vercel KV free tier.

## Development Workflow

1. Spec → Plan → Tasks → Implement (Spec Kit SDD).
2. Changes that expand scope require an updated spec before implementation.
3. Keep the dashboard deployable at all times on Vercel.

## Governance

This constitution guides all technical decisions. Amendments require updating this file and
bumping the version below. Complexity beyond these principles MUST be justified in the plan.

**Version**: 1.0.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-04
