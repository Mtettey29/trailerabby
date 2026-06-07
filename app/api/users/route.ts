import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { inviteClerkUser } from "@/lib/clerk-roster";
import { enrichUsersWithClerk } from "@/lib/user-clerk";
import { createUser, listUsers } from "@/lib/users";
import type { AppUserInput } from "@/lib/types";

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export async function GET() {
  const authResult = await requireApiUser({ users: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const users = await listUsers();
    const enriched = await enrichUsersWithClerk(users);
    return NextResponse.json({ users: enriched });
  } catch (error) {
    console.error("GET /api/users", error);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiUser({ users: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await request.json()) as AppUserInput & {
      sendClerkInvite?: boolean;
    };
    const user = await createUser(body);

    let clerkInvite: string | null = null;
    if (body.sendClerkInvite !== false) {
      const result = await inviteClerkUser(
        user.email,
        `${appBaseUrl()}${process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/"}`
      );
      clerkInvite = result.status;
    }

    const [enriched] = await enrichUsersWithClerk([user]);
    return NextResponse.json({ user: enriched, clerkInvite }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create user";
    const status = message.includes("required") || message.includes("Invalid")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
