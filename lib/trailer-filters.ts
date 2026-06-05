import { filterTrailers } from "./search-trailers";
import type { Trailer, TrailerStatus } from "./types";
import { TRAILER_STATUSES } from "./types";

export type TrailerFilters = {
  search: string;
  status: TrailerStatus | "all";
  location: string;
};

export const DEFAULT_TRAILER_FILTERS: TrailerFilters = {
  search: "",
  status: "all",
  location: "all",
};

export function parseStatusParam(
  value: string | null
): TrailerStatus | "all" {
  if (!value) return "all";
  return (TRAILER_STATUSES as readonly string[]).includes(value)
    ? (value as TrailerStatus)
    : "all";
}

export function applyTrailerFilters(
  trailers: Trailer[],
  filters: TrailerFilters
): Trailer[] {
  let result = filterTrailers(trailers, filters.search);

  if (filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }

  if (filters.location !== "all") {
    result = result.filter((t) => t.location === filters.location);
  }

  return result;
}

export function uniqueLocations(trailers: Trailer[]): string[] {
  return [
    ...new Set(trailers.map((t) => t.location.trim()).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
}
