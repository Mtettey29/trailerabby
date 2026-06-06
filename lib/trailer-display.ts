import { filterTrailers } from "./search-trailers";
import type { Trailer, TrailerStatus } from "./types";
import { TRAILER_STATUSES } from "./types";
import { deriveMovementType, MOVEMENT_TYPE_LABELS } from "./movements";

export const TRAILER_TYPES = [
  "Dry Van",
  "Reefer",
  "Flatbed",
  "Tanker",
  "Other",
] as const;

export type TrailerType = (typeof TRAILER_TYPES)[number];

export type FleetDisplayStatus =
  | "in_transit"
  | "at_location"
  | "under_maintenance"
  | "out_of_service";

export type TrailerPageFilters = {
  search: string;
  status: FleetDisplayStatus | "all";
  type: TrailerType | "all";
};

export const DEFAULT_TRAILER_PAGE_FILTERS: TrailerPageFilters = {
  search: "",
  status: "all",
  type: "all",
};

const OOS_PATTERN = /\b(out of service|oos|retired|decommissioned)\b/i;

export function isOutOfService(trailer: Trailer): boolean {
  return OOS_PATTERN.test(trailer.notes);
}

export function getFleetDisplayStatus(trailer: Trailer): FleetDisplayStatus {
  if (isOutOfService(trailer)) return "out_of_service";
  if (trailer.status === "outbound") return "in_transit";
  if (trailer.status === "onsite") return "at_location";
  return "under_maintenance";
}

export function deriveTrailerType(trailer: Trailer): TrailerType {
  const description = `${trailer.description} ${trailer.notes}`.toLowerCase();
  if (description.includes("reefer")) return "Reefer";
  if (description.includes("flatbed") || description.includes("flat")) {
    return "Flatbed";
  }
  if (description.includes("tank")) return "Tanker";

  const notes = trailer.notes.toLowerCase();
  const typeMatch = notes.match(/type:\s*(\w+)/i);
  if (typeMatch) {
    const raw = typeMatch[1].toLowerCase();
    if (raw.includes("reefer")) return "Reefer";
    if (raw.includes("flat")) return "Flatbed";
    if (raw.includes("tank")) return "Tanker";
    if (raw.includes("van") || raw.includes("dry")) return "Dry Van";
  }

  const num = trailer.trailerNumber.toUpperCase();
  if (num.startsWith("JR")) return "Reefer";
  if (num.startsWith("GT")) return "Flatbed";
  if (num.startsWith("HT")) return "Dry Van";
  return "Dry Van";
}

export function formatTrailerTypeLabel(trailer: Trailer): string {
  const type = deriveTrailerType(trailer);
  const description = trailer.description.trim();
  if (description) return description;
  if (type === "Dry Van") return "Dry Van 53'";
  if (type === "Reefer") return "Reefer 53'";
  if (type === "Flatbed") return "Flatbed 48'";
  return type;
}

