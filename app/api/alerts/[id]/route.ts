import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { deleteAlert, updateAlert } from "@/lib/alerts";
import type { SystemAlertUpdate } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as SystemAlertUpdate;
    const alert = await updateAlert(id, body);
    return NextResponse.json({ alert });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update alert";
    const status =
      message === "Alert not found"
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
    await deleteAlert(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete alert";
    const status = message === "Alert not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
