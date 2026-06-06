import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { createUser, listUsers } from "@/lib/users";
import type { AppUserInput } from "@/lib/types";

export async function GET() {
  const authResult = await requireApiUser({ users: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const users = await listUsers();
    return NextResponse.json({ users });
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
    const body = (await request.json()) as AppUserInput;
    const user = await createUser(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create user";
    const status = message.includes("required") || message.includes("Invalid")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
