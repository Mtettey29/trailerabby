import { mkdir, readFile, writeFile } from "fs/promises";
import { getRedis, redisConfigured } from "@/lib/redis";
import path from "path";
import { randomUUID } from "crypto";
import type { AppUser, AppUserInput, AppUserUpdate } from "./types";
import { USER_ROLES, USER_STATUSES } from "./types";

const KV_KEY = "users";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "users.json");

function isValidRole(role: string): role is AppUser["role"] {
  return (USER_ROLES as readonly string[]).includes(role);
}

function isValidStatus(status: string): status is AppUser["status"] {
  return (USER_STATUSES as readonly string[]).includes(status);
}

async function readLocalUsers(): Promise<AppUser[]> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AppUser[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalUsers(users: AppUser[]): Promise<void> {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, JSON.stringify(users, null, 2), "utf-8");
}

async function readAll(): Promise<AppUser[]> {
  if (redisConfigured()) {
    const redis = getRedis();
    const data = await redis.get<AppUser[]>(KV_KEY);
    return data ?? [];
  }
  return readLocalUsers();
}

async function writeAll(users: AppUser[]): Promise<void> {
  if (redisConfigured()) {
    const redis = getRedis();
    await redis.set(KV_KEY, users);
    return;
  }
  await writeLocalUsers(users);
}

export async function listUsers(): Promise<AppUser[]> {
  const users = await readAll();
  return users.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const normalized = email.toLowerCase().trim();
  const users = await readAll();
  return (
    users.find((user) => user.email.toLowerCase().trim() === normalized) ?? null
  );
}

export async function createUser(input: AppUserInput): Promise<AppUser> {
  if (!input.name?.trim()) {
    throw new Error("Name is required");
  }
  if (!input.email?.trim()) {
    throw new Error("Email is required");
  }
  if (!isValidRole(input.role)) {
    throw new Error("Invalid role");
  }
  if (!isValidStatus(input.status)) {
    throw new Error("Invalid status");
  }

  const now = new Date().toISOString();
  const user: AppUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() ?? "",
    role: input.role,
    status: input.status,
    location: input.location?.trim() ?? "",
    locationAccess: input.locationAccess ?? [],
    notes: input.notes?.trim() ?? "",
    lastLoginAt: input.lastLoginAt ?? now,
    joinedAt: now,
    updatedAt: now,
  };

  const users = await readAll();
  users.push(user);
  await writeAll(users);
  return user;
}

export async function updateUser(
  id: string,
  input: AppUserUpdate
): Promise<AppUser> {
  const users = await readAll();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    throw new Error("User not found");
  }

  const current = users[index];
  if (input.role !== undefined && !isValidRole(input.role)) {
    throw new Error("Invalid role");
  }
  if (input.status !== undefined && !isValidStatus(input.status)) {
    throw new Error("Invalid status");
  }

  const updated: AppUser = {
    ...current,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.email !== undefined && { email: input.email.trim() }),
    ...(input.phone !== undefined && { phone: input.phone.trim() }),
    ...(input.role !== undefined && { role: input.role }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.location !== undefined && { location: input.location.trim() }),
    ...(input.locationAccess !== undefined && {
      locationAccess: input.locationAccess,
    }),
    ...(input.notes !== undefined && { notes: input.notes.trim() }),
    ...(input.lastLoginAt !== undefined && {
      lastLoginAt: input.lastLoginAt,
    }),
    ...(input.clerkUserId !== undefined && {
      clerkUserId: input.clerkUserId,
    }),
    updatedAt: new Date().toISOString(),
  };

  users[index] = updated;
  await writeAll(users);
  return updated;
}

export async function deleteUser(id: string): Promise<void> {
  const users = await readAll();
  const next = users.filter((user) => user.id !== id);
  if (next.length === users.length) {
    throw new Error("User not found");
  }
  await writeAll(next);
}
