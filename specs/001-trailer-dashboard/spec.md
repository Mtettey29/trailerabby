# Feature Specification: Trailer Tracking Dashboard

**Feature Branch**: `001-trailer-dashboard`

**Created**: 2026-06-04

**Status**: Approved

**Input**: Logistics team needs a shared trailer board replacing manual Excel copy/paste.

## User Scenarios & Testing

### User Story 1 - View trailer overview (Priority: P1)

As a dispatcher, I open the dashboard and immediately see total trailers and counts for
Outbound, Onsite, and In Shop, plus three tables listing trailers in each category.

**Why this priority**: Core visibility replaces the spreadsheet overview.

**Independent Test**: Load the page with seeded trailers; verify counts and section placement.

**Acceptance Scenarios**:

1. **Given** 10 trailers with mixed statuses, **When** I open the dashboard, **Then** summary
   counts match the trailers in each section.
2. **Given** a trailer with status Outbound, **When** I view the board, **Then** it appears
   only in the Outbound table.

---

### User Story 2 - Change status with automatic move (Priority: P1)

As a dispatcher, I change a trailer's status and it automatically moves to the correct
section without copy/paste.

**Why this priority**: Primary pain point vs Excel workflow.

**Independent Test**: Change one trailer from Onsite to In Shop; verify it leaves Onsite and
appears in In Shop.

**Acceptance Scenarios**:

1. **Given** a trailer in Onsite, **When** I set status to In Shop and save, **Then** it
   appears in In Shop and not in Onsite.
2. **Given** a successful save, **When** I view the row, **Then** last updated time reflects
   the change.

---

### User Story 3 - Edit trailer details (Priority: P2)

As a dispatcher, I add or edit driver, location, and notes for any trailer.

**Why this priority**: Supports day-to-day coordination beyond status alone.

**Independent Test**: Edit driver and notes on one trailer; refresh and verify persistence.

**Acceptance Scenarios**:

1. **Given** an existing trailer, **When** I update driver, location, and notes, **Then** all
   fields persist after refresh.
2. **Given** the add form, **When** I enter a trailer number and status, **Then** a new row
   appears in the correct section.

---

### User Story 4 - Shared team board (Priority: P2)

As a colleague or supervisor, I see updates made by others without exporting spreadsheets.

**Why this priority**: Three users need one shared view.

**Independent Test**: Update in one browser session; verify another session sees changes within
30 seconds or on manual refresh.

**Acceptance Scenarios**:

1. **Given** two browsers open, **When** user A changes a trailer, **Then** user B sees the
   update on refresh or auto-poll.

---

### Edge Cases

- Empty category shows a friendly "No trailers" message.
- Duplicate trailer numbers: warn but allow (dispatchers may use internal IDs).
- KV unavailable: API returns clear error; UI shows retry message.
- Deleting a trailer removes it from all sections and updates counts.

## Requirements

### Functional Requirements

- **FR-001**: System MUST store trailers with: id, trailerNumber, status, driver, location,
  notes, updatedAt.
- **FR-002**: Status MUST be one of: outbound, onsite, in_shop.
- **FR-003**: UI MUST show three sections filtered by status.
- **FR-004**: UI MUST show summary counts: total, outbound, onsite, in_shop.
- **FR-005**: System MUST support CRUD via API.
- **FR-006**: System MUST set updatedAt on every write server-side.
- **FR-007**: UI MUST poll for updates every 30 seconds and support manual refresh.
- **FR-008**: UI MUST show relative last-updated time with full timestamp on hover.

### Non-Functional Requirements

- **NFR-001**: Desktop-optimized layout.
- **NFR-002**: Deployable on Vercel with Vercel KV.
- **NFR-003**: No authentication in v1 (private URL only).

## Success Criteria

- Dispatchers can replace Excel copy/paste for status changes.
- All three team members see the same board state.
- Deployed URL accessible on Vercel Hobby tier at $0 for expected usage.
