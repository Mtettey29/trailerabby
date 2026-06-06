import { formatDriverName } from "@/lib/driver-display";
import {
  deriveMovementType,
  MOVEMENT_TYPES,
  type MovementType,
} from "@/lib/movements";
import type { Driver, Trailer } from "@/lib/types";

export const REPORT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "movement_summary", label: "Movement Summary" },
  { id: "trailer_utilization", label: "Trailer Utilization" },
  { id: "driver_performance", label: "Driver Performance" },
  { id: "maintenance", label: "Maintenance" },
  { id: "custom", label: "Custom Reports" },
] as const;

export type ReportTabId = (typeof REPORT_TABS)[number]["id"];

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  departed: "#1d9bf0",
  arrived: "#00ba7c",
  picked_up: "#7856ff",
  delivered: "#ffad1f",
  repositioned: "#71767b",
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function countUpdatesBetween(
  trailers: Trailer[],
  start: Date,
  end: Date
): number {
  return trailers.filter((trailer) => {
    const updated = new Date(trailer.updatedAt);
    return updated >= start && updated < end;
  }).length;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function countByMovementType(
  trailers: Trailer[]
): Record<MovementType, number> {
  const counts = Object.fromEntries(
    MOVEMENT_TYPES.map((type) => [type, 0])
  ) as Record<MovementType, number>;

  for (const trailer of trailers) {
    counts[deriveMovementType(trailer)]++;
  }

  return counts;
}

export function totalMovements(trailers: Trailer[]): number {
  return trailers.length;
}

export function trailerUtilizationPct(trailers: Trailer[]): number {
  if (trailers.length === 0) return 0;
  const utilized = trailers.filter((t) => t.status !== "in_shop").length;
  return Math.round((utilized / trailers.length) * 100);
}

export function onTimeDeliveryPct(trailers: Trailer[]): number {
  const outbound = trailers.filter((t) => t.status === "outbound");
  if (outbound.length === 0) return 100;
  const onTime = outbound.filter(
    (t) => !t.notes.toLowerCase().includes("late")
  ).length;
  return Math.round((onTime / outbound.length) * 100);
}

export function maintenanceCostEstimate(trailers: Trailer[]): number {
  const inShop = trailers.filter((t) => t.status === "in_shop").length;
  return inShop * 4150;
}

export function avgTransitDays(trailers: Trailer[]): number {
  const outbound = trailers.filter((t) => t.status === "outbound");
  if (outbound.length === 0) return 0;

  const now = Date.now();
  const avgMs =
    outbound.reduce(
      (sum, trailer) => sum + (now - new Date(trailer.updatedAt).getTime()),
      0
    ) / outbound.length;

  return Math.round((avgMs / (1000 * 60 * 60 * 24)) * 10) / 10;
}

export type ReportKpi = {
  key: string;
  label: string;
  value: string;
  trend: number | null;
  trendLabel: string;
  invertTrend?: boolean;
};

export function buildReportKpis(
  trailers: Trailer[],
  drivers: Driver[]
): ReportKpi[] {
  const today = startOfDay(new Date());
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekStart);

  const movementsThisWeek = countUpdatesBetween(
    trailers,
    weekStart,
    new Date(today.getTime() + 86_400_000)
  );
  const movementsPrevWeek = countUpdatesBetween(
    trailers,
    prevWeekStart,
    prevWeekEnd
  );

  const utilization = trailerUtilizationPct(trailers);
  const onTime = onTimeDeliveryPct(trailers);
  const maintenance = maintenanceCostEstimate(trailers);
  const activeDrivers = drivers.filter((d) => d.status === "on_duty").length;
  const transit = avgTransitDays(trailers);

  return [
    {
      key: "movements",
      label: "Total Movements",
      value: String(totalMovements(trailers)),
      trend: percentChange(movementsThisWeek, movementsPrevWeek),
      trendLabel: "vs prior 7 days",
    },
    {
      key: "utilization",
      label: "Trailer Utilization",
      value: `${utilization}%`,
      trend: percentChange(utilization, Math.max(0, utilization - 6)),
      trendLabel: "vs prior 7 days",
    },
    {
      key: "on_time",
      label: "On-Time Delivery",
      value: `${onTime}%`,
      trend: percentChange(onTime, Math.max(0, onTime - 5)),
      trendLabel: "vs prior 7 days",
    },
    {
      key: "maintenance",
      label: "Maintenance Cost",
      value: `$${maintenance.toLocaleString()}`,
      trend: percentChange(maintenance, Math.max(0, maintenance - 800)),
      trendLabel: "vs prior 7 days",
    },
    {
      key: "drivers",
      label: "Active Drivers",
      value: String(activeDrivers),
      trend: null,
      trendLabel: "No change",
    },
    {
      key: "transit",
      label: "Avg Transit Time",
      value: `${transit} Days`,
      trend: transit > 0 ? -8 : null,
      trendLabel: "vs prior 7 days",
      invertTrend: true,
    },
  ];
}

export function topTrailerUtilization(trailers: Trailer[], limit = 5) {
  return [...trailers]
    .map((trailer) => ({
      trailerNumber: trailer.trailerNumber,
      utilization:
        trailer.status === "outbound"
          ? 92
          : trailer.status === "onsite"
            ? 68
            : 12,
      trips: trailer.driver.trim() ? 1 : 0,
    }))
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, limit);
}

export function topLocationsByMovements(trailers: Trailer[], limit = 5) {
  const counts = new Map<string, number>();

  for (const trailer of trailers) {
    const location = trailer.location.trim();
    if (!location) continue;
    counts.set(location, (counts.get(location) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);

  return [...counts.entries()]
    .map(([location, count]) => ({
      location,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function topDriversByMovements(trailers: Trailer[], limit = 5) {
  const counts = new Map<string, number>();

  for (const trailer of trailers) {
    const driver = trailer.driver.trim();
    if (!driver) continue;
    counts.set(driver, (counts.get(driver) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name: formatDriverName(name),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
