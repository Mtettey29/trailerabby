import type { Driver, DriverStatus, Trailer } from "./types";
import { DRIVER_STATUS_LABELS } from "./types";

export type DriverPageFilters = {
  search: string;
  status: DriverStatus | "all";
};

export const DEFAULT_DRIVER_PAGE_FILTERS: DriverPageFilters = {
  search: "",
  status: "all",
};

export const DRIVER_STATUS_CLASS: Record<DriverStatus, string> = {
  on_duty: "border border-[#00ba7c]/30 bg-[#00ba7c]/10 text-[#00ba7c]",
  off_duty: "border border-[#2f3336] bg-[#16181c] text-[#e7e9ea]",
  unavailable: "border border-[#f4212e]/30 bg-[#f4212e]/10 text-[#f4212e]",
};

export function driverStats(drivers: Driver[]) {
  const total = drivers.length;
  const onDuty = drivers.filter((d) => d.status === "on_duty").length;
  const offDuty = drivers.filter((d) => d.status === "off_duty").length;
  const unavailable = drivers.filter((d) => d.status === "unavailable").length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return {
    total,
    onDuty,
    offDuty,
    unavailable,
    onDutyPct: pct(onDuty),
    offDutyPct: pct(offDuty),
    unavailablePct: pct(unavailable),
  };
}

function namesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function getDriverAssignment(
  driver: Driver,
  trailers: Trailer[]
): string {
  const fromTrailer = trailers.find(
    (trailer) =>
      trailer.driver.trim() &&
      namesMatch(trailer.driver, driver.name) &&
      trailer.status !== "in_shop"
  );
  if (fromTrailer) return fromTrailer.trailerNumber;
  return driver.currentAssignment.trim() || "";
}

export function getDriverLastActive(
  driver: Driver,
  trailers: Trailer[]
): string {
  const assignment = trailers.find(
    (trailer) =>
      trailer.driver.trim() && namesMatch(trailer.driver, driver.name)
  );
  if (assignment) return assignment.updatedAt;
  return driver.lastActiveAt;
}

export function formatDriverLastActive(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDriverName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name.trim();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${parts[0]} ${lastInitial}.`;
}

export function applyDriverFilters(
  drivers: Driver[],
  filters: DriverPageFilters
): Driver[] {
  const search = filters.search.trim().toLowerCase();

  return drivers.filter((driver) => {
    if (filters.status !== "all" && driver.status !== filters.status) {
      return false;
    }
    if (!search) return true;

    const haystack = [
      driver.name,
      driver.driverId,
      driver.phone,
      DRIVER_STATUS_LABELS[driver.status],
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}
