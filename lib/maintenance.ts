import { Redis } from "@upstash/redis";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type {
  MaintenanceService,
  MaintenanceServiceInput,
  MaintenanceServiceUpdate,
} from "./types";
import {
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_SERVICE_STATUSES,
  MAINTENANCE_SERVICE_TYPES,
} from "./types";

const KV_KEY = "maintenance";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "maintenance.json");

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

function isValidType(type: string): type is MaintenanceService["serviceType"] {
  return (MAINTENANCE_SERVICE_TYPES as readonly string[]).includes(type);
}

function isValidStatus(
  status: string
): status is MaintenanceService["status"] {
  return (MAINTENANCE_SERVICE_STATUSES as readonly string[]).includes(status);
}

function isValidPriority(
  priority: string
): priority is MaintenanceService["priority"] {
  return (MAINTENANCE_PRIORITIES as readonly string[]).includes(priority);
}

async function readLocalServices(): Promise<MaintenanceService[]> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MaintenanceService[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalServices(
  services: MaintenanceService[]
): Promise<void> {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(
    LOCAL_DATA_PATH,
    JSON.stringify(services, null, 2),
    "utf-8"
  );
}

async function readAll(): Promise<MaintenanceService[]> {
  if (redisConfigured()) {
    const redis = getRedis();
    const data = await redis.get<MaintenanceService[]>(KV_KEY);
    return data ?? [];
  }
  return readLocalServices();
}

async function writeAll(services: MaintenanceService[]): Promise<void> {
  if (redisConfigured()) {
    const redis = getRedis();
    await redis.set(KV_KEY, services);
    return;
  }
  await writeLocalServices(services);
}

export async function listMaintenanceServices(): Promise<MaintenanceService[]> {
  const services = await readAll();
  return services.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

export async function createMaintenanceService(
  input: MaintenanceServiceInput
): Promise<MaintenanceService> {
  if (!input.trailerNumber?.trim()) {
    throw new Error("Trailer number is required");
  }
  if (!input.dueDate?.trim()) {
    throw new Error("Due date is required");
  }
  if (!isValidType(input.serviceType)) {
    throw new Error("Invalid service type");
  }
  if (!isValidStatus(input.status)) {
    throw new Error("Invalid service status");
  }
  if (!isValidPriority(input.priority)) {
    throw new Error("Invalid priority");
  }

  const now = new Date().toISOString();
  const service: MaintenanceService = {
    id: randomUUID(),
    trailerNumber: input.trailerNumber.trim(),
    serviceType: input.serviceType,
    dueDate: input.dueDate,
    status: input.status,
    priority: input.priority,
    technician: input.technician?.trim() ?? "",
    cost: input.cost ?? 0,
    notes: input.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };

  const services = await readAll();
  services.push(service);
  await writeAll(services);
  return service;
}

export async function updateMaintenanceService(
  id: string,
  input: MaintenanceServiceUpdate
): Promise<MaintenanceService> {
  const services = await readAll();
  const index = services.findIndex((service) => service.id === id);
  if (index === -1) {
    throw new Error("Maintenance service not found");
  }

  const current = services[index];
  if (input.serviceType !== undefined && !isValidType(input.serviceType)) {
    throw new Error("Invalid service type");
  }
  if (input.status !== undefined && !isValidStatus(input.status)) {
    throw new Error("Invalid service status");
  }
  if (input.priority !== undefined && !isValidPriority(input.priority)) {
    throw new Error("Invalid priority");
  }

  const updated: MaintenanceService = {
    ...current,
    ...(input.trailerNumber !== undefined && {
      trailerNumber: input.trailerNumber.trim(),
    }),
    ...(input.serviceType !== undefined && { serviceType: input.serviceType }),
    ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.technician !== undefined && {
      technician: input.technician.trim(),
    }),
    ...(input.cost !== undefined && { cost: input.cost }),
    ...(input.notes !== undefined && { notes: input.notes.trim() }),
    updatedAt: new Date().toISOString(),
  };

  services[index] = updated;
  await writeAll(services);
  return updated;
}

export async function deleteMaintenanceService(id: string): Promise<void> {
  const services = await readAll();
  const next = services.filter((service) => service.id !== id);
  if (next.length === services.length) {
    throw new Error("Maintenance service not found");
  }
  await writeAll(next);
}
