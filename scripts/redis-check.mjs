import {
  REDIS_KEYS,
  countRecords,
  getRedis,
  redisConfigError,
  redisConfigured,
} from "./redis-shared.mjs";

if (!redisConfigured()) {
  console.error(`Redis is not configured.\n\n${redisConfigError()}`);
  process.exit(1);
}

const redis = getRedis();

try {
  await redis.ping();
} catch (error) {
  console.error("Redis ping failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log("Redis connection OK\n");

for (const { key } of REDIS_KEYS) {
  const data = await redis.get(key);
  const count = countRecords(key, data);
  const status = data == null ? "empty" : `${count} record(s)`;
  console.log(`  ${key.padEnd(14)} ${status}`);
}
