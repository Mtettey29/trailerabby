import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { deleteUser, updateUser } from "@/lib/users";
import type { AppUserUpdate } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireApiUser({ users: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as AppUserUpdate;
    const user = await updateUser(id, body);
    return NextResponse.json({ user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update user";
    const status =
      message === "User not found"
        ? 404
        : message.includes("Invalid")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireApiUser({ users: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete user";
    const status = message === "User not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
