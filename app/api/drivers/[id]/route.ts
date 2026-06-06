import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { deleteDriver, updateDriver } from "@/lib/drivers";
import type { DriverUpdate } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as DriverUpdate;
    const driver = await updateDriver(id, body);
    return NextResponse.json({ driver });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update driver";
    const status =
      message === "Driver not found"
        ? 404
        : message.includes("Invalid")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    await deleteDriver(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete driver";
    const status = message === "Driver not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
