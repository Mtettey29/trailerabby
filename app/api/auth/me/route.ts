import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGuestSessionUser } from "@/lib/auth";
import { clerkProfileFromUser } from "@/lib/clerk-roster";
import { resolveAppUserForClerk } from "@/lib/sync-session-user";
import { mergeUserWithClerk } from "@/lib/user-clerk";

export async function GET() {
  const guest = await getGuestSessionUser();
  if (guest) {
    return NextResponse.json({
      user: {
        ...guest,
        imageUrl: null,
        clerkStatus: "none" as const,
        clerkLastSignInAt: null,
      },
    });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUser = await resolveAppUserForClerk(clerkUser);
  if (!appUser) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const profile = clerkProfileFromUser(clerkUser);
  return NextResponse.json({
    user: mergeUserWithClerk(appUser, profile),
  });
}
