import type { User } from "@clerk/backend";
import { getUserByEmail, updateUser } from "./users";
import { syncFieldsFromClerk } from "./user-clerk";
import type { AppUser } from "./types";

export async function resolveAppUserForClerk(
  clerkUser: User
): Promise<AppUser | null> {
  const email =
    clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
  if (!email) return null;

  const appUser = await getUserByEmail(email);
  if (!appUser || appUser.status !== "active") return null;

  const patch = syncFieldsFromClerk(appUser, clerkUser);
  const needsUpdate =
    patch.clerkUserId !== appUser.clerkUserId ||
    (patch.name !== undefined && patch.name !== appUser.name) ||
    (patch.lastLoginAt !== undefined &&
      patch.lastLoginAt.slice(0, 10) !== appUser.lastLoginAt.slice(0, 10));

  if (!needsUpdate) return appUser;

  try {
    return await updateUser(appUser.id, patch);
  } catch {
    return { ...appUser, ...patch };
  }
}
