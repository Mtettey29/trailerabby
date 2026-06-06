import type { AppUser, UserRole, UserStatus } from "./types";
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from "./types";

export type UserPageFilters = {
  search: string;
  role: UserRole | "all";
  status: UserStatus | "all";
  location: string;
};

export const DEFAULT_USER_PAGE_FILTERS: UserPageFilters = {
  search: "",
  role: "all",
  status: "all",
  location: "all",
};

export const USER_ROLE_CLASS: Record<UserRole, string> = {
  administrator: "border border-[#7856ff]/30 bg-[#7856ff]/10 text-[#c4b5fd]",
  dispatcher: "border border-[#1d9bf0]/30 bg-[#1d9bf0]/10 text-[#1d9bf0]",
  maintenance_manager:
    "border border-[#ffad1f]/30 bg-[#ffad1f]/10 text-[#ffad1f]",
  driver: "border border-[#00ba7c]/30 bg-[#00ba7c]/10 text-[#00ba7c]",
  viewer: "border border-[#2f3336] bg-[#16181c] text-[#71767b]",
};

export const USER_STATUS_CLASS: Record<UserStatus, string> = {
  active: "border border-[#00ba7c]/30 bg-[#00ba7c]/10 text-[#00ba7c]",
  inactive: "border border-[#f4212e]/30 bg-[#f4212e]/10 text-[#f4212e]",
};

export function userStats(users: AppUser[]) {
  const total = users.length;
  const active = users.filter((user) => user.status === "active").length;
  const administrators = users.filter(
    (user) => user.role === "administrator"
  ).length;
  const dispatchers = users.filter((user) => user.role === "dispatcher").length;
  const drivers = users.filter((user) => user.role === "driver").length;
  const viewers = users.filter((user) => user.role === "viewer").length;

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return {
    total,
    active,
    administrators,
    dispatchers,
    drivers,
    viewers,
    activePct: pct(active),
    administratorsPct: pct(administrators),
    dispatchersPct: pct(dispatchers),
    driversPct: pct(drivers),
    viewersPct: pct(viewers),
  };
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatUserLastLogin(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatJoinedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function uniqueUserLocations(users: AppUser[]): string[] {
  const values = new Set<string>();
  for (const user of users) {
    const location = user.location.trim();
    if (location) values.add(location);
  }
  return [...values].sort();
}

export function applyUserFilters(
  users: AppUser[],
  filters: UserPageFilters
): AppUser[] {
  const search = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    if (filters.role !== "all" && user.role !== filters.role) {
      return false;
    }
    if (filters.status !== "all" && user.status !== filters.status) {
      return false;
    }
    if (filters.location !== "all" && user.location.trim() !== filters.location) {
      return false;
    }
    if (!search) return true;

    const haystack = [
      user.name,
      user.email,
      user.phone,
      user.location,
      ...user.locationAccess,
      USER_ROLE_LABELS[user.role],
      USER_STATUS_LABELS[user.status],
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}
