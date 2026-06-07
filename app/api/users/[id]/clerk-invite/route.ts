import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { inviteClerkUser } from "@/lib/clerk-roster";
import { enrichUsersWithClerk } from "@/lib/user-clerk";
import { listUsers } from "@/lib/users";

type RouteContext = { params: Promise<{ id: string }> };

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireApiUser({ users: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    const user = (await listUsers()).find((u) => u.id === id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await inviteClerkUser(
      user.email,
      `${appBaseUrl()}${process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/"}`
    );

    const [enriched] = await enrichUsersWithClerk([user]);
    return NextResponse.json({ user: enriched, clerkInvite: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send invite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
