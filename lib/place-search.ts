export type PlaceSearchResult = {
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
};

/** Best-effort US address split from SerpAPI / Google Maps strings */
export function parsePlaceAddress(address: string): {
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
} {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { addressLine1: "", city: "", state: "", zip: "" };
  }

  const addressLine1 = parts[0] ?? "";
  let city = "";
  let state = "";
  let zip = "";

  if (parts.length >= 2) {
    const last = parts[parts.length - 1] ?? "";
    const stateZip = last.match(/^([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);
    if (stateZip) {
      state = stateZip[1].toUpperCase();
      zip = stateZip[2];
      city = parts.length >= 3 ? parts[parts.length - 2] ?? "" : "";
    } else if (parts.length >= 3) {
      city = parts[parts.length - 2] ?? "";
      const statePart = parts[parts.length - 1] ?? "";
      const m = statePart.match(/^([A-Za-z]{2})(?:\s+(\d{5}(?:-\d{4})?))?$/);
      if (m) {
        state = m[1].toUpperCase();
        zip = m[2] ?? "";
      }
    } else {
      city = parts[1] ?? "";
    }
  }

  return { addressLine1, city, state, zip };
}
