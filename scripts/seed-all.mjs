import { spawnSync } from "node:child_process";

const seeds = [
  "seed",
  "seed:users",
  "seed:locations",
  "seed:drivers",
  "seed:alerts",
  "seed:maintenance",
  "seed:settings",
];

for (const script of seeds) {
  console.log(`\n→ npm run ${script}`);
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nAll local .data seeds complete.");
