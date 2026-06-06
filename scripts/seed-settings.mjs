import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", ".data", "settings.json");

const ts = new Date().toISOString();

const settings = {
  company: {
    companyName: "Reynolds Logistics",
    legalName: "Reynolds Logistics LLC",
    industry: "Logistics & Transportation",
    phone: "(410) 555-2000",
    address: "1200 Industrial Blvd\nHanover, MD 21076",
    companyEmail: "dispatch@reynoldslogistics.com",
    website: "www.reynoldslogistics.com",
    timezone: "(GMT-05:00) Eastern Time (US & Canada)",
    currency: "USD - US Dollar",
    companyDescription:
      "Regional trailer dispatch and fleet coordination for mid-Atlantic operations.",
    logoUrl: "",
    supportEmail: "support@reynoldslogistics.com",
    supportPhone: "(410) 555-2001",
    billingEmail: "billing@reynoldslogistics.com",
    emergencyPhone: "(410) 555-2099",
    businessDays: "Monday - Friday",
    businessStartTime: "08:00",
    businessEndTime: "17:00",
    is24x7: false,
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12-hour",
    language: "English (US)",
    defaultLocation: "Hanover, MD",
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    primaryColor: "#1d9bf0",
  },
  updatedAt: ts,
};

await mkdir(path.dirname(dataPath), { recursive: true });
await writeFile(dataPath, JSON.stringify(settings, null, 2), "utf-8");
console.log(`Seeded settings to ${dataPath}`);
