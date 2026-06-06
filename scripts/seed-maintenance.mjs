import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", ".data", "maintenance.json");

const ts = new Date().toISOString();

const services = [
  {
    id: "maint-282218-dot",
    trailerNumber: "282218",
    serviceType: "dot_inspection",
    dueDate: "2026-06-07T12:00:00.000Z",
    status: "due_soon",
    priority: "high",
    technician: "Mike Reynolds",
    cost: 450,
    notes: "",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "maint-53595-brake",
    trailerNumber: "53595",
    serviceType: "brake_service",
    dueDate: "2026-06-03T12:00:00.000Z",
    status: "overdue",
    priority: "high",
    technician: "Sarah Kim",
    cost: 1200,
    notes: "Rear brake pads",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "maint-ht367630-tire",
    trailerNumber: "HT367630",
    serviceType: "tire_service",
    dueDate: "2026-06-10T12:00:00.000Z",
    status: "scheduled",
    priority: "medium",
    technician: "Mike Reynolds",
    cost: 890,
    notes: "",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "maint-jr112396-annual",
    trailerNumber: "JR112396",
    serviceType: "annual_inspection",
    dueDate: "2026-06-12T12:00:00.000Z",
    status: "scheduled",
    priority: "medium",
    technician: "",
    cost: 350,
    notes: "",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "maint-gt003218-repair",
    trailerNumber: "GT003218",
    serviceType: "general_repair",
    dueDate: "2026-06-05T12:00:00.000Z",
    status: "due_soon",
    priority: "low",
    technician: "Sarah Kim",
    cost: 675,
    notes: "Door latch adjustment",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "maint-154446-brake",
    trailerNumber: "154446",
    serviceType: "brake_service",
    dueDate: "2026-06-15T12:00:00.000Z",
    status: "scheduled",
    priority: "low",
    technician: "",
    cost: 980,
    notes: "",
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: "maint-282792-dot",
    trailerNumber: "282792",
    serviceType: "dot_inspection",
    dueDate: "2026-05-28T12:00:00.000Z",
    status: "completed",
    priority: "medium",
    technician: "Mike Reynolds",
    cost: 425,
    notes: "Passed inspection",
    createdAt: "2026-05-20T12:00:00.000Z",
    updatedAt: "2026-05-28T14:00:00.000Z",
  },
  {
    id: "maint-281409-tire",
    trailerNumber: "281409",
    serviceType: "tire_service",
    dueDate: "2026-05-15T12:00:00.000Z",
    status: "completed",
    priority: "high",
    technician: "Sarah Kim",
    cost: 1100,
    notes: "Replaced steer tires",
    createdAt: "2026-05-10T12:00:00.000Z",
    updatedAt: "2026-05-15T16:00:00.000Z",
  },
];

await mkdir(path.dirname(dataPath), { recursive: true });
await writeFile(dataPath, JSON.stringify(services, null, 2), "utf-8");
console.log(`Seeded ${services.length} maintenance services to ${dataPath}`);
