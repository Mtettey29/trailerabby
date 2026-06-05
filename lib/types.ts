export const TRAILER_STATUSES = ["outbound", "onsite", "in_shop"] as const;

export type TrailerStatus = (typeof TRAILER_STATUSES)[number];

export interface Trailer {
  id: string;
  trailerNumber: string;
  status: TrailerStatus;
  driver: string;
  location: string;
  notes: string;
  updatedAt: string;
}

export type TrailerInput = Pick<Trailer, "trailerNumber" | "status"> &
  Partial<Pick<Trailer, "driver" | "location" | "notes">>;

export type TrailerUpdate = Partial<
  Pick<Trailer, "trailerNumber" | "status" | "driver" | "location" | "notes">
>;

export const STATUS_LABELS: Record<TrailerStatus, string> = {
  outbound: "Outbound",
  onsite: "Onsite",
  in_shop: "In Shop",
};

export const STATUS_SECTION_TITLES: Record<TrailerStatus, string> = {
  outbound: "Outbound Trailers",
  onsite: "Onsite Trailers",
  in_shop: "In Shop",
};

/** DOM id for sidebar hash / scroll targets */
export const STATUS_SECTION_IDS: Record<TrailerStatus, string> = {
  outbound: "outbound",
  onsite: "onsite",
  in_shop: "in-shop",
};

export const LOCATION_TYPES = ["yard", "customer", "other"] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export const LOCATION_STATUSES = ["active", "inactive"] as const;

export type LocationStatus = (typeof LOCATION_STATUSES)[number];

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  status: LocationStatus;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export type LocationInput = Pick<
  Location,
  | "name"
  | "type"
  | "status"
  | "addressLine1"
  | "city"
  | "state"
  | "zip"
  | "latitude"
  | "longitude"
> &
  Partial<Pick<Location, "addressLine2">>;

export type LocationUpdate = Partial<
  Pick<
    Location,
    | "name"
    | "type"
    | "status"
    | "addressLine1"
    | "addressLine2"
    | "city"
    | "state"
    | "zip"
    | "latitude"
    | "longitude"
  >
>;

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  yard: "Yard",
  customer: "Customer",
  other: "Other",
};

export const LOCATION_STATUS_LABELS: Record<LocationStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};