export function formatLastMovement(trailer: Trailer): string {
  const movement = MOVEMENT_TYPE_LABELS[deriveMovementType(trailer)];
  const date = new Date(trailer.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${movement} · ${date}`;
}

export function formatNextDueService(trailer: Trailer): string {
  if (getFleetDisplayStatus(trailer) !== "under_maintenance") {
    const due = new Date(trailer.updatedAt);
    due.setDate(due.getDate() + 90);
    if (due > new Date()) {
      return due.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return "—";
  }

  const due = new Date(trailer.updatedAt);
  due.setDate(due.getDate() + 30);
  return due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fleetStats(trailers: Trailer[]) {
  const total = trailers.length;
  const inTransit = trailers.filter(
    (t) => getFleetDisplayStatus(t) === "in_transit"
  ).length;
  const atLocation = trailers.filter(
    (t) => getFleetDisplayStatus(t) === "at_location"
  ).length;
  const underMaintenance = trailers.filter(
    (t) => getFleetDisplayStatus(t) === "under_maintenance"
  ).length;
  const outOfService = trailers.filter(
    (t) => getFleetDisplayStatus(t) === "out_of_service"
  ).length;

  const pct = (n: number) =>
    total > 0 ? Math.round((n / total) * 100) : 0;

  return {
    total,
    inTransit,
    atLocation,
    underMaintenance,
    outOfService,
    inTransitPct: pct(inTransit),
    atLocationPct: pct(atLocation),
    underMaintenancePct: pct(underMaintenance),
    outOfServicePct: pct(outOfService),
  };
}

export function parseFleetStatusParam(
  value: string | null
): TrailerPageFilters["status"] {
  if (!value || value === "all") return "all";
  const allowed: FleetDisplayStatus[] = [
    "in_transit",
    "at_location",
    "under_maintenance",
    "out_of_service",
  ];
  if ((allowed as readonly string[]).includes(value)) {
    return value as FleetDisplayStatus;
  }
  if ((TRAILER_STATUSES as readonly string[]).includes(value)) {
    const map: Record<TrailerStatus, FleetDisplayStatus> = {
      outbound: "in_transit",
      onsite: "at_location",
      in_shop: "under_maintenance",
    };
    return map[value as TrailerStatus];
  }
  return "all";
}

function searchTrailersPage(trailers: Trailer[], query: string): Trailer[] {
  const q = query.trim().toLowerCase();
  if (!q) return trailers;

  return trailers.filter((trailer) => {
    if (filterTrailers([trailer], query).length > 0) return true;
    if (deriveTrailerType(trailer).toLowerCase().includes(q)) return true;
    if (
      FLEET_STATUS_LABELS[getFleetDisplayStatus(trailer)]
        .toLowerCase()
        .includes(q)
    ) {
      return true;
    }
    return false;
  });
}

export function applyTrailerPageFilters(
  trailers: Trailer[],
  filters: TrailerPageFilters
): Trailer[] {
  let result = searchTrailersPage(trailers, filters.search);

  if (filters.status !== "all") {
    result = result.filter(
      (t) => getFleetDisplayStatus(t) === filters.status
    );
  }

  if (filters.type !== "all") {
    result = result.filter((t) => deriveTrailerType(t) === filters.type);
  }

  return result;
}

export const FLEET_STATUS_LABELS: Record<FleetDisplayStatus, string> = {
  in_transit: "In Transit",
  at_location: "At Location",
  under_maintenance: "Under Maintenance",
  out_of_service: "Out of Service",
};

export const FLEET_STATUS_CLASS: Record<FleetDisplayStatus, string> = {
  in_transit:
    "border border-[#1d9bf0]/30 bg-[#1d9bf0]/15 text-[#1d9bf0]",
  at_location:
    "border border-[#00ba7c]/30 bg-[#00ba7c]/15 text-[#00ba7c]",
  under_maintenance:
    "border border-[#ffad1f]/30 bg-[#ffad1f]/15 text-[#ffad1f]",
  out_of_service:
    "border border-[#71767b]/30 bg-[#71767b]/15 text-[#71767b]",
};

export type FleetChartBucket =
  | "in_transit"
  | "at_location"
  | "under_maintenance"
  | "other";

export const FLEET_CHART_LABELS: Record<FleetChartBucket, string> = {
  in_transit: "In Transit",
  at_location: "At Location",
  under_maintenance: "Under Maintenance",
  other: "Other",
};

export const FLEET_CHART_COLORS: Record<FleetChartBucket, string> = {
  in_transit: "#1d9bf0",
  at_location: "#00ba7c",
  under_maintenance: "#ffad1f",
  other: "#71767b",
};

export function fleetChartCounts(
  trailers: Trailer[]
): Record<FleetChartBucket, number> {
  const counts: Record<FleetChartBucket, number> = {
    in_transit: 0,
    at_location: 0,
    under_maintenance: 0,
    other: 0,
  };

  for (const trailer of trailers) {
    const status = getFleetDisplayStatus(trailer);
    if (status === "out_of_service") {
      counts.other += 1;
    } else {
      counts[status] += 1;
    }
  }

  return counts;
}
