import { Redis } from "@upstash/redis";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AppSettings, AppSettingsUpdate, CompanySettings } from "./types";

const KV_KEY = "settings";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "settings.json");

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
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
};

export const DEFAULT_SETTINGS: AppSettings = {
  company: DEFAULT_COMPANY_SETTINGS,
  updatedAt: new Date().toISOString(),
};

function redisConfigured(): boolean {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return Boolean(url && token);
}

function getRedis(): Redis {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL!;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN!;
  return new Redis({ url, token });
}

function mergeSettings(
  current: AppSettings,
  update: AppSettingsUpdate
): AppSettings {
  return {
    company: {
      ...current.company,
      ...update.company,
    },
    updatedAt: new Date().toISOString(),
  };
}

async function readLocalSettings(): Promise<AppSettings | null> {
  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AppSettings;
    if (!parsed?.company) return null;
    return {
      company: { ...DEFAULT_COMPANY_SETTINGS, ...parsed.company },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function writeLocalSettings(settings: AppSettings): Promise<void> {
  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

async function readAll(): Promise<AppSettings> {
  if (redisConfigured()) {
    const redis = getRedis();
    const data = await redis.get<AppSettings>(KV_KEY);
    if (!data?.company) return { ...DEFAULT_SETTINGS };
    return {
      company: { ...DEFAULT_COMPANY_SETTINGS, ...data.company },
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    };
  }

  const local = await readLocalSettings();
  return local ?? { ...DEFAULT_SETTINGS };
}

async function writeAll(settings: AppSettings): Promise<void> {
  if (redisConfigured()) {
    const redis = getRedis();
    await redis.set(KV_KEY, settings);
    return;
  }
  await writeLocalSettings(settings);
}

export async function getSettings(): Promise<AppSettings> {
  return readAll();
}

export async function updateSettings(
  update: AppSettingsUpdate
): Promise<AppSettings> {
  const current = await readAll();
  const next = mergeSettings(current, update);
  await writeAll(next);
  return next;
}
