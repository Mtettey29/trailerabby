import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  canAccessSettings,
  canManageUsers,
  canMutate,
  isStaff,
} from "@/lib/permissions";
import type { AppUser, UserRole } from "@/lib/types";

type AuthOptions = {
  roles?: UserRole[];
  write?: boolean;
  settings?: boolean;
  users?: boolean;
  /** Dispatch staff only — blocks guest viewer role */
  staff?: boolean;
};

export async function requireApiUser(
  options: AuthOptions = {}
): Promise<AppUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (options.staff && !isStaff(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (options.write && !canMutate(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (options.settings && !canAccessSettings(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (options.users && !canManageUsers(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (options.roles && !options.roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}
