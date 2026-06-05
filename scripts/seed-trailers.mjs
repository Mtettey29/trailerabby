import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", ".data", "trailers.json");

const trailers = [
  {
    id: "ms-out-ht367630",
    trailerNumber: "HT367630",
    status: "outbound",
    driver: "Tylance",
    location: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ms-out-jr112396",
    trailerNumber: "JR112396",
    status: "outbound",
    driver: "Brandon",
    location: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ms-out-gt003879",
    trailerNumber: "GT003879",
    status: "outbound",
    driver: "Nimoy",
    location: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ms-out-154446",
    trailerNumber: "154446",
    status: "outbound",
    driver: "Brandon",
    location: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ms-on-53595",
    trailerNumber: "53595",
    status: "onsite",
    driver: "Nimoy",
    location: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ms-on-gt003218",
    trailerNumber: "GT003218",
    status: "onsite",
    driver: "",
    location: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ms-on-282218",
    trailerNumber: "282218",
    status: "onsite",
    driver: "",
    location: "",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ms-on-282792",
    trailerNumber: "282792",
    status: "onsite",
    driver: "Aubrey",
    location: "Nanticoke, PA",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ms-on-281409",
    trailerNumber: "281409",
    status: "onsite",
    driver: "",
    location: "Hanover, MD",
    notes: "",
    updatedAt: new Date().toISOString(),
  },
];

await mkdir(path.dirname(dataPath), { recursive: true });
await writeFile(dataPath, JSON.stringify(trailers, null, 2), "utf-8");
console.log(`Seeded ${trailers.length} trailers to ${dataPath}`);
