import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Redis } from "@upstash/redis";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", ".data");

/** Same keys as lib/*.ts */
export const REDIS_KEYS = [
  { key: "trailers", file: "trailers.json" },
  { key: "users", file: "users.json" },
  { key: "locations", file: "locations.json" },
  { key: "drivers", file: "drivers.json" },
  { key: "alerts", file: "alerts.json" },
  { key: "maintenance", file: "maintenance.json" },
  { key: "settings", file: "settings.json" },
];

function redisEnv() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  return { url: url.trim(), token: token.trim() };
}

export function redisConfigured() {
  const { url, token } = redisEnv();
  return Boolean(url && token);
}

export function redisConfigError() {
  const { url, token } = redisEnv();
  const hasKeys =
    "KV_REST_API_URL" in process.env ||
    "UPSTASH_REDIS_REST_URL" in process.env;

  if (!hasKeys) {
    return (
      "No Redis env vars found. Run:\n" +
      "  npx vercel env pull .env.local --environment=production --yes\n" +
      "Then add credentials from Vercel → Storage → your Upstash DB → REST API."
    );
  }

  if (!url || !token) {
    return (
      "Redis env vars are present but empty (Vercel CLI often pulls blank values for Storage integrations).\n" +
      "Copy REST URL + token from Vercel → Storage → Upstash → .env.local tab (or Upstash console)\n" +
      "into .env.local as KV_REST_API_URL and KV_REST_API_TOKEN, then save the file."
    );
  }

  return null;
}

export function getRedis() {
  if (!redisConfigured()) {
    throw new Error(
      "Missing Redis credentials. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or pull from Vercel after connecting Upstash)."
    );
  }

  return Redis.fromEnv();
}

export async function readLocalJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

export function countRecords(key, data) {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === "object") return 1;
  return 0;
}
