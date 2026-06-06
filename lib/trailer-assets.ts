import type { Trailer } from "./types";
import { EMPTY_TRAILER_ASSET } from "./types";

/** Dispatch overrides layered on fixed-asset register rows */
export const DISPATCH_BY_TRAILER_NUMBER: Record<
  string,
  Pick<Trailer, "status" | "driver" | "location">
> = {
  HT367630: { status: "outbound", driver: "Tylance", location: "" },
  JR112396: { status: "outbound", driver: "Brandon", location: "" },
  GT003879: { status: "outbound", driver: "Nimoy", location: "" },
  "154446": { status: "outbound", driver: "Brandon", location: "" },
  "53595": { status: "onsite", driver: "Nimoy", location: "" },
  GT003218: { status: "onsite", driver: "", location: "" },
  "282218": { status: "onsite", driver: "", location: "" },
  "282232": { status: "onsite", driver: "", location: "" },
  "282792": { status: "onsite", driver: "Aubrey", location: "Nanticoke, PA" },
  "281409": { status: "onsite", driver: "", location: "Hanover, MD" },
};

export const BRANCH_HOME_LOCATIONS: Record<string, string> = {
  BALTB: "Hanover, MD",
  WILLI: "Williamsport, PA",
  SCRAN: "Nanticoke, PA",
  CORP: "Hanover, MD",
  LAREDO: "Laredo, TX",
};

const TRAILER_OPERATIONAL_DEFAULTS: Pick<
  Trailer,
  "status" | "driver" | "location" | "notes" | "updatedAt"
> = {
  status: "onsite",
  driver: "",
  location: "",
  notes: "",
  updatedAt: new Date().toISOString(),
};

export function normalizeTrailerAsset(
  trailer: Partial<Trailer> & Pick<Trailer, "id" | "trailerNumber">
): Trailer {
  return {
    ...TRAILER_OPERATIONAL_DEFAULTS,
    ...EMPTY_TRAILER_ASSET,
    ...trailer,
  };
}

export function homeLocationFromBranch(branchCode: string): string {
  const code = branchCode.trim().toUpperCase();
  return BRANCH_HOME_LOCATIONS[code] ?? "Hanover, MD";
}
