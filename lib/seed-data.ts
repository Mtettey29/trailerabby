import type { Trailer } from "./types";
import {
  DISPATCH_BY_TRAILER_NUMBER,
  normalizeTrailerAsset,
} from "./trailer-assets";

const DISPATCH_UPDATED_AT = "2026-06-04T12:00:00.000Z";

/** Dispatch overrides from trailer_movement_sheet.html — asset fields filled at seed time from CSV */
export const MOVEMENT_SHEET_TRAILERS: Trailer[] = Object.entries(
  DISPATCH_BY_TRAILER_NUMBER
).map(([trailerNumber, dispatch]) =>
  normalizeTrailerAsset({
    id: `asset-${trailerNumber.toLowerCase()}`,
    trailerNumber,
    notes: "",
    updatedAt: DISPATCH_UPDATED_AT,
    ...dispatch,
  })
);
