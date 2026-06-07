import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  REDIS_KEYS,
  countRecords,
  getRedis,
  readLocalJson,
  redisConfigError,
  redisConfigured,
} from "./redis-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", ".data");

const force = process.argv.includes("--force");

if (!redisConfigured()) {
  console.error(`Redis is not configured.\n\n${redisConfigError()}`);
  process.exit(1);
}

const redis = getRedis();
await redis.ping();

const existing = await Promise.all(
  REDIS_KEYS.map(async ({ key }) => {
    const data = await redis.get(key);
    return { key, hasData: data != null && countRecords(key, data) > 0 };
  })
);

const occupied = existing.filter((e) => e.hasData).map((e) => e.key);
if (occupied.length > 0 && !force) {
  console.error(
    `Redis already has data for: ${occupied.join(", ")}\n` +
      "Re-run with --force to overwrite, or use the app UI to edit production data."
  );
  process.exit(1);
}

let pushed = 0;

for (const { key, file } of REDIS_KEYS) {
  const filePath = path.join(DATA_DIR, file);
  try {
    await access(filePath);
  } catch {
    console.warn(`  skip ${key} — missing .data/${file} (run npm run seed first)`);
    continue;
  }

  const data = await readLocalJson(file);
  await redis.set(key, data);
  console.log(`  ${key.padEnd(14)} ← .data/${file} (${countRecords(key, data)} record(s))`);
  pushed += 1;
}

if (pushed === 0) {
  console.error(
    "\nNothing pushed. Seed local data first:\n" +
      "  npm run seed && npm run seed:users && npm run seed:locations && npm run seed:drivers && npm run seed:alerts && npm run seed:maintenance && npm run seed:settings"
  );
  process.exit(1);
}

console.log(`\nPushed ${pushed} key(s) to Upstash Redis.`);
