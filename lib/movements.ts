import type { Trailer, TrailerStatus } from "./types";
import type { TrailerFilters } from "./trailer-filters";
import { applyTrailerFilters } from "./trailer-filters";

export const MOVEMENT_TYPES = [
  "departed",
  "arrived",
  "picked_up",
  "delivered",
  "repositioned",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  departed: "Departed",
  arrived: "Arrived",
  picked_up: "Picked Up",
  delivered: "Delivered",
  repositioned: "Repositioned",
};

export type MovementPageFilters = TrailerFilters & {
  movementType: MovementType | "all";
};

export const DEFAULT_MOVEMENT_FILTERS: MovementPageFilters = {
  search: "",
  status: "all",
  location: "all",
  movementType: "all",
};

export function deriveMovementType(trailer: Trailer): MovementType {
  const notes = trailer.notes.toLowerCase();

  if (trailer.status === "outbound") {
    if (notes.includes("deliver")) return "delivered";
    if (notes.includes("pick")) return "picked_up";
    return "departed";
  }

  if (trailer.status === "onsite") return "arrived";
  return "repositioned";
}

export function movementFromLocation(trailer: Trailer): {
  from: string;
  to: string;
} {
  const location = trailer.location.trim();

  if (trailer.status === "outbound") {
    return {
      from: "Yard",
      to: location || "—",
    };
  }

  return {
    from: "—",
    to: location || "—",
  };
}

export function formatDriverShort(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "—";

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];

  const lastInitial = parts[parts.length - 1][0];
  return `${parts[0]} ${lastInitial}.`;
}

export function applyMovementFilters(
  trailers: Trailer[],
  filters: MovementPageFilters
): Trailer[] {
  let result = applyTrailerFilters(trailers, filters);

  if (filters.movementType !== "all") {
    result = result.filter(
      (trailer) => deriveMovementType(trailer) === filters.movementType
    );
  }

  return result;
}

export const STATUS_DISPLAY: Record<
  TrailerStatus,
  { label: string; className: string }
> = {
  outbound: {
    label: "In Transit",
    className:
      "border border-[#1d9bf0]/30 bg-[#1d9bf0]/15 text-[#1d9bf0]",
  },
  onsite: {
    label: "At Location",
    className:
      "border border-[#00ba7c]/30 bg-[#00ba7c]/15 text-[#00ba7c]",
  },
  in_shop: {
    label: "In Shop",
    className:
      "border border-[#ffad1f]/30 bg-[#ffad1f]/15 text-[#ffad1f]",
  },
};

export const MOVEMENT_TYPE_CLASS: Record<MovementType, string> = {
  departed:
    "border border-[#00ba7c]/30 bg-[#00ba7c]/15 text-[#00ba7c]",
  arrived:
    "border border-[#7856ff]/30 bg-[#7856ff]/15 text-[#c4b5fd]",
  picked_up:
    "border border-[#1d9bf0]/30 bg-[#1d9bf0]/15 text-[#1d9bf0]",
  delivered:
    "border border-[#ffad1f]/30 bg-[#ffad1f]/15 text-[#ffad1f]",
  repositioned:
    "border border-[#71767b]/30 bg-[#71767b]/15 text-[#71767b]",
};
