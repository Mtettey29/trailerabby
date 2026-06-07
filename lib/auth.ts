import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import {
  GUEST_VIEW_COOKIE,
  GUEST_VIEWER_USER,
  verifyGuestViewToken,
} from "./guest-token";
import { resolveAppUserForClerk } from "./sync-session-user";
import type { AppUser } from "./types";

export async function getGuestSessionUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_VIEW_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyGuestViewToken(token);
  if (!payload) return null;

  return GUEST_VIEWER_USER;
}

export async function getSessionUser(): Promise<AppUser | null> {
  const guest = await getGuestSessionUser();
  if (guest) return guest;

  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  return resolveAppUserForClerk(clerkUser);
}
