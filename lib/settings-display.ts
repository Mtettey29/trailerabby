import type { CompanySettings } from "./types";

export type SettingsSectionId =
  | "company"
  | "trailers"
  | "movements"
  | "maintenance"
  | "notifications"
  | "integrations"
  | "security"
  | "audit";

export type CompanyTabId =
  | "company_info"
  | "localization"
  | "preferences"
  | "branding";

export function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatTime12h(value: string): string {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number.parseInt(hoursRaw ?? "", 10);
  const minutes = minutesRaw ?? "00";
  if (Number.isNaN(hours)) return value;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
}

export function hasCompanyChanges(
  current: CompanySettings,
  draft: CompanySettings
): boolean {
  return JSON.stringify(current) !== JSON.stringify(draft);
}
