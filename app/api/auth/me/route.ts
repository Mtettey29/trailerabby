import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getGuestSessionUser } from "@/lib/auth";
import { getUserByEmail, updateUser } from "@/lib/users";

export async function GET() {
  const guest = await getGuestSessionUser();
  if (guest) {
    return NextResponse.json({ user: guest });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "No email on account" }, { status: 403 });
  }

  const appUser = await getUserByEmail(email);
  if (!appUser || appUser.status !== "active") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const now = new Date().toISOString();
  if (appUser.lastLoginAt.slice(0, 10) !== now.slice(0, 10)) {
    try {
      const updated = await updateUser(appUser.id, { lastLoginAt: now });
      return NextResponse.json({ user: updated });
    } catch {
      return NextResponse.json({ user: appUser });
    }
  }

  return NextResponse.json({ user: appUser });
}
