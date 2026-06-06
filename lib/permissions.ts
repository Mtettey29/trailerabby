import type { UserRole } from "./types";

export function isStaff(role: UserRole): boolean {
  return role !== "viewer";
}

export function canMutate(role: UserRole): boolean {
  return isStaff(role);
}

export function canManageUsers(role: UserRole): boolean {
  return role === "administrator";
}

export function canAccessSettings(role: UserRole): boolean {
  return role === "administrator";
}

/** Routes a signed-in role may open in the browser */
export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (role === "administrator") return true;

  if (role === "viewer") {
    if (pathname === "/settings") return false;
    if (pathname === "/users" || pathname.startsWith("/users/")) return false;
    return true;
  }

  // dispatcher — operations without user admin or settings
  if (pathname === "/users" || pathname.startsWith("/users/")) return false;
  if (pathname === "/settings") return false;
  return true;
}

export function filterNavForRole<T extends { url: string }>(
  items: T[],
  role: UserRole
): T[] {
  return items.filter((item) => {
    const path = item.url.split("?")[0]?.split("#")[0] ?? item.url;
    const normalized = path.startsWith("/#") ? "/" : path;
    return canAccessPath(role, normalized);
  });
}
