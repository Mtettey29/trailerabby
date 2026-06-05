import type { Trailer } from "./types";

export function filterTrailers(trailers: Trailer[], query: string): Trailer[] {
  const q = query.trim().toLowerCase();
  if (!q) return trailers;

  return trailers.filter(
    (t) =>
      t.trailerNumber.toLowerCase().includes(q) ||
      t.driver.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
  );
}
