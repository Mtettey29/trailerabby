import { mkdir, readFile, writeFile } from "fs/promises";
import { getRedis, redisConfigured } from "@/lib/redis";
import path from "path";
import { randomUUID } from "crypto";
import type { Location, LocationInput, LocationUpdate } from "./types";
import { LOCATION_STATUSES, LOCATION_TYPES } from "./types";

const KV_KEY = "locations";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "locations.json");

function isValidType(type: string): type is Location["type"] {
  return (LOCATION_TYPES as readonly string[]).includes(type);
}

function isValidStatus(status: string): status is Location["status"] {
  return (LOCATION_STATUSES as readonly string[]).includes(status);
}

async function readLocalLocations(): Promise<Location[]> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Location[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalLocations(locations: Location[]): Promise<void> {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(
    LOCAL_DATA_PATH,
    JSON.stringify(locations, null, 2),
    "utf-8"
  );
}

async function readAll(): Promise<Location[]> {
  if (redisConfigured()) {
    const redis = getRedis();
    const data = await redis.get<Location[]>(KV_KEY);
    return data ?? [];
  }
  return readLocalLocations();
}

async function writeAll(locations: Location[]): Promise<void> {
  if (redisConfigured()) {
    const redis = getRedis();
    await redis.set(KV_KEY, locations);
    return;
  }
  await writeLocalLocations(locations);
}

export async function listLocations(): Promise<Location[]> {
  const locations = await readAll();
  return locations.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createLocation(input: LocationInput): Promise<Location> {
  if (!input.name?.trim()) {
    throw new Error("Location name is required");
  }
  if (!isValidType(input.type)) {
    throw new Error("Invalid location type");
  }
  if (!isValidStatus(input.status)) {
    throw new Error("Invalid location status");
  }
  if (!input.city?.trim() || !input.state?.trim()) {
    throw new Error("City and state are required");
  }
  if (Number.isNaN(input.latitude) || Number.isNaN(input.longitude)) {
    throw new Error("Valid coordinates are required");
  }

  const location: Location = {
    id: randomUUID(),
    name: input.name.trim(),
    type: input.type,
    status: input.status,
    addressLine1: input.addressLine1.trim(),
    addressLine2: input.addressLine2?.trim() ?? "",
    city: input.city.trim(),
    state: input.state.trim(),
    zip: input.zip?.trim() ?? "",
    latitude: input.latitude,
    longitude: input.longitude,
    updatedAt: new Date().toISOString(),
  };

  const locations = await readAll();
  locations.push(location);
  await writeAll(locations);
  return location;
}

export async function updateLocation(
  id: string,
  input: LocationUpdate
): Promise<Location> {
  const locations = await readAll();
  const index = locations.findIndex((l) => l.id === id);
  if (index === -1) {
    throw new Error("Location not found");
  }

  const current = locations[index];
  if (input.type !== undefined && !isValidType(input.type)) {
    throw new Error("Invalid location type");
  }
  if (input.status !== undefined && !isValidStatus(input.status)) {
    throw new Error("Invalid location status");
  }

  const updated: Location = {
    ...current,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.addressLine1 !== undefined && {
      addressLine1: input.addressLine1.trim(),
    }),
    ...(input.addressLine2 !== undefined && {
      addressLine2: input.addressLine2.trim(),
    }),
    ...(input.city !== undefined && { city: input.city.trim() }),
    ...(input.state !== undefined && { state: input.state.trim() }),
    ...(input.zip !== undefined && { zip: input.zip.trim() }),
    ...(input.latitude !== undefined && { latitude: input.latitude }),
    ...(input.longitude !== undefined && { longitude: input.longitude }),
    updatedAt: new Date().toISOString(),
  };

  locations[index] = updated;
  await writeAll(locations);
  return updated;
}

export async function deleteLocation(id: string): Promise<void> {
  const locations = await readAll();
  const next = locations.filter((l) => l.id !== id);
  if (next.length === locations.length) {
    throw new Error("Location not found");
  }
  await writeAll(next);
}
