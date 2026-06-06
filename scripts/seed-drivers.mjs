import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", ".data", "drivers.json");

const ts = new Date().toISOString();

const drivers = [
  {
    id: "drv-tylance",
    name: "Tylance",
    driverId: "DRV-1001",
    phone: "",
    status: "on_duty",
    currentAssignment: "",
    lastActiveAt: ts,
    updatedAt: ts,
  },
  {
    id: "drv-brandon",
    name: "Brandon",
    driverId: "DRV-1002",
    phone: "",
    status: "on_duty",
    currentAssignment: "",
    lastActiveAt: ts,
    updatedAt: ts,
  },
  {
    id: "drv-nimoy",
    name: "Nimoy",
    driverId: "DRV-1003",
    phone: "",
    status: "on_duty",
    currentAssignment: "",
    lastActiveAt: ts,
    updatedAt: ts,
  },
  {
    id: "drv-aubrey",
    name: "Aubrey",
    driverId: "DRV-1004",
    phone: "",
    status: "on_duty",
    currentAssignment: "",
    lastActiveAt: ts,
    updatedAt: ts,
  },
];

await mkdir(path.dirname(dataPath), { recursive: true });
await writeFile(dataPath, JSON.stringify(drivers, null, 2), "utf-8");
console.log(`Seeded ${drivers.length} drivers to ${dataPath}`);
