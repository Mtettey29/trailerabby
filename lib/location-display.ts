import type { Location, LocationStatus, LocationType, Trailer } from "./types";
import { LOCATION_TYPE_LABELS } from "./types";

export type LocationPageFilters = {
  search: string;
  type: LocationType | "all";
  status: LocationStatus | "all";
};

export const DEFAULT_LOCATION_PAGE_FILTERS: LocationPageFilters = {
  search: "",
  type: "all",
  status: "all",
};

const TYPE_AVATAR_COLORS: Record<LocationType, string> = {
  yard: "bg-emerald-900/60 text-emerald-300",
  customer: "bg-violet-900/60 text-violet-300",
  other: "bg-orange-900/60 text-orange-300",
};

const TYPE_MARKER_COLORS: Record<LocationType, string> = {
  yard: "#22c55e",
  customer: "#a855f7",
  other: "#f97316",
};

export function getLocationTypeLabel(type: LocationType): string {
  return LOCATION_TYPE_LABELS[type];
}

export function getLocationInitial(location: Location): string {
  const letter = location.name.trim().charAt(0).toUpperCase();
  if (letter) return letter;
  return location.type === "yard" ? "Y" : "C";
}

export function getLocationAvatarClass(type: LocationType): string {
  return TYPE_AVATAR_COLORS[type];
}

export function getLocationMarkerColor(type: LocationType): string {
  return TYPE_MARKER_COLORS[type];
}

export function formatLocationCityState(location: Location): string {
  const zip = location.zip.trim();
  return zip
    ? `${location.city}, ${location.state} ${zip}`
    : `${location.city}, ${location.state}`;
}

export function formatLocationStreet(location: Location): string {
  const street = location.addressLine1.trim();
  const line2 = location.addressLine2.trim();
  if (!street && !line2) return "";
  return line2 ? `${street}, ${line2}` : street;
}

/** Street on first line, city/state (+ zip) on second when a street exists */
export function formatLocationAddress(location: Location): string {
  const cityState = formatLocationCityState(location);
  const street = formatLocationStreet(location);
  if (!street) return cityState;
  return `${street}\n${cityState}`;
}

export function countTrailersAtLocation(
  location: Location,
  trailers: Trailer[]
): number {
  const name = location.name.trim().toLowerCase();
  const city = location.city.trim().toLowerCase();
  if (!name) return 0;

  return trailers.filter((trailer) => {
    const loc = trailer.location.trim().toLowerCase();
    if (!loc) return false;
    return (
      loc === name ||
      loc.includes(name) ||
      name.includes(loc) ||
      (city.length > 0 && loc.includes(city))
    );
  }).length;
}

export function applyLocationFilters(
  locations: Location[],
  filters: LocationPageFilters
): Location[] {
  const search = filters.search.trim().toLowerCase();

  return locations.filter((location) => {
    if (filters.type !== "all" && location.type !== filters.type) {
      return false;
    }
    if (filters.status !== "all" && location.status !== filters.status) {
      return false;
    }
    if (!search) return true;

    const haystack = [
      location.name,
      location.addressLine1,
      location.addressLine2,
      location.city,
      location.state,
      location.zip,
      getLocationTypeLabel(location.type),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}
