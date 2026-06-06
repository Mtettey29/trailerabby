import { Redis } from "@upstash/redis";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { Driver, DriverInput, DriverUpdate } from "./types";
import { DRIVER_STATUSES } from "./types";

const KV_KEY = "drivers";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "drivers.json");

function redisConfigured(): boolean {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return Boolean(url && token);
}

function getRedis(): Redis {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL!;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN!;
  return new Redis({ url, token });
}

function isValidStatus(status: string): status is Driver["status"] {
  return (DRIVER_STATUSES as readonly string[]).includes(status);
}

async function readLocalDrivers(): Promise<Driver[]> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Driver[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalDrivers(drivers: Driver[]): Promise<void> {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, JSON.stringify(drivers, null, 2), "utf-8");
}

async function readAll(): Promise<Driver[]> {
  if (redisConfigured()) {
    const redis = getRedis();
    const data = await redis.get<Driver[]>(KV_KEY);
    return data ?? [];
  }
  return readLocalDrivers();
}

async function writeAll(drivers: Driver[]): Promise<void> {
  if (redisConfigured()) {
    const redis = getRedis();
    await redis.set(KV_KEY, drivers);
    return;
  }
  await writeLocalDrivers(drivers);
}

export async function listDrivers(): Promise<Driver[]> {
  const drivers = await readAll();
  return drivers.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  if (!input.name?.trim()) {
    throw new Error("Driver name is required");
  }
  if (!input.driverId?.trim()) {
    throw new Error("Driver ID is required");
  }
  if (!isValidStatus(input.status)) {
    throw new Error("Invalid driver status");
  }

  const now = new Date().toISOString();
  const driver: Driver = {
    id: randomUUID(),
    name: input.name.trim(),
    driverId: input.driverId.trim(),
    phone: input.phone?.trim() ?? "",
    status: input.status,
    currentAssignment: input.currentAssignment?.trim() ?? "",
    lastActiveAt: input.lastActiveAt ?? now,
    updatedAt: now,
  };

  const drivers = await readAll();
  drivers.push(driver);
  await writeAll(drivers);
  return driver;
}

export async function updateDriver(
  id: string,
  input: DriverUpdate
): Promise<Driver> {
  const drivers = await readAll();
  const index = drivers.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error("Driver not found");
  }

  const current = drivers[index];
  if (input.status !== undefined && !isValidStatus(input.status)) {
    throw new Error("Invalid driver status");
  }

  const updated: Driver = {
    ...current,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.driverId !== undefined && { driverId: input.driverId.trim() }),
    ...(input.phone !== undefined && { phone: input.phone.trim() }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.currentAssignment !== undefined && {
      currentAssignment: input.currentAssignment.trim(),
    }),
    ...(input.lastActiveAt !== undefined && {
      lastActiveAt: input.lastActiveAt,
    }),
    updatedAt: new Date().toISOString(),
  };

  drivers[index] = updated;
  await writeAll(drivers);
  return updated;
}

export async function deleteDriver(id: string): Promise<void> {
  const drivers = await readAll();
  const next = drivers.filter((d) => d.id !== id);
  if (next.length === drivers.length) {
    throw new Error("Driver not found");
  }
  await writeAll(next);
}
