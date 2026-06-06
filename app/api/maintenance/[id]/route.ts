import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import {
  deleteMaintenanceService,
  updateMaintenanceService,
} from "@/lib/maintenance";
import type { MaintenanceServiceUpdate } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as MaintenanceServiceUpdate;
    const service = await updateMaintenanceService(id, body);
    return NextResponse.json({ service });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update service";
    const status =
      message === "Maintenance service not found"
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
    await deleteMaintenanceService(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete service";
    const status =
      message === "Maintenance service not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
