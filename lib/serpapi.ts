import type { PlaceSearchResult } from "./place-search";

const SERPAPI_BASE = "https://serpapi.com/search.json";
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const MAX_RESULTS = 5;

const searchCache = new Map<
  string,
  { expiresAt: number; results: PlaceSearchResult[] }
>();

function cacheKey(
  query: string,
  options: { latitude?: number; longitude?: number }
): string {
  const lat =
    options.latitude !== undefined ? options.latitude.toFixed(4) : "none";
  const lng =
    options.longitude !== undefined ? options.longitude.toFixed(4) : "none";
  return `${query.toLowerCase()}|${lat}|${lng}`;
}

function readCache(key: string): PlaceSearchResult[] | null {
  const hit = searchCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    searchCache.delete(key);
    return null;
  }
  return hit.results;
}

function writeCache(key: string, results: PlaceSearchResult[]): void {
  if (searchCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = searchCache.keys().next().value;
    if (oldest) searchCache.delete(oldest);
  }
  searchCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    results,
  });
}

type SerpGps = {
  latitude?: number | string;
  longitude?: number | string;
};

type SerpLocalResult = {
  title?: string;
  address?: string;
  gps_coordinates?: SerpGps;
  place_id?: string;
};

type SerpMapsResponse = {
  local_results?: SerpLocalResult[];
  place_results?: SerpLocalResult;
  error?: string;
};

function toCoordinate(value: number | string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

function mapResult(item: SerpLocalResult): PlaceSearchResult | null {
  const latitude = toCoordinate(item.gps_coordinates?.latitude);
  const longitude = toCoordinate(item.gps_coordinates?.longitude);
  if (latitude === null || longitude === null) return null;

  return {
    title: item.title?.trim() || "Unnamed place",
    address: item.address?.trim() || "",
    latitude,
    longitude,
    placeId: item.place_id,
  };
}

export async function searchGoogleMapsPlaces(
  query: string,
  options: { latitude?: number; longitude?: number } = {}
): Promise<PlaceSearchResult[]> {
  const normalizedQuery = query.trim();
  const key = cacheKey(normalizedQuery, options);
  const cached = readCache(key);
  if (cached) return cached;

  const apiKey = process.env.SERPAPI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    engine: "google_maps",
    type: "search",
    q: normalizedQuery,
    api_key: apiKey,
    hl: "en",
    gl: "us",
  });

  if (
    options.latitude !== undefined &&
    options.longitude !== undefined &&
    Number.isFinite(options.latitude) &&
    Number.isFinite(options.longitude)
  ) {
    params.set(
      "ll",
      `@${options.latitude},${options.longitude},12z`
    );
  } else {
    params.set("location", "United States");
  }

  const res = await fetch(`${SERPAPI_BASE}?${params.toString()}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`SerpAPI request failed (${res.status})`);
  }

  const data = (await res.json()) as SerpMapsResponse;
  if (data.error) {
    throw new Error(data.error);
  }

  const results: PlaceSearchResult[] = [];

  if (data.place_results) {
    const mapped = mapResult(data.place_results);
    if (mapped) results.push(mapped);
  }

  for (const item of data.local_results ?? []) {
    const mapped = mapResult(item);
    if (mapped) results.push(mapped);
  }

  const seen = new Set<string>();
  const deduped = results.filter((place) => {
    const resultKey = `${place.latitude},${place.longitude},${place.title}`;
    if (seen.has(resultKey)) return false;
    seen.add(resultKey);
    return true;
  });

  const limited = deduped.slice(0, MAX_RESULTS);
  writeCache(key, limited);
  return limited;
}
