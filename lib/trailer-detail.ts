import {
  deriveMovementType,
  formatDriverShort,
  MOVEMENT_TYPE_LABELS,
  movementFromLocation,
} from "./movements";
import { homeLocationFromBranch } from "./trailer-assets";
import {
  deriveTrailerType,
  formatNextDueService,
  formatTrailerTypeLabel,
  getFleetDisplayStatus,
  type TrailerType,
} from "./trailer-display";
import type {
  MaintenanceService,
  SystemAlert,
  Trailer,
} from "./types";
import {
  MAINTENANCE_SERVICE_STATUS_LABELS,
  MAINTENANCE_SERVICE_TYPE_LABELS,
  STATUS_LABELS,
} from "./types";

export type TrailerDetailTabId =
  | "overview"
  | "movements"
  | "maintenance"
  | "documents"
  | "alerts"
  | "history";

export type TrailerMovementRow = {
  id: string;
  at: string;
  type: string;
  from: string;
  to: string;
  driver: string;
  status: string;
  statusClass: string;
  isCurrent: boolean;
};

export type TrailerDetailMeta = {
  type: TrailerType;
  typeLabel: string;
  fleetStatus: ReturnType<typeof getFleetDisplayStatus>;
  vin: string;
  licensePlate: string;
  lastInspection: string;
  nextServiceDue: string;
  totalMileage: number;
  totalMovements: number;
  inServiceSince: string;
  homeLocation: string;
  currentLocation: string;
  displayId: string;
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseNoteField(notes: string, key: string): string | null {
  const match = notes.match(new RegExp(`${key}:\\s*([^\\n]+)`, "i"));
  return match?.[1]?.trim() ?? null;
}

export function deriveVin(trailer: Trailer): string {
  if (trailer.vin.trim()) return trailer.vin.trim();
  const fromNotes = parseNoteField(trailer.notes, "vin");
  if (fromNotes) return fromNotes;
  return "—";
}

export function deriveLicensePlate(trailer: Trailer): string {
  if (trailer.licensePlate.trim()) return trailer.licensePlate.trim();
  const fromNotes = parseNoteField(trailer.notes, "plate");
  if (fromNotes) return fromNotes;
  return "—";
}

export function deriveMileage(trailer: Trailer): number {
  const fromNotes = parseNoteField(trailer.notes, "mileage");
  if (fromNotes) {
    const parsed = Number.parseInt(fromNotes.replace(/\D/g, ""), 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 45_000 + (hashString(trailer.trailerNumber) % 95_000);
}

export function deriveHomeLocation(trailer: Trailer): string {
  const fromNotes = parseNoteField(trailer.notes, "home");
  if (fromNotes) return fromNotes;
  if (trailer.branchCode.trim()) {
    return homeLocationFromBranch(trailer.branchCode);
  }
  if (trailer.location.trim()) return trailer.location.trim();
  return "Hanover, MD";
}

export function deriveCurrentLocation(trailer: Trailer): string {
  if (trailer.status === "in_shop") return "In shop";
  if (trailer.status === "outbound" && !trailer.location.trim()) {
    return "On the move";
  }
  return trailer.location.trim() || "—";
}

export function deriveInServiceSince(trailer: Trailer): string {
  const fromNotes = parseNoteField(trailer.notes, "in service");
  if (fromNotes) return fromNotes;
  if (trailer.vehicleYear > 0) {
    return formatShortDate(`${trailer.vehicleYear}-01-15T12:00:00.000Z`);
  }
  const date = new Date(trailer.updatedAt);
  date.setFullYear(date.getFullYear() - 2 - (hashString(trailer.id) % 3));
  date.setMonth(hashString(trailer.trailerNumber) % 12);
  return formatShortDate(date.toISOString());
}

export function deriveLastInspection(
  trailer: Trailer,
  services: MaintenanceService[]
): string {
  const completed = services
    .filter(
      (service) =>
        service.trailerNumber === trailer.trailerNumber &&
        service.status === "completed"
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

  if (completed) return formatShortDate(completed.updatedAt);

  const date = new Date(trailer.updatedAt);
  date.setDate(date.getDate() - 30 - (hashString(trailer.trailerNumber) % 60));
  return formatShortDate(date.toISOString());
}

export function buildTrailerDetailMeta(
  trailer: Trailer,
  services: MaintenanceService[]
): TrailerDetailMeta {
  const type = deriveTrailerType(trailer);

  return {
    type,
    typeLabel: formatTrailerTypeLabel(trailer),
    fleetStatus: getFleetDisplayStatus(trailer),
    vin: deriveVin(trailer),
    licensePlate: deriveLicensePlate(trailer),
    lastInspection: deriveLastInspection(trailer, services),
    nextServiceDue: formatNextDueService(trailer),
    totalMileage: deriveMileage(trailer),
    totalMovements: 8 + (hashString(trailer.trailerNumber) % 40),
    inServiceSince: deriveInServiceSince(trailer),
    homeLocation: deriveHomeLocation(trailer),
    currentLocation: deriveCurrentLocation(trailer),
    displayId: trailer.trailerNumber,
  };
}

export function currentMovementEndpoints(trailer: Trailer): {
  origin: string;
  originSub: string;
  destination: string;
  destinationSub: string;
  distanceMi: number;
  etaHours: number;
  etaMinutes: number;
} {
  const home = deriveHomeLocation(trailer);

  if (trailer.status === "outbound") {
    const destination = trailer.location.trim() || "En route";
    return {
      origin: home,
      originSub: "Origin",
      destination,
      destinationSub: trailer.location.trim() ? "Destination" : "Pending",
      distanceMi: 80 + (hashString(trailer.trailerNumber) % 320),
      etaHours: 2 + (hashString(trailer.id) % 6),
      etaMinutes: 10 + (hashString(trailer.trailerNumber) % 50),
    };
  }

  if (trailer.status === "onsite") {
    const at = trailer.location.trim() || home;
    return {
      origin: home,
      originSub: "Previous",
      destination: at,
      destinationSub: "Current location",
      distanceMi: 0,
      etaHours: 0,
      etaMinutes: 0,
    };
  }

  return {
    origin: home,
    originSub: "From",
    destination: "Shop — Hanover, MD",
    destinationSub: "In shop",
    distanceMi: 12,
    etaHours: 0,
    etaMinutes: 45,
  };
}

export function movementStatusClass(trailer: Trailer): string {
  if (trailer.status === "outbound") {
    return "border border-[#1d9bf0]/30 bg-[#1d9bf0]/10 text-[#1d9bf0]";
  }
  if (trailer.status === "onsite") {
    return "border border-[#00ba7c]/30 bg-[#00ba7c]/10 text-[#00ba7c]";
  }
  return "border border-[#ffad1f]/30 bg-[#ffad1f]/10 text-[#ffad1f]";
}

export function movementStatusLabel(trailer: Trailer): string {
  if (trailer.status === "outbound") return "In Transit";
  if (trailer.status === "onsite") return "At Location";
  return "In Shop";
}

export function buildMovementHistory(trailer: Trailer): TrailerMovementRow[] {
  const movementType = deriveMovementType(trailer);
  const { from, to } = movementFromLocation(trailer);
  const current: TrailerMovementRow = {
    id: `${trailer.id}-current`,
    at: trailer.updatedAt,
    type: MOVEMENT_TYPE_LABELS[movementType],
    from: from === "—" ? deriveHomeLocation(trailer) : from,
    to: to === "—" ? deriveCurrentLocation(trailer) : to,
    driver: trailer.driver.trim() ? formatDriverShort(trailer.driver) : "—",
    status: movementStatusLabel(trailer),
    statusClass: movementStatusClass(trailer),
    isCurrent: true,
  };

  const rows: TrailerMovementRow[] = [current];
  const hash = hashString(trailer.trailerNumber);

  if (trailer.status === "onsite" && trailer.location.trim()) {
    const priorDate = new Date(trailer.updatedAt);
    priorDate.setDate(priorDate.getDate() - 2 - (hash % 4));
    rows.push({
      id: `${trailer.id}-prior`,
      at: priorDate.toISOString(),
      type: "Departed",
      from: deriveHomeLocation(trailer),
      to: trailer.location.trim(),
      driver: current.driver,
      status: "Completed",
      statusClass:
        "border border-[#71767b]/30 bg-[#71767b]/10 text-[#71767b]",
      isCurrent: false,
    });
  }

  return rows.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

export function alertsForTrailer(
  alerts: SystemAlert[],
  trailerNumber: string
): SystemAlert[] {
  return alerts
    .filter(
      (alert) =>
        alert.relatedTo.trim().toLowerCase() ===
        trailerNumber.trim().toLowerCase()
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function maintenanceForTrailer(
  services: MaintenanceService[],
  trailerNumber: string
): MaintenanceService[] {
  return services
    .filter((service) => service.trailerNumber === trailerNumber)
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
}

export function nextMaintenanceService(
  services: MaintenanceService[]
): MaintenanceService | null {
  const open = services.filter((service) => service.status !== "completed");
  return open[0] ?? null;
}

export function lastCompletedService(
  services: MaintenanceService[]
): MaintenanceService | null {
  const completed = services.filter((service) => service.status === "completed");
  return (
    completed.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0] ?? null
  );
}

export function openWorkOrderCount(services: MaintenanceService[]): number {
  return services.filter(
    (service) =>
      service.status === "scheduled" ||
      service.status === "overdue" ||
      service.status === "due_soon"
  ).length;
}

export function maintenanceSummaryLines(
  trailer: Trailer,
  services: MaintenanceService[]
) {
  const next = nextMaintenanceService(services);
  const last = lastCompletedService(services);

  return {
    nextServiceDate: next
      ? formatShortDate(next.dueDate)
      : formatNextDueService(trailer),
    nextServiceType: next
      ? MAINTENANCE_SERVICE_TYPE_LABELS[next.serviceType]
      : "DOT Inspection",
    nextServiceStatus: next?.status ?? "due_soon",
    nextServiceStatusLabel: next
      ? MAINTENANCE_SERVICE_STATUS_LABELS[next.status]
      : "Due Soon",
    mileageAtNextService:
      deriveMileage(trailer) + 2500 + (hashString(trailer.trailerNumber) % 5000),
    openWorkOrders: openWorkOrderCount(services),
    lastServiceDate: last
      ? formatShortDate(last.updatedAt)
      : deriveLastInspection(trailer, services),
    lastServiceType: last
      ? MAINTENANCE_SERVICE_TYPE_LABELS[last.serviceType]
      : "Annual Inspection",
  };
}

export function trailerStatusDetails(trailer: Trailer, type: TrailerType) {
  const hash = hashString(trailer.trailerNumber);
  const isReefer = type === "Reefer";

  return {
    statusLabel: STATUS_LABELS[trailer.status],
    location: deriveCurrentLocation(trailer),
    lastUpdate: trailer.updatedAt,
    updatedBy: trailer.driver.trim() || "Dispatch",
    odometer: deriveMileage(trailer),
    fuelLevel: isReefer ? 35 + (hash % 55) : null,
    doorStatus: trailer.status === "outbound" ? "Locked" : "Closed",
    temperature: isReefer ? `${34 + (hash % 10)}°F` : null,
  };
}

export function trailerHistoryEvents(trailer: Trailer) {
  return [
    {
      id: `${trailer.id}-updated`,
      label: "Status updated",
      detail: `${STATUS_LABELS[trailer.status]} · ${deriveCurrentLocation(trailer)}`,
      at: trailer.updatedAt,
    },
    ...(trailer.notes.trim()
      ? [
          {
            id: `${trailer.id}-notes`,
            label: "Notes updated",
            detail: trailer.notes.trim(),
            at: trailer.updatedAt,
          },
        ]
      : []),
  ];
}
