import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", ".data", "locations.json");

const ts = new Date().toISOString();

function usLocation(id, city, state, type, latitude, longitude, status = "active") {
  return {
    id,
    name: `${city}, ${state}`,
    type,
    status,
    addressLine1: "",
    addressLine2: "",
    city,
    state,
    zip: "",
    latitude,
    longitude,
    updatedAt: ts,
  };
}

const locations = [
  usLocation("loc-nanticoke-pa", "Nanticoke", "PA", "yard", 41.2053, -76.0049),
  usLocation("loc-hanover-md", "Hanover", "MD", "yard", 39.1929, -76.7241),
  usLocation("loc-baltimore-md", "Baltimore", "MD", "yard", 39.2904, -76.6122),
  usLocation("loc-philadelphia-pa", "Philadelphia", "PA", "customer", 39.9526, -75.1652),
  usLocation("loc-richmond-va", "Richmond", "VA", "customer", 37.5407, -77.436),
  usLocation("loc-charlotte-nc", "Charlotte", "NC", "customer", 35.2271, -80.8431),
  usLocation("loc-atlanta-ga", "Atlanta", "GA", "yard", 33.749, -84.388),
  usLocation("loc-jacksonville-fl", "Jacksonville", "FL", "customer", 30.3322, -81.6557),
  usLocation("loc-memphis-tn", "Memphis", "TN", "yard", 35.1495, -90.049),
  usLocation("loc-nashville-tn", "Nashville", "TN", "customer", 36.1627, -86.7816),
  usLocation("loc-louisville-ky", "Louisville", "KY", "customer", 38.2527, -85.7585),
  usLocation("loc-indianapolis-in", "Indianapolis", "IN", "yard", 39.7684, -86.1581),
  usLocation("loc-columbus-oh", "Columbus", "OH", "customer", 39.9612, -82.9988),
  usLocation("loc-chicago-il", "Chicago", "IL", "yard", 41.8781, -87.6298),
  usLocation("loc-kansas-city-mo", "Kansas City", "MO", "yard", 39.0997, -94.5786),
  usLocation("loc-dallas-tx", "Dallas", "TX", "customer", 32.7767, -96.797),
  usLocation("loc-houston-tx", "Houston", "TX", "customer", 29.7604, -95.3698),
  usLocation("loc-denver-co", "Denver", "CO", "yard", 39.7392, -104.9903),
  usLocation("loc-phoenix-az", "Phoenix", "AZ", "customer", 33.4484, -112.074),
  usLocation("loc-los-angeles-ca", "Los Angeles", "CA", "customer", 34.0522, -118.2437),
  usLocation("loc-seattle-wa", "Seattle", "WA", "yard", 47.6062, -122.3321),
  usLocation("loc-salt-lake-city-ut", "Salt Lake City", "UT", "other", 40.7608, -111.891),
  usLocation("loc-omaha-ne", "Omaha", "NE", "yard", 41.2565, -95.9345),
  usLocation("loc-st-louis-mo", "St. Louis", "MO", "customer", 38.627, -90.1994, "inactive"),
];

await mkdir(path.dirname(dataPath), { recursive: true });
await writeFile(dataPath, JSON.stringify(locations, null, 2), "utf-8");
console.log(`Seeded ${locations.length} locations to ${dataPath}`);
