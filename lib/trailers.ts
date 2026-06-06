import { Redis } from "@upstash/redis";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { normalizeTrailerAsset } from "./trailer-assets";
import type { Trailer, TrailerInput, TrailerUpdate } from "./types";
import { TRAILER_STATUSES } from "./types";

const KV_KEY = "trailers";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "trailers.json");

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

function isValidStatus(status: string): status is Trailer["status"] {
  return (TRAILER_STATUSES as readonly string[]).includes(status);
}

async function readLocalTrailers(): Promise<Trailer[]> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed as Trailer[]).map(normalizeTrailerAsset)
      : [];
  } catch {
    return [];
  }
}

async function writeLocalTrailers(trailers: Trailer[]): Promise<void> {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, JSON.stringify(trailers, null, 2), "utf-8");
}

async function readAll(): Promise<Trailer[]> {
  if (redisConfigured()) {
    const redis = getRedis();
    const data = await redis.get<Trailer[]>(KV_KEY);
    return (data ?? []).map(normalizeTrailerAsset);
  }
  return readLocalTrailers();
}

async function writeAll(trailers: Trailer[]): Promise<void> {
  if (redisConfigured()) {
    const redis = getRedis();
    await redis.set(KV_KEY, trailers);
    return;
  }
  await writeLocalTrailers(trailers);
}

export async function listTrailers(): Promise<Trailer[]> {
  const trailers = await readAll();
  return trailers.sort((a, b) =>
    a.trailerNumber.localeCompare(b.trailerNumber, undefined, { numeric: true })
  );
}

export async function getTrailer(id: string): Promise<Trailer | null> {
  const trailers = await readAll();
  return trailers.find((trailer) => trailer.id === id) ?? null;
}

export async function createTrailer(input: TrailerInput): Promise<Trailer> {
  if (!input.trailerNumber?.trim()) {
    throw new Error("Trailer number is required");
  }
  if (!isValidStatus(input.status)) {
    throw new Error("Invalid status");
  }

  const trailer: Trailer = normalizeTrailerAsset({
    id: randomUUID(),
    trailerNumber: input.trailerNumber.trim(),
    status: input.status,
    driver: input.driver?.trim() ?? "",
    location: input.location?.trim() ?? "",
    notes: input.notes?.trim() ?? "",
    updatedAt: new Date().toISOString(),
  });

  const trailers = await readAll();
  trailers.push(trailer);
  await writeAll(trailers);
  return trailer;
}

export async function updateTrailer(
  id: string,
  input: TrailerUpdate
): Promise<Trailer> {
  const trailers = await readAll();
  const index = trailers.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Trailer not found");
  }

  const current = trailers[index];
  if (input.status !== undefined && !isValidStatus(input.status)) {
    throw new Error("Invalid status");
  }

  const updated: Trailer = normalizeTrailerAsset({
    ...current,
    ...(input.trailerNumber !== undefined && {
      trailerNumber: input.trailerNumber.trim(),
    }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.driver !== undefined && { driver: input.driver.trim() }),
    ...(input.location !== undefined && { location: input.location.trim() }),
    ...(input.notes !== undefined && { notes: input.notes.trim() }),
    updatedAt: new Date().toISOString(),
  });

  trailers[index] = updated;
  await writeAll(trailers);
  return updated;
}

export async function deleteTrailer(id: string): Promise<void> {
  const trailers = await readAll();
  const next = trailers.filter((t) => t.id !== id);
  if (next.length === trailers.length) {
    throw new Error("Trailer not found");
  }
  await writeAll(next);
}
