import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", ".data", "users.json");

const joined = "2025-01-15T12:00:00.000Z";
const ts = new Date().toISOString();

const users = [
  {
    id: "user-dispatch-1",
    name: "Michael",
    email: "dispatch1@littleabbyco.com",
    phone: "",
    role: "dispatcher",
    status: "active",
    location: "Nanticoke, PA",
    locationAccess: ["Nanticoke, PA", "Hanover, MD"],
    notes: "Primary dispatch — day shift.",
    lastLoginAt: ts,
    joinedAt: joined,
    updatedAt: ts,
  },
  {
    id: "user-dispatch-2",
    name: "Dispatch 2",
    email: "dispatch2@littleabbyco.com",
    phone: "",
    role: "dispatcher",
    status: "active",
    location: "Hanover, MD",
    locationAccess: ["Hanover, MD", "Nanticoke, PA"],
    notes: "",
    lastLoginAt: ts,
    joinedAt: joined,
    updatedAt: ts,
  },
  {
    id: "user-admin",
    name: "Michael (Admin)",
    email: "michaeltettey29@gmail.com",
    phone: "",
    role: "administrator",
    status: "active",
    location: "Head Office",
    locationAccess: ["Nanticoke, PA", "Hanover, MD", "Head Office"],
    notes: "Full administrator access.",
    lastLoginAt: ts,
    joinedAt: joined,
    updatedAt: ts,
  },
];

await mkdir(path.dirname(dataPath), { recursive: true });
await writeFile(dataPath, JSON.stringify(users, null, 2), "utf-8");
console.log(`Seeded ${users.length} users to ${dataPath}`);
