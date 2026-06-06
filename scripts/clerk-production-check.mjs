import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

async function loadEnv(filePath) {
  const env = {};
  try {
    const raw = await readFile(filePath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    // missing file
  }
  return env;
}

function modeForKey(key) {
  if (key.startsWith("pk_live_") || key.startsWith("sk_live_")) return "production";
  if (key.startsWith("pk_test_") || key.startsWith("sk_test_")) return "development";
  return "unknown";
}

const env = await loadEnv(envPath);
const pk = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const sk = env.CLERK_SECRET_KEY ?? "";

if (!pk || !sk) {
  console.error("Missing Clerk keys in .env.local");
  process.exit(1);
}

const pkMode = modeForKey(pk);
const skMode = modeForKey(sk);

if (pkMode === "production" && skMode === "production") {
  console.log("Clerk keys: production (pk_live_ / sk_live_)");
  process.exit(0);
}

console.error("Clerk is still on DEVELOPMENT keys:");
console.error(`  publishable: ${pkMode} (${pk.slice(0, 12)}…)`);
console.error(`  secret:      ${skMode} (${sk.slice(0, 10)}…)`);
console.error("");
console.error("Switch to production:");
console.error("  1. Clerk Dashboard → toggle Development → Production");
console.error("  2. API Keys → copy pk_live_ and sk_live_");
console.error("  3. Paste into .env.local and Vercel Production env vars");
console.error("  4. Set NEXT_PUBLIC_APP_URL to your live site URL");
console.error("  5. npm run clerk:setup   (re-create prod users)");
console.error("  6. Restart npm run dev");
process.exit(1);
