import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", ".data", "trailers.json");
const csvPath = path.join(
  __dirname,
  "..",
  "The Little Abby Company, LLC_Transaction Report (2).xlsx - Fixed Assets (1).csv"
);

/** Dispatch state layered on the fixed-asset register */
const DISPATCH_BY_NUMBER = {
  HT367630: { status: "outbound", driver: "Tylance", location: "" },
  JR112396: { status: "outbound", driver: "Brandon", location: "" },
  GT003879: { status: "outbound", driver: "Nimoy", location: "" },
  154446: { status: "outbound", driver: "Brandon", location: "" },
  53595: { status: "onsite", driver: "Nimoy", location: "" },
  GT003218: { status: "onsite", driver: "", location: "" },
  282218: { status: "onsite", driver: "", location: "" },
  282232: { status: "onsite", driver: "", location: "" },
  282792: { status: "onsite", driver: "Aubrey", location: "Nanticoke, PA" },
  281409: { status: "onsite", driver: "", location: "Hanover, MD" },
};

function parseBool(value) {
  return String(value ?? "").trim().toUpperCase() === "TRUE";
}

function rowToTrailer(headers, values) {
  const row = Object.fromEntries(
    headers.map((header, index) => [header.trim(), (values[index] ?? "").trim()])
  );

  const trailerNumber = row["No."];
  const dispatch = DISPATCH_BY_NUMBER[trailerNumber] ?? {
    status: "onsite",
    driver: "",
    location: "",
  };

  const vehicleYear = Number.parseInt(row["Vehicle Year"], 10);

  return {
    id: `asset-${trailerNumber.toLowerCase()}`,
    trailerNumber,
    status: dispatch.status,
    driver: dispatch.driver,
    location: dispatch.location,
    notes: row["Description 2"] || "",
    updatedAt: new Date().toISOString(),
    description: row["Description"] || "",
    vin: row["Serial No."] || "",
    licensePlate: row["Vehicle License Plate"] || "",
    vehicleYear: Number.isNaN(vehicleYear) ? 0 : vehicleYear,
    locationCode: row["Location Code"] || "",
    customerName: row["On Rent Sell-to Customer Name"] || "",
    trackingSerialNo: row["Tracking Serial No."] || "",
    description2: row["Description 2"] || "",
    manufacturer: row["Manufacturer Code"] || "",
    onRent: parseBool(row["On Rent"]),
    inService: parseBool(row["In-Service"]),
    blocked: parseBool(row["Blocked"]),
    disposed: parseBool(row["Disposed"]),
    acquired: parseBool(row["Acquired"]),
    customerNo: row["On Rent Sell-to Customer No."] || "",
    branchCode: row["Branch Code"] || "",
    doorType: row["Door Type"] || "",
    condition: row["Condition"] || "",
    suspension: row["Suspension"] || "",
    eTrack: parseBool(row["E-Track"]),
    logPost: parseBool(row["Log Post"]),
    roof: row["Roof"] || "",
  };
}

const csv = await readFile(csvPath, "utf-8");
const lines = csv.trim().split(/\r?\n/);
const headers = lines[0].split(",");
const trailers = lines
  .slice(1)
  .filter((line) => line.trim().length > 0)
  .map((line) => rowToTrailer(headers, line.split(",")));

await mkdir(path.dirname(dataPath), { recursive: true });
await writeFile(dataPath, JSON.stringify(trailers, null, 2), "utf-8");
console.log(`Seeded ${trailers.length} trailers from fixed assets CSV to ${dataPath}`);
