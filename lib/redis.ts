import { Redis } from "@upstash/redis";

export function redisConfigured(): boolean {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL ??
    ""
  ).trim();
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    ""
  ).trim();
  return Boolean(url && token);
}

export function getRedis(): Redis {
  return Redis.fromEnv();
}
