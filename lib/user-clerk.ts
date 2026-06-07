import type { User } from "@clerk/backend";
import type { AppUser, AppUserView } from "./types";
import {
  clerkDisplayName,
  clerkProfileFromUser,
  getClerkProfilesByEmail,
  type ClerkProfileSummary,
} from "./clerk-roster";

const EMPTY_CLERK: ClerkProfileSummary = {
  clerkUserId: null,
  imageUrl: null,
  clerkStatus: "none",
  clerkLastSignInAt: null,
};

export function mergeUserWithClerk(
  user: AppUser,
  profile: ClerkProfileSummary
): AppUserView {
  return {
    ...user,
    clerkUserId: profile.clerkUserId ?? user.clerkUserId,
    imageUrl: profile.imageUrl,
    clerkStatus: profile.clerkStatus,
    clerkLastSignInAt: profile.clerkLastSignInAt,
  };
}

export async function enrichUsersWithClerk(
  users: AppUser[]
): Promise<AppUserView[]> {
  const profiles = await getClerkProfilesByEmail(users.map((u) => u.email));
  return users.map((user) => {
    const key = user.email.toLowerCase().trim();
    const profile = profiles.get(key) ?? EMPTY_CLERK;
    return mergeUserWithClerk(user, profile);
  });
}

export function syncFieldsFromClerk(
  appUser: AppUser,
  clerkUser: User
): Partial<AppUser> {
  const updates: Partial<AppUser> = {
    clerkUserId: clerkUser.id,
  };

  const clerkName = clerkDisplayName(clerkUser).trim();
  if (clerkName && clerkName !== appUser.name) {
    updates.name = clerkName;
  }

  const clerkEmail =
    clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
  if (clerkEmail && clerkEmail !== appUser.email.toLowerCase().trim()) {
    updates.email = clerkEmail;
  }

  const lastSignIn = clerkProfileFromUser(clerkUser).clerkLastSignInAt;
  if (lastSignIn) {
    updates.lastLoginAt = lastSignIn;
  }

  return updates;
}
