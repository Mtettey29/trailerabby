import { mkdir, readFile, writeFile } from "fs/promises";
import { getRedis, redisConfigured } from "@/lib/redis";
import path from "path";
import { randomUUID } from "crypto";
import type {
  SystemAlert,
  SystemAlertInput,
  SystemAlertUpdate,
} from "./types";
import { ALERT_SEVERITIES, ALERT_STATUSES, ALERT_TYPES } from "./types";

const KV_KEY = "alerts";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "alerts.json");

function isValidSeverity(severity: string): severity is SystemAlert["severity"] {
  return (ALERT_SEVERITIES as readonly string[]).includes(severity);
}

function isValidType(type: string): type is SystemAlert["type"] {
  return (ALERT_TYPES as readonly string[]).includes(type);
}

function isValidStatus(status: string): status is SystemAlert["status"] {
  return (ALERT_STATUSES as readonly string[]).includes(status);
}

async function readLocalAlerts(): Promise<SystemAlert[]> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SystemAlert[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalAlerts(alerts: SystemAlert[]): Promise<void> {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, JSON.stringify(alerts, null, 2), "utf-8");
}

async function readAll(): Promise<SystemAlert[]> {
  if (redisConfigured()) {
    const redis = getRedis();
    const data = await redis.get<SystemAlert[]>(KV_KEY);
    return data ?? [];
  }
  return readLocalAlerts();
}

async function writeAll(alerts: SystemAlert[]): Promise<void> {
  if (redisConfigured()) {
    const redis = getRedis();
    await redis.set(KV_KEY, alerts);
    return;
  }
  await writeLocalAlerts(alerts);
}

export async function listAlerts(): Promise<SystemAlert[]> {
  const alerts = await readAll();
  return alerts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createAlert(input: SystemAlertInput): Promise<SystemAlert> {
  if (!input.message?.trim()) {
    throw new Error("Alert message is required");
  }
  if (!isValidType(input.type)) {
    throw new Error("Invalid alert type");
  }
  if (!isValidSeverity(input.severity)) {
    throw new Error("Invalid alert severity");
  }

  const now = new Date().toISOString();
  const alert: SystemAlert = {
    id: randomUUID(),
    message: input.message.trim(),
    type: input.type,
    severity: input.severity,
    relatedTo: input.relatedTo?.trim() || "System",
    assignedTo: input.assignedTo?.trim() ?? "",
    status: input.status ?? "open",
    createdAt: now,
    updatedAt: now,
  };

  const alerts = await readAll();
  alerts.push(alert);
  await writeAll(alerts);
  return alert;
}

export async function updateAlert(
  id: string,
  input: SystemAlertUpdate
): Promise<SystemAlert> {
  const alerts = await readAll();
  const index = alerts.findIndex((alert) => alert.id === id);
  if (index === -1) {
    throw new Error("Alert not found");
  }

  const current = alerts[index];
  if (input.type !== undefined && !isValidType(input.type)) {
    throw new Error("Invalid alert type");
  }
  if (input.severity !== undefined && !isValidSeverity(input.severity)) {
    throw new Error("Invalid alert severity");
  }
  if (input.status !== undefined && !isValidStatus(input.status)) {
    throw new Error("Invalid alert status");
  }

  const updated: SystemAlert = {
    ...current,
    ...(input.message !== undefined && { message: input.message.trim() }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.severity !== undefined && { severity: input.severity }),
    ...(input.relatedTo !== undefined && {
      relatedTo: input.relatedTo.trim() || "System",
    }),
    ...(input.assignedTo !== undefined && {
      assignedTo: input.assignedTo.trim(),
    }),
    ...(input.status !== undefined && { status: input.status }),
    updatedAt: new Date().toISOString(),
  };

  alerts[index] = updated;
  await writeAll(alerts);
  return updated;
}

export async function resolveAllOpenAlerts(): Promise<number> {
  const alerts = await readAll();
  const now = new Date().toISOString();
  let count = 0;

  const next = alerts.map((alert) => {
    if (alert.status !== "open") return alert;
    count++;
    return { ...alert, status: "resolved" as const, updatedAt: now };
  });

  await writeAll(next);
  return count;
}

export async function deleteAlert(id: string): Promise<void> {
  const alerts = await readAll();
  const next = alerts.filter((alert) => alert.id !== id);
  if (next.length === alerts.length) {
    throw new Error("Alert not found");
  }
  await writeAll(next);
}
