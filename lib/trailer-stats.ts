import type { Trailer, TrailerStatus } from "./types";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function countByStatus(
  trailers: Trailer[]
): Record<TrailerStatus, number> {
  return {
    outbound: trailers.filter((t) => t.status === "outbound").length,
    onsite: trailers.filter((t) => t.status === "onsite").length,
    in_shop: trailers.filter((t) => t.status === "in_shop").length,
  };
}

export function countUpdatedOnDay(trailers: Trailer[], day: Date): number {
  return trailers.filter((t) => isSameDay(new Date(t.updatedAt), day)).length;
}

export function updatedTodayTrend(trailers: Trailer[]): {
  today: number;
  yesterday: number;
  percentChange: number | null;
} {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const today = countUpdatedOnDay(trailers, now);
  const prev = countUpdatedOnDay(trailers, yesterday);

  if (prev === 0) {
    return { today, yesterday: prev, percentChange: today > 0 ? 100 : null };
  }

  return {
    today,
    yesterday: prev,
    percentChange: Math.round(((today - prev) / prev) * 100),
  };
}

export function topLocations(
  trailers: Trailer[],
  limit = 5
): { location: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const trailer of trailers) {
    const location = trailer.location.trim();
    if (!location) continue;
    counts.set(location, (counts.get(location) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function updatesByDay(
  trailers: Trailer[],
  days = 7
): { label: string; count: number }[] {
  const result: { label: string; count: number }[] = [];
  const today = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    result.push({
      label: day.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: countUpdatedOnDay(trailers, day),
    });
  }

  return result;
}

export function sortByUpdatedDesc(trailers: Trailer[]): Trailer[] {
  return [...trailers].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}
